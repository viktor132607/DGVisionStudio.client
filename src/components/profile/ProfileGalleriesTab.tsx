import { useMemo, useState } from "react"
import PortfolioLightbox from "../portfolio/PortfolioLightbox"
import ClientGalleryCard from "../client-galleries/ClientGalleryCard"
import type { MyClientGalleryDto, ClientGalleryDetailsDto } from "../../types/clientGallery"
import {
    createMyClientGallery,
    getClientGalleryDetails,
    getGalleryPhotoDownloadUrl,
    getGalleryZipDownloadUrl,
    uploadMyClientGalleryPhoto,
} from "../../services/clientGalleries"

type ProfileGalleriesTabProps = {
    galleries: MyClientGalleryDto[]
    loading: boolean
    error: string
    isBg: boolean
    onReload?: () => Promise<void> | void
}

export default function ProfileGalleriesTab({
    galleries,
    loading,
    error,
    isBg,
    onReload,
}: ProfileGalleriesTabProps) {
    const [openedGallery, setOpenedGallery] = useState<ClientGalleryDetailsDto | null>(null)
    const [galleryLoadingId, setGalleryLoadingId] = useState<number | null>(null)
    const [galleryError, setGalleryError] = useState("")
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const [newTitle, setNewTitle] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [creating, setCreating] = useState(false)
    const [uploadingId, setUploadingId] = useState<number | null>(null)

    const userUploadedCount = galleries.filter((x) => x.isUserUploaded && x.userGalleryStatus !== "Expired" && x.userGalleryStatus !== 3).length

    const lightboxImages = useMemo(
        () =>
            (openedGallery?.photos ?? [])
                .map((photo, index) => {
                    const src = photo.previewUrl || photo.originalUrl || ""
                    return {
                        src,
                        alt: `${openedGallery?.title ?? "Gallery"} ${index + 1}`,
                    }
                })
                .filter((item) => item.src),
        [openedGallery]
    )

    const reloadAll = async () => {
        await onReload?.()

        if (openedGallery) {
            const fresh = await getClientGalleryDetails(openedGallery.id)
            setOpenedGallery(fresh)
        }
    }

    const createGallery = async (e: React.FormEvent) => {
        e.preventDefault()
        setGalleryError("")

        if (!newTitle.trim()) {
            setGalleryError(isBg ? "Заглавието е задължително." : "Title is required.")
            return
        }

        try {
            setCreating(true)
            const result = await createMyClientGallery({
                title: newTitle.trim(),
                description: newDescription.trim() || null,
            })

            setNewTitle("")
            setNewDescription("")

            await onReload?.()

            const created = await getClientGalleryDetails(result.id)
            setOpenedGallery(created)
        } catch (err) {
            setGalleryError(
                err instanceof Error
                    ? err.message
                    : isBg
                      ? "Грешка при създаване на галерия."
                      : "Failed to create gallery."
            )
        } finally {
            setCreating(false)
        }
    }

    const uploadPhotos = async (galleryId: number, files: FileList | null) => {
        if (!files || files.length === 0) return

        try {
            setGalleryError("")
            setUploadingId(galleryId)

            for (const file of Array.from(files)) {
                await uploadMyClientGalleryPhoto(galleryId, file)
            }

            await reloadAll()
        } catch (err) {
            setGalleryError(
                err instanceof Error
                    ? err.message
                    : isBg
                      ? "Грешка при качване."
                      : "Failed to upload photos."
            )
        } finally {
            setUploadingId(null)
        }
    }

    const openGallery = async (gallery: MyClientGalleryDto) => {
        if (!gallery.previewEnabled || gallery.isExpired || gallery.userGalleryStatus === "Expired" || gallery.userGalleryStatus === 3) {
            setGalleryError(
                isBg
                    ? "Нямаш активен достъп за преглед до тази галерия."
                    : "You do not have active preview access to this gallery."
            )
            return
        }

        try {
            setGalleryError("")
            setGalleryLoadingId(gallery.id)

            const data = await getClientGalleryDetails(gallery.id)
            setOpenedGallery(data)
        } catch (err) {
            setGalleryError(
                err instanceof Error
                    ? err.message
                    : isBg
                      ? "Грешка при зареждане."
                      : "Failed to load gallery."
            )
        } finally {
            setGalleryLoadingId(null)
        }
    }

    const closeGallery = () => {
        setOpenedGallery(null)
        setSelectedIndex(null)
        document.body.style.overflow = ""
    }

    const openLightbox = (index: number) => {
        setSelectedIndex(index)
        document.body.style.overflow = "hidden"
    }

    const closeLightbox = () => {
        setSelectedIndex(null)
        document.body.style.overflow = ""
    }

    if (loading) {
        return (
            <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-10 text-[14px] text-neutral-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                {isBg ? "Зареждане на галерии..." : "Loading galleries..."}
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-[20px] font-semibold text-neutral-950 dark:text-white">
                            {isBg ? "Моите галерии" : "My galleries"}
                        </h2>
                        <p className="mt-1 text-[14px] text-neutral-600 dark:text-zinc-300">
                            {isBg
                                ? "Можеш да създадеш до 10 галерии. Всяка user галерия живее 7 дни."
                                : "You can create up to 10 galleries. Each user gallery stays active for 7 days."}
                        </p>
                    </div>

                    <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[14px] font-semibold text-neutral-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {userUploadedCount}/10 {isBg ? "активни" : "active"}
                    </div>
                </div>
            </div>

            <form
                onSubmit={createGallery}
                className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-neutral-700 dark:text-zinc-300">
                            {isBg ? "Заглавие" : "Title"}
                        </label>
                        <input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-[14px] text-neutral-950 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            placeholder={isBg ? "Нова галерия" : "New gallery"}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-neutral-700 dark:text-zinc-300">
                            {isBg ? "Описание" : "Description"}
                        </label>
                        <input
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-[14px] text-neutral-950 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            placeholder={isBg ? "По избор" : "Optional"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={creating || userUploadedCount >= 10}
                        className="h-11 rounded-full border border-neutral-950 bg-neutral-950 px-5 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {creating ? (isBg ? "Създаване..." : "Creating...") : isBg ? "Създай" : "Create"}
                    </button>
                </div>
            </form>

            {galleryError ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {galleryError}
                </div>
            ) : null}

            {!galleries.length ? (
                <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-10 text-[14px] text-neutral-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    {isBg ? "Нямаш налични галерии." : "You do not have any galleries yet."}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {galleries.map((gallery) => (
                        <div key={gallery.id} className="space-y-3">
                            <ClientGalleryCard
                                gallery={gallery}
                                isBg={isBg}
                                loading={galleryLoadingId === gallery.id}
                                onOpen={
                                    gallery.previewEnabled && !gallery.isExpired
                                        ? () => void openGallery(gallery)
                                        : undefined
                                }
                                onDownloadAll={() => {
                                    window.location.href = getGalleryZipDownloadUrl(gallery.id)
                                }}
                            />

                            {gallery.isUserUploaded ? (
                                <label className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white px-4 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                                    {uploadingId === gallery.id
                                        ? isBg
                                            ? "Качване..."
                                            : "Uploading..."
                                        : isBg
                                          ? "Качи снимки"
                                          : "Upload photos"}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        disabled={uploadingId === gallery.id}
                                        onChange={(e) => void uploadPhotos(gallery.id, e.target.files)}
                                    />
                                </label>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            {openedGallery ? (
                <div className="rounded-[28px] border border-neutral-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="border-b border-neutral-200 px-6 py-6 dark:border-zinc-800 sm:px-8 sm:py-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h3 className="text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-white">
                                    {openedGallery.title}
                                </h3>
                                {openedGallery.description ? (
                                    <p className="mt-2 max-w-4xl text-[15px] leading-7 text-neutral-600 dark:text-zinc-300">
                                        {openedGallery.description}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={closeGallery}
                                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-[14px] font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                            >
                                {isBg ? "Затвори" : "Close"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                        {openedGallery.isUserUploaded ? (
                            <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 px-5 py-4 text-[14px] text-neutral-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                {isBg
                                    ? `Статус: ${openedGallery.userGalleryStatus}. Остават ${openedGallery.remainingLifetimeDays ?? 0} дни.`
                                    : `Status: ${openedGallery.userGalleryStatus}. ${openedGallery.remainingLifetimeDays ?? 0} days remaining.`}
                            </div>
                        ) : null}

                        {openedGallery.downloadEnabled && !openedGallery.isExpired ? (
                            <div className="flex flex-col gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/30 dark:bg-emerald-500/10 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
                                        {isBg ? "Изтеглянето е активно." : "Download is active."}
                                    </p>
                                </div>

                                <a
                                    href={getGalleryZipDownloadUrl(openedGallery.id)}
                                    className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-700 px-5 text-[14px] font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    {isBg ? "Изтегли всички" : "Download all"}
                                </a>
                            </div>
                        ) : null}

                        {!openedGallery.photos.length ? (
                            <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 px-5 py-10 text-[14px] text-neutral-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                {isBg ? "Няма снимки в тази галерия." : "There are no photos in this gallery."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {openedGallery.photos.map((photo, index) => {
                                    const canDownload = openedGallery.downloadEnabled && !openedGallery.isExpired
                                    const imageSrc = photo.previewUrl || photo.originalUrl || ""

                                    return (
                                        <div
                                            key={photo.id}
                                            className="group relative overflow-hidden rounded-[24px] border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => openLightbox(index)}
                                                className="block w-full text-left"
                                            >
                                                <div className="relative overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                                    <img
                                                        src={imageSrc}
                                                        alt={`${openedGallery.title} ${index + 1}`}
                                                        className="h-auto w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </button>

                                            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openLightbox(index)}
                                                        className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-100"
                                                    >
                                                        {isBg ? "Отвори" : "Open"}
                                                    </button>

                                                    {canDownload ? (
                                                        <a
                                                            href={getGalleryPhotoDownloadUrl(openedGallery.id, photo.id)}
                                                            download
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-4 text-[13px] font-semibold text-white shadow-md transition hover:bg-emerald-800"
                                                        >
                                                            {isBg ? "Изтегли" : "Download"}
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {selectedIndex !== null && lightboxImages.length > 0 ? (
                <PortfolioLightbox
                    isBg={isBg}
                    item={
                        {
                            id: selectedIndex + 1,
                            src: lightboxImages[selectedIndex]?.src || "",
                            alt:
                                lightboxImages[selectedIndex]?.alt ||
                                `${openedGallery?.title ?? "Gallery"} ${selectedIndex + 1}`,
                            title:
                                lightboxImages[selectedIndex]?.alt ||
                                `${openedGallery?.title ?? "Gallery"} ${selectedIndex + 1}`,
                            categoryKey: "",
                            categoryLabel: "",
                            albumSlug: "",
                            albumTitle: openedGallery?.title ?? "",
                            isCover: false,
                            displayOrder: selectedIndex,
                        } as any
                    }
                    selectedIndex={selectedIndex}
                    totalItems={lightboxImages.length}
                    onClose={closeLightbox}
                    onPrev={() =>
                        setSelectedIndex((prev) =>
                            prev === null ? 0 : prev === 0 ? lightboxImages.length - 1 : prev - 1
                        )
                    }
                    onNext={() =>
                        setSelectedIndex((prev) =>
                            prev === null ? 0 : prev === lightboxImages.length - 1 ? 0 : prev + 1
                        )
                    }
                    showNavigation={lightboxImages.length > 1}
                />
            ) : null}
        </div>
    )
}