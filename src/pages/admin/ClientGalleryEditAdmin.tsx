import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
    createAdminClientGallery,
    deleteGalleryPhoto,
    getAdminClientGalleryById,
    getAdminClientGalleries,
    setGalleryCoverImage,
    updateAdminClientGallery,
    updateGalleryPhoto,
    uploadGalleryPhoto,
} from "../../services/clientGalleries"
import { apiFetch } from "../../services/api"
import type {
    AdminGalleryUserOptionDto,
    ClientPhotoDto,
    MyClientGalleryDto,
} from "../../types/clientGallery"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import AlbumVisibilitySection from "../../components/client-galleries/AlbumVisibilitySection"
import AlbumBulkActionsBar from "../../components/client-galleries/AlbumBulkActionsBar"
import UserAccessSelector, {
    type SelectedUserAccess,
} from "../../components/client-galleries/UserAccessSelector"

type PortfolioCategoryOption = {
    id: number
    name: string
    nameEn?: string | null
    key: string
    isActive: boolean
}

type DraftPhotoItem = {
    localId: string
    id?: number
    previewUrl: string
    originalUrl?: string
    file?: File | null
    altText: string
    caption: string
    displayOrder: number
    isCover: boolean
    isExisting: boolean
    isPublished: boolean
    showInPublicGallery: boolean
    visibleToAllAuthorizedUsers: boolean
    allowedUserIds: string[]
}

const MAX_PHOTO_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024

function createLocalId() {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeText(value?: string | null) {
    return (value || "").trim().toLowerCase()
}

function reorderItems<T extends { displayOrder: number }>(items: T[]) {
    return items.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
    }))
}

