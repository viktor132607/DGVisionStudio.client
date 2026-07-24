import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { createAdminClientGallery } from "../../services/clientGalleries"
import { apiFetch } from "../../services/api"
import { useAdminToast } from "../../hooks/useAdminToast"

type AdminUserOption = {
    id: string
    email: string
}

function normalizeText(value?: string | null) {
    return (value || "").trim().toLowerCase()
}

function findLabel(form: HTMLFormElement, labels: string[]) {
    const normalizedLabels = labels.map(normalizeText)

    return Array.from(form.querySelectorAll("label")).find((label) => {
        const text = normalizeText(label.textContent)
        return normalizedLabels.some((candidate) => text === candidate || text.startsWith(candidate))
    }) || null
}

function findControl<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    form: HTMLFormElement,
    labels: string[],
    selector: string
) {
    const label = findLabel(form, labels)
    if (!label) return null

    return label.parentElement?.querySelector<T>(selector) || label.querySelector<T>(selector) || null
}

function getSelectedUserAccesses(form: HTMLFormElement, users: AdminUserOption[]) {
    const section = Array.from(form.querySelectorAll("section")).find((item) => {
        const heading = item.querySelector("h2")
        const text = normalizeText(heading?.textContent)
        return text === "достъп на потребители" || text === "user access"
    })

    if (!section) return []

    const usersByEmail = new Map(users.map((user) => [normalizeText(user.email), user]))
    const accesses: Array<{
        userId: string
        email: string
        previewEnabled: boolean
        downloadEnabled: boolean
    }> = []

    section.querySelectorAll<HTMLElement>("div.rounded-2xl.border").forEach((card) => {
        const emailElement = Array.from(card.querySelectorAll("span")).find((span) =>
            (span.textContent || "").includes("@")
        )
        const email = emailElement?.textContent?.trim() || ""
        const user = usersByEmail.get(normalizeText(email))
        const checkboxes = card.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

        if (!user || checkboxes.length < 2) return

        accesses.push({
            userId: user.id,
            email: user.email,
            previewEnabled: checkboxes[0].checked,
            downloadEnabled: checkboxes[1].checked,
        })
    })

    return accesses
}

export default function EmptyAlbumSubmitBridge() {
    const navigate = useNavigate()
    const { showToast } = useAdminToast()
    const busyRef = useRef(false)

    useEffect(() => {
        const handleSubmitCapture = (event: SubmitEvent) => {
            const form = event.target
            if (!(form instanceof HTMLFormElement)) return
            if (window.location.pathname !== "/admin/client-galleries/new") return

            const hasNoPhotos = Array.from(form.querySelectorAll("div")).some((element) => {
                const text = element.textContent?.trim()
                return text === "Още няма снимки." || text === "No photos yet."
            })

            if (!hasNoPhotos) return

            event.preventDefault()
            event.stopImmediatePropagation()

            if (busyRef.current) return
            busyRef.current = true

            const submitButton = event.submitter instanceof HTMLButtonElement
                ? event.submitter
                : form.querySelector<HTMLButtonElement>('button[type="submit"]')
            const originalButtonText = submitButton?.textContent || ""

            if (submitButton) {
                submitButton.disabled = true
                submitButton.textContent = "Запазване..."
            }

            void (async () => {
                try {
                    const titleInput = findControl<HTMLInputElement>(
                        form,
                        ["Име на български", "Bulgarian title"],
                        "input"
                    )
                    const titleEnInput = findControl<HTMLInputElement>(
                        form,
                        ["Име на английски", "English title"],
                        "input"
                    )
                    const descriptionInput = findControl<HTMLTextAreaElement>(
                        form,
                        ["Описание", "Description"],
                        "textarea"
                    )
                    const galleryTypeSelect = findControl<HTMLSelectElement>(
                        form,
                        ["Тип галерия", "Gallery type"],
                        "select"
                    )
                    const statusSelect = findControl<HTMLSelectElement>(
                        form,
                        ["Статус", "Status"],
                        "select"
                    )

                    const title = titleInput?.value.trim() || ""
                    const titleEn = titleEnInput?.value.trim() || ""
                    const description = descriptionInput?.value.trim() || ""
                    const visibilityRadio = form.querySelector<HTMLInputElement>(
                        'input[name="album-visibility"]:checked'
                    )
                    const visibilityText = normalizeText(visibilityRadio?.closest("label")?.textContent)
                    const isPublic = visibilityText.includes("публичен") || visibilityText.includes("public")
                    const categorySelect = findControl<HTMLSelectElement>(
                        form,
                        ["Категория", "Category"],
                        "select"
                    )
                    const categoryId = categorySelect?.value ? Number(categorySelect.value) : null
                    const publishedLabel = findLabel(form, [
                        "Активен в портфолиото веднага",
                        "Active in portfolio immediately",
                    ])
                    const isPublished = Boolean(
                        publishedLabel?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked
                    )

                    if (!title) {
                        throw new Error("Името на български е задължително.")
                    }

                    if (isPublic && !titleEn) {
                        throw new Error("Името на английски е задължително за публичен албум.")
                    }

                    if (isPublic && !categoryId) {
                        throw new Error("Избери категория за публичен албум.")
                    }

                    const usersResponse = await apiFetch("/admin/client-galleries/users", {
                        method: "GET",
                        skipJsonContentType: true,
                    })
                    const users = usersResponse.ok
                        ? ((await usersResponse.json().catch(() => [])) as AdminUserOption[])
                        : []

                    const created = await createAdminClientGallery({
                        title,
                        titleEn: titleEn || null,
                        description: description || null,
                        isActive: true,
                        isPublic,
                        portfolioCategoryId: isPublic ? categoryId : null,
                        isPublished: isPublic ? isPublished : false,
                        galleryType: (galleryTypeSelect?.value || "Photoshoot") as never,
                        userGalleryStatus: (statusSelect?.value || "PhotoshootUploaded") as never,
                        userAccesses: getSelectedUserAccesses(form, Array.isArray(users) ? users : []),
                    } as never)

                    const createdId = Number(created.id)
                    if (!createdId || !Number.isFinite(createdId)) {
                        throw new Error("Албумът не беше създаден.")
                    }

                    showToast({
                        type: "success",
                        title: "Готово",
                        message: "Празният албум беше създаден успешно.",
                    })
                    navigate(`/admin/client-galleries/edit?id=${createdId}`)
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Албумът не беше създаден."
                    showToast({ type: "error", title: "Грешка", message })

                    if (submitButton) {
                        submitButton.disabled = false
                        submitButton.textContent = originalButtonText || "Запази"
                    }
                    busyRef.current = false
                }
            })()
        }

        document.addEventListener("submit", handleSubmitCapture, true)
        return () => document.removeEventListener("submit", handleSubmitCapture, true)
    }, [navigate, showToast])

    return null
}
