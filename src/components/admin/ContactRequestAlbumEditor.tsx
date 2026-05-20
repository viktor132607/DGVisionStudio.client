import { useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import {
    createAdminClientGallery,
    getAdminClientGalleries,
    grantGalleryAccess,
    uploadGalleryPhoto,
} from "../../services/clientGalleries"
import type { AdminGalleryUserOptionDto, MyClientGalleryDto } from "../../types/clientGallery"

type Props = {
    requestName: string
    requestEmail: string
    requestSubject?: string | null
    requestMessage?: string | null
    users: AdminGalleryUserOptionDto[]
    galleries: MyClientGalleryDto[]
    onGalleriesChange: (items: MyClientGalleryDto[]) => void
    onSuccess: (message: string) => void
    onError: (message: string) => void
}

type Draft = {
    title: string
    titleEn: string
    description: string
    galleryId: number | "new"
    userEmail: string
    previewEnabled: boolean
    downloadEnabled: boolean
}

function defaultTitle(name: string, subject?: string | null) {
    return subject?.trim() || name?.trim() || "Клиентски албум"
}

export default function ContactRequestAlbumEditor({
    requestName,
    requestEmail,
    requestSubject,
    requestMessage,
    users,
    galleries,
    onGalleriesChange,
    onSuccess,
    onError,
}: Props) {
    const [draft, setDraft] = useState<Draft>({
        title: defaultTitle(requestName, requestSubject),
        titleEn: defaultTitle(requestName, requestSubject),
        description: requestMessage || "",
        galleryId: "new",
        userEmail: requestEmail || "",
        previewEnabled: true,
        downloadEnabled: false,
    })
    const [files, setFiles] = useState<File[]>([])
    const [saving, setSaving] = useState(false)

    const selectedGalleryId = useMemo(() => {
        return draft.galleryId === "new" ? null : Number(draft.galleryId)
    }, [draft.galleryId])

    const setField = <K extends keyof Draft>(field: K, value: Draft[K]) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }

    const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
        setFiles(Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/")))
    }

    const refreshGalleries = async () => {
        const next = await getAdminClientGalleries()
        onGalleriesChange(next)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!draft.userEmail.trim()) {
            onError("Избери потребител или въведи email за достъп.")
            return
        }

        if (draft.galleryId === "new" && !draft.title.trim()) {
            onError("Името на албума е задължително.")
            return
        }

        setSaving(true)

        try {
            let galleryId = selectedGalleryId

            if (!galleryId) {
                const created = await createAdminClientGallery({
                    title: draft.title.trim(),
                    titleEn: draft.titleEn.trim() || null,
                    description: draft.description.trim() || null,
                    isActive: true,
                    isPublic: false,
                    isPublished: false,
                    portfolioCategoryId: null,
                    galleryType: "Photoshoot",
                    userGalleryStatus: "PhotoshootUploaded",
                    userAccesses: [],
                })

                galleryId = Number(created.id)
            }

            if (!galleryId || !Number.isFinite(galleryId)) {
                throw new Error("Албумът не беше създаден.")
            }

            await grantGalleryAccess(galleryId, {
                userEmail: draft.userEmail.trim(),
                previewEnabled: draft.previewEnabled,
                downloadEnabled: draft.downloadEnabled,
                downloadExpiresAtUtc: null,
            })

            for (const file of files) {
                await uploadGalleryPhoto(galleryId, file)
            }

            await refreshGalleries()
            setFiles([])
            setDraft((current) => ({ ...current, galleryId }))
            onSuccess("Албумът, достъпът и снимките са записани.")
        } catch (err) {
            onError(err instanceof Error ? err.message : "Записът на албума беше неуспешен.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Албум и достъп</h2>

            <div className="grid gap-4 lg:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Албум
                    <select
                        value={draft.galleryId}
                        onChange={(event) => setField("galleryId", event.target.value === "new" ? "new" : Number(event.target.value))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    >
                        <option value="new">Създай нов албум</option>
                        {galleries.map((gallery) => (
                            <option key={gallery.id} value={gallery.id}>{gallery.title}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Потребител / email за достъп
                    <input
                        list="gallery-access-users"
                        value={draft.userEmail}
                        onChange={(event) => setField("userEmail", event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <datalist id="gallery-access-users">
                        {users.map((user) => <option key={user.id} value={user.email} />)}
                    </datalist>
                </label>

                {draft.galleryId === "new" ? (
                    <>
                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Име BG
                            <input value={draft.title} onChange={(event) => setField("title", event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                        </label>

                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Име EN
                            <input value={draft.titleEn} onChange={(event) => setField("titleEn", event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                        </label>

                        <label className="lg:col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Описание
                            <textarea value={draft.description} onChange={(event) => setField("description", event.target.value)} rows={3} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                        </label>
                    </>
                ) : null}

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <input type="checkbox" checked={draft.previewEnabled} onChange={(event) => setField("previewEnabled", event.target.checked)} />
                    Достъп до преглед
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <input type="checkbox" checked={draft.downloadEnabled} onChange={(event) => setField("downloadEnabled", event.target.checked)} />
                    Достъп до теглене
                </label>

                <label className="lg:col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Качи снимки
                    <input type="file" accept="image/*" multiple onChange={handleFiles} className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                    {files.length ? <span className="text-xs text-gray-500">Избрани снимки: {files.length}</span> : null}
                </label>
            </div>

            <button type="submit" disabled={saving} className="mt-5 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                {saving ? "Запазване..." : "Запази албум / достъп / снимки"}
            </button>
        </form>
    )
}