export default function ClientGalleryEditAdmin() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [searchParams] = useSearchParams()

    const galleryIdParam = searchParams.get("id")
    const galleryId = galleryIdParam ? Number(galleryIdParam) : null
    const isEditMode = galleryId !== null && Number.isFinite(galleryId)

    const [titleBg, setTitleBg] = useState("")
    const [titleEn, setTitleEn] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(false)
    const [portfolioCategoryId, setPortfolioCategoryId] = useState<number | null>(null)
    const [isPublished, setIsPublished] = useState(true)
    const [isActive, setIsActive] = useState(true)

    const [photos, setPhotos] = useState<DraftPhotoItem[]>([])
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
    const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null)

    const [categories, setCategories] = useState<PortfolioCategoryOption[]>([])
    const [availableUsers, setAvailableUsers] = useState<AdminGalleryUserOptionDto[]>([])
    const [selectedAccesses, setSelectedAccesses] = useState<SelectedUserAccess[]>([])
    const [existingGalleries, setExistingGalleries] = useState<MyClientGalleryDto[]>([])

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)

    const t = isBg
        ? {
              back: "Назад",
              createTitle: "Създаване на албум",
              editTitle: "Редакция на албум",
              gallerySection: "Основни данни",
              titleBg: "Име на български",
              titleEn: "Име на английски",
              description: "Описание",
              titleBgPlaceholder: "Пример: Бал Азра",
              titleEnPlaceholder: "Example: Azra Prom",
              descriptionPlaceholder: "Описание на албума",
              titleRequired: "Името на български е задължително.",
              titleEnRequired: "Името на английски е задължително за публичен албум.",
              categoryRequired: "Избери категория за публичен албум.",
              photosRequired: "Добави поне една снимка.",
              duplicateTitleBg: "Вече съществува албум със същото име на български.",
              duplicateTitleEn: "Вече съществува албум със същото име на английски.",
              photoTooLarge: "Една или повече снимки са над 20MB.",
              invalidPhotoType: "Можеш да качваш само снимки.",
              dropzone: "Качи снимки",
              dropzoneHint:
                  "Плъзни снимки тук, избери файлове или постави директно с Ctrl + V. Максимум 20MB на снимка.",
              chooseFiles: "Избери снимки",
              save: "Запази",
              saving: "Запазване...",
              loading: "Зареждане...",
              createSuccess: "Албумът беше създаден успешно.",
              updateSuccess: "Албумът беше обновен успешно.",
              deleteTitle: "Изтриване на албум",
              deleteDescription: "Сигурен ли си, че искаш да изтриеш този албум?",
              deleteConfirm: "Изтрий",
              cancel: "Отказ",
              active: "Активен албум",
              photos: "Снимки",
              noPhotos: "Още няма снимки.",
              removePhoto: "Премахни снимка",
              setCover: "Основна",
              altText: "Alt текст",
              caption: "Надпис",
              publicState: "В портфолио",
              category: "Категория",
              notAssigned: "Незададено",
              yes: "Да",
              no: "Не",
              enabled: "Включено",
              disabled: "Изключено",
              preview: "Preview",
              download: "Download",
          }
        : {
              back: "Back",
              createTitle: "Create album",
              editTitle: "Edit album",
              gallerySection: "Main details",
              titleBg: "Bulgarian title",
              titleEn: "English title",
              description: "Description",
              titleBgPlaceholder: "Example: Azra Prom",
              titleEnPlaceholder: "Example: Azra Prom",
              descriptionPlaceholder: "Album description",
              titleRequired: "Bulgarian title is required.",
              titleEnRequired: "English title is required for public album.",
              categoryRequired: "Select a category for public album.",
              photosRequired: "Add at least one photo.",
              duplicateTitleBg: "An album with the same Bulgarian title already exists.",
              duplicateTitleEn: "An album with the same English title already exists.",
              photoTooLarge: "One or more photos are larger than 20MB.",
              invalidPhotoType: "Only image files are allowed.",
              dropzone: "Upload photos",
              dropzoneHint:
                  "Drag photos here, choose files, or paste directly with Ctrl + V. Maximum 20MB per photo.",
              chooseFiles: "Choose photos",
              save: "Save",
              saving: "Saving...",
              loading: "Loading...",
              createSuccess: "Album created successfully.",
              updateSuccess: "Album updated successfully.",
              deleteTitle: "Delete album",
              deleteDescription: "Are you sure you want to delete this album?",
              deleteConfirm: "Delete",
              cancel: "Cancel",
              active: "Active album",
              photos: "Photos",
              noPhotos: "No photos yet.",
              removePhoto: "Remove photo",
              setCover: "Cover",
              altText: "Alt text",
              caption: "Caption",
              publicState: "In portfolio",
              category: "Category",
              notAssigned: "Not assigned",
              yes: "Yes",
              no: "No",
              enabled: "Enabled",
              disabled: "Disabled",
              preview: "Preview",
              download: "Download",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"

    const sortedPhotos = useMemo(
        () => [...photos].sort((a, b) => a.displayOrder - b.displayOrder),
        [photos]
    )

    const selectedCategoryName = useMemo(() => {
        const category = categories.find((item) => item.id === portfolioCategoryId)
        if (!category) return t.notAssigned
        return isBg ? category.name : category.nameEn?.trim() || category.name
    }, [categories, portfolioCategoryId, isBg, t.notAssigned])

    const duplicateTitleBg = useMemo(() => {
        const current = normalizeText(titleBg)
        if (!current) return false

        return existingGalleries.some((gallery) => {
            if (isEditMode && gallery.id === galleryId) return false
            return normalizeText(gallery.title) === current
        })
    }, [existingGalleries, galleryId, isEditMode, titleBg])

    const duplicateTitleEn = useMemo(() => {
        const current = normalizeText(titleEn)
        if (!current) return false

        return existingGalleries.some((gallery) => {
            if (isEditMode && gallery.id === galleryId) return false
            return normalizeText((gallery as any).titleEn) === current
        })
    }, [existingGalleries, galleryId, isEditMode, titleEn])

    const publicPreviewEnabled = selectedAccesses.some((item) => item.previewEnabled)
    const publicDownloadEnabled = selectedAccesses.some((item) => item.downloadEnabled)

    const loadCategories = async () => {
        const response = await apiFetch("/admin/portfolio/categories", {
            method: "GET",
            skipJsonContentType: true,
        })

        if (!response.ok) {
            throw new Error("Неуспешно зареждане на категориите.")
        }

        const data = (await response.json().catch(() => [])) as PortfolioCategoryOption[]
        setCategories(Array.isArray(data) ? data : [])
    }

    const loadAvailableUsers = async () => {
        const response = await apiFetch("/admin/client-galleries/users", {
            method: "GET",
            skipJsonContentType: true,
        })

        if (!response.ok) {
            throw new Error("Неуспешно зареждане на потребителите.")
        }

        const data = (await response.json().catch(() => [])) as AdminGalleryUserOptionDto[]
        setAvailableUsers(Array.isArray(data) ? data : [])
    }

    const loadExistingGalleries = async () => {
        try {
            const data = await getAdminClientGalleries()
            setExistingGalleries(Array.isArray(data) ? data : [])
        } catch {
            setExistingGalleries([])
        }
    }

    const loadGallery = async () => {
        if (!isEditMode || !galleryId) return

        const data = await getAdminClientGalleryById(galleryId)
        setTitleBg(data.title || "")
        setTitleEn((data as any).titleEn || "")
        setDescription(data.description || "")
        setIsActive(data.isActive ?? true)
        setIsPublic(Boolean((data as any).isPublic || (data as any).portfolioCategoryId))
        setPortfolioCategoryId((data as any).portfolioCategoryId ?? null)
        setIsPublished((data as any).isPublished ?? true)

        if (Array.isArray(data.availableUsers) && data.availableUsers.length > 0) {
            setAvailableUsers(data.availableUsers)
        }

        const mappedPhotos: DraftPhotoItem[] = (data.photos || []).map((photo) => ({
            localId: `saved-${photo.id}`,
            id: photo.id,
            previewUrl: photo.previewUrl,
            originalUrl: photo.originalUrl ?? undefined,
            altText: photo.altText || "",
            caption: photo.caption || "",
            displayOrder: photo.displayOrder,
            isCover: photo.previewUrl === data.coverImageUrl,
            isExisting: true,
            isPublished: photo.isPublished ?? true,
            showInPublicGallery: photo.showInPublicGallery ?? false,
            visibleToAllAuthorizedUsers: photo.visibleToAllAuthorizedUsers ?? true,
            allowedUserIds: Array.isArray(photo.allowedUserIds) ? photo.allowedUserIds : [],
        }))

        setPhotos(mappedPhotos)

        const existingAccesses = (((data as any).userAccesses as any[]) || []).map((item) => ({
            userId: item.userId,
            email: item.email,
            previewEnabled: item.previewEnabled,
            downloadEnabled: item.downloadEnabled,
        })) as SelectedUserAccess[]

        setSelectedAccesses(existingAccesses)
    }

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            setError("")

            try {
                await Promise.all([
                    loadCategories(),
                    loadAvailableUsers(),
                    loadExistingGalleries(),
                    loadGallery(),
                ])
            } catch (err) {
                setError(err instanceof Error ? err.message : "Неуспешно зареждане.")
            } finally {
                setLoading(false)
            }
        }

        void run()
    }, [galleryId, isEditMode])

    const handleFiles = (files: File[]) => {
        if (!files.length) return

        const imageFiles = files.filter((file) => file.type.startsWith("image/"))

        if (imageFiles.length !== files.length) {
            setError(t.invalidPhotoType)
            return
        }

        const oversizedFiles = imageFiles.filter((file) => file.size > MAX_PHOTO_UPLOAD_SIZE_BYTES)

        if (oversizedFiles.length > 0) {
            setError(t.photoTooLarge)
            return
        }

        setError("")

        const newItems: DraftPhotoItem[] = imageFiles.map((file, index) => ({
            localId: createLocalId(),
            file,
            previewUrl: URL.createObjectURL(file),
            altText: "",
            caption: "",
            displayOrder: photos.length + index + 1,
            isCover: false,
            isExisting: false,
            isPublished: true,
            showInPublicGallery: false,
            visibleToAllAuthorizedUsers: true,
            allowedUserIds: [],
        }))

        setPhotos((current) => {
            const merged = reorderItems([...current, ...newItems])
            if (!merged.some((item) => item.isCover) && merged[0]) {
                merged[0].isCover = true
            }
            return merged
        })

        if (!selectedPhotoId && newItems[0]) {
            setSelectedPhotoId(newItems[0].localId)
        }
    }

    useEffect(() => {
        const onPaste = (event: ClipboardEvent) => {
            const files = Array.from(event.clipboardData?.files || []).filter((file) =>
                file.type.startsWith("image/")
            )

            if (files.length > 0) {
                event.preventDefault()
                handleFiles(files)
            }
        }

        window.addEventListener("paste", onPaste)
        return () => window.removeEventListener("paste", onPaste)
    }, [photos.length, selectedPhotoId])

    const handleDropUpload = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const files = Array.from(event.dataTransfer.files || [])

        handleFiles(files)
    }

    const updateLocalPhoto = (localId: string, patch: Partial<DraftPhotoItem>) => {
        setPhotos((current) =>
            current.map((item) =>
                item.localId === localId
                    ? {
                          ...item,
                          ...patch,
                      }
                    : item
            )
        )
    }

    const setCoverLocal = (targetLocalId: string) => {
        setPhotos((current) =>
            current.map((item) => ({
                ...item,
                isCover: item.localId === targetLocalId,
            }))
        )
    }

    const removePhotoLocal = async (localId: string) => {
        const photo = photos.find((item) => item.localId === localId)
        if (!photo) return

        if (photo.isExisting && galleryId && photo.id) {
            await deleteGalleryPhoto(galleryId, photo.id)
        }

        setPhotos((current) => {
            const next = current.filter((item) => item.localId !== localId)
            const reordered = reorderItems(next)

            if (!reordered.some((item) => item.isCover) && reordered[0]) {
                reordered[0].isCover = true
            }

            return reordered
        })

        setSelectedPhotoId((current) => (current === localId ? null : current))
        setSelectedPhotoIds((current) => current.filter((item) => item !== localId))
    }

    const handleToggleSelectPhoto = (localId: string) => {
        setSelectedPhotoIds((current) =>
            current.includes(localId)
                ? current.filter((item) => item !== localId)
                : [...current, localId]
        )
    }

    const handleDeleteSelected = async () => {
        const ids = [...selectedPhotoIds]
        for (const localId of ids) {
            await removePhotoLocal(localId)
        }
    }

    const handlePhotoDropReorder = (targetLocalId: string) => {
        if (!draggingPhotoId || draggingPhotoId === targetLocalId) return

        setPhotos((current) => {
            const fromIndex = current.findIndex((item) => item.localId === draggingPhotoId)
            const toIndex = current.findIndex((item) => item.localId === targetLocalId)

            if (fromIndex === -1 || toIndex === -1) return current

            const next = [...current]
            const [moved] = next.splice(fromIndex, 1)
            next.splice(toIndex, 0, moved)

            return reorderItems(next)
        })

        setDraggingPhotoId(null)
    }

    const validate = () => {
        if (!titleBg.trim()) {
            setError(t.titleRequired)
            return false
        }

        if (isPublic && !titleEn.trim()) {
            setError(t.titleEnRequired)
            return false
        }

        if (isPublic && !portfolioCategoryId) {
            setError(t.categoryRequired)
            return false
        }

        if (!photos.length) {
            setError(t.photosRequired)
            return false
        }

        if (photos.some((photo) => photo.file && photo.file.size > MAX_PHOTO_UPLOAD_SIZE_BYTES)) {
            setError(t.photoTooLarge)
            return false
        }

        if (duplicateTitleBg) {
            setError(t.duplicateTitleBg)
            return false
        }

        if (isPublic && duplicateTitleEn) {
            setError(t.duplicateTitleEn)
            return false
        }

        return true
    }

    const persistExistingPhotos = async (currentGalleryId: number) => {
        const ordered = reorderItems([...photos].sort((a, b) => a.displayOrder - b.displayOrder))

        for (const photo of ordered) {
            if (photo.isExisting && photo.id) {
                await updateGalleryPhoto(currentGalleryId, photo.id, {
                    altText: photo.altText || null,
                    caption: photo.caption || null,
                    description: photo.caption || null,
                    displayOrder: photo.displayOrder,
                    isCover: photo.isCover,
                    isPublished: photo.isPublished,
                    showInPublicGallery: photo.showInPublicGallery,
                    visibleToAllAuthorizedUsers: photo.visibleToAllAuthorizedUsers,
                    allowedUserIds: photo.allowedUserIds,
                })
            }
        }

        const uploadedMap = new Map<string, ClientPhotoDto>()

        for (const photo of ordered) {
            if (!photo.isExisting && photo.file) {
                const uploaded = await uploadGalleryPhoto(currentGalleryId, photo.file)
                uploadedMap.set(photo.localId, uploaded)
            }
        }

        const coverLocalId = ordered.find((item) => item.isCover)?.localId

        if (coverLocalId) {
            const uploadedCover = uploadedMap.get(coverLocalId)
            const existingCover = ordered.find(
                (item) => item.localId === coverLocalId && item.isExisting
            )

            const nextCoverUrl = uploadedCover?.previewUrl || existingCover?.previewUrl || ""

            if (nextCoverUrl) {
                await setGalleryCoverImage(currentGalleryId, { coverImageUrl: nextCoverUrl } as any)
            }
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        if (!validate()) return

        setSaving(true)

        try {
            const payload = {
                title: titleBg.trim(),
                titleEn: titleEn.trim() || null,
                description: description.trim() || null,
                isActive,
                isPublic,
                portfolioCategoryId: isPublic ? portfolioCategoryId : null,
                isPublished: isPublic ? isPublished : false,
                userAccesses: selectedAccesses,
            } as any

            if (isEditMode && galleryId) {
                await updateAdminClientGallery(galleryId, payload)
                await persistExistingPhotos(galleryId)
                setSuccess(t.updateSuccess)
                await loadGallery()
                await loadExistingGalleries()
                await loadAvailableUsers()
            } else {
                const created = await createAdminClientGallery(payload as any)
                const createdId = (created as any)?.id

                if (!createdId) {
                    throw new Error("Неуспешно създаване на албума.")
                }

                const ordered = reorderItems([...photos].sort((a, b) => a.displayOrder - b.displayOrder))
                const uploadedItems: ClientPhotoDto[] = []

                for (const photo of ordered) {
                    if (!photo.file) continue
                    const uploaded = await uploadGalleryPhoto(createdId, photo.file)
                    uploadedItems.push(uploaded)
                }

                const coverIndex = ordered.findIndex((item) => item.isCover)
                const coverPhoto = coverIndex >= 0 ? uploadedItems[coverIndex] : uploadedItems[0]

                if (coverPhoto?.previewUrl) {
                    await setGalleryCoverImage(createdId, {
                        coverImageUrl: coverPhoto.previewUrl,
                    } as any)
                }

                navigate(`/admin/client-galleries/edit?id=${createdId}`)
                return
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неуспешен запис.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        to="/admin"
                        className="mb-3 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {t.back}
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isEditMode ? t.editTitle : t.createTitle}
                    </h1>
                </div>

                {isEditMode ? (
                    <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-red-300 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                        {t.deleteConfirm}
                    </button>
                ) : null}
            </div>

            {loading ? (
                <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    {t.loading}
                </div>
            ) : null}

            {error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {success}
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
                <AlbumVisibilitySection
                    isBg={isBg}
                    isPublic={isPublic}
                    isPublished={isPublished}
                    categories={categories}
                    portfolioCategoryId={portfolioCategoryId}
                    onIsPublicChange={setIsPublic}
                    onIsPublishedChange={setIsPublished}
                    onPortfolioCategoryIdChange={setPortfolioCategoryId}
                />

                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                            {t.gallerySection}
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                                {t.titleBg}
                            </label>
                            <input
                                value={titleBg}
                                onChange={(e) => setTitleBg(e.target.value)}
                                placeholder={t.titleBgPlaceholder}
                                className={inputClassName}
                            />
                            {duplicateTitleBg ? (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                                    {t.duplicateTitleBg}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                                {t.titleEn} {isPublic ? "*" : ""}
                            </label>
                            <input
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                placeholder={t.titleEnPlaceholder}
                                className={inputClassName}
                            />
                            {isPublic && duplicateTitleEn ? (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                                    {t.duplicateTitleEn}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                            {t.description}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder={t.descriptionPlaceholder}
                            className={inputClassName}
                        />
                    </div>

                    <div className="mt-5">
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-neutral-800 dark:text-zinc-200">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-4 w-4 rounded"
                            />
                            {t.active}
                        </label>
                    </div>
                </section>

                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                            {t.photos}
                        </h2>
                    </div>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropUpload}
                        className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950"
                    >
                        <p className="text-base font-semibold text-neutral-900 dark:text-white">
                            {t.dropzone}
                        </p>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-zinc-400">
                            {t.dropzoneHint}
                        </p>

                        <label className="mt-4 inline-flex cursor-pointer items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                            {t.chooseFiles}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                            />
                        </label>
                    </div>

                    <AlbumBulkActionsBar
                        isBg={isBg}
                        selectedCount={selectedPhotoIds.length}
                        canMove={false}
                        onClearSelection={() => setSelectedPhotoIds([])}
                        onDeleteSelected={() => void handleDeleteSelected()}
                    />

                    {sortedPhotos.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500 dark:border-zinc-700 dark:text-zinc-400">
                            {t.noPhotos}
                        </div>
                    ) : (
                        <div className="mt-5 grid grid-cols-2 gap-[2px] md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {sortedPhotos.map((photo) => (
                                <div
                                    key={photo.localId}
                                    draggable
                                    onDragStart={() => setDraggingPhotoId(photo.localId)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handlePhotoDropReorder(photo.localId)}
                                    className={`group overflow-hidden border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${
                                        selectedPhotoId === photo.localId ? "ring-2 ring-sky-400" : ""
                                    }`}
                                >
                                    <div
                                        className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-neutral-100 dark:bg-zinc-800"
                                        onClick={() => setSelectedPhotoId(photo.localId)}
                                    >
                                        <img
                                            src={photo.previewUrl}
                                            alt={photo.altText || "photo"}
                                            className="h-full w-full object-cover"
                                        />

                                        <div className="absolute left-3 top-3 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedPhotoIds.includes(photo.localId)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    handleToggleSelectPhoto(photo.localId)
                                                }}
                                                className="h-4 w-4 rounded border-white/80 bg-white/90"
                                            />

                                            {photo.isCover ? (
                                                <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-900 dark:bg-zinc-900/90 dark:text-white">
                                                    {t.setCover}
                                                </span>
                                            ) : null}
                                        </div>

                                        <button
                                            type="button"
                                            title={t.removePhoto}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                void removePhotoLocal(photo.localId)
                                            }}
                                            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white transition hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-3 p-3">
                                        <button
                                            type="button"
                                            onClick={() => setCoverLocal(photo.localId)}
                                            className="inline-flex items-center rounded-xl border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
                                        >
                                            {t.setCover}
                                        </button>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                                {t.altText}
                                            </label>
                                            <input
                                                value={photo.altText}
                                                onChange={(e) =>
                                                    updateLocalPhoto(photo.localId, {
                                                        altText: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                                {t.caption}
                                            </label>
                                            <input
                                                value={photo.caption}
                                                onChange={(e) =>
                                                    updateLocalPhoto(photo.localId, {
                                                        caption: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <UserAccessSelector
                    isBg={isBg}
                    users={availableUsers.map((user) => ({
                        id: user.id,
                        email: user.email,
                    }))}
                    value={selectedAccesses}
                    onChange={setSelectedAccesses}
                />

                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                {t.publicState}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                {isPublic ? t.yes : t.no}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                {t.category}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                {isPublic ? selectedCategoryName : t.notAssigned}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                {t.preview}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                {publicPreviewEnabled ? t.enabled : t.disabled}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400">
                                {t.download}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                {publicDownloadEnabled ? t.enabled : t.disabled}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {saving ? t.saving : t.save}
                    </button>
                </div>
            </form>

            <ConfirmDialog
                open={deleteOpen}
                title={t.deleteTitle}
                description={t.deleteDescription}
                confirmText={t.deleteConfirm}
                cancelText={t.cancel}
                confirmVariant="danger"
                busy={saving}
                onConfirm={() => {
                    setDeleteOpen(false)
                }}
                onCancel={() => setDeleteOpen(false)}
            />
        </div>
    )
}