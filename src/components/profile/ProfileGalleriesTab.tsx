import { useMemo, useState } from "react"
import PortfolioLightbox from "../portfolio/PortfolioLightbox"
import ClientGalleryCard from "../client-galleries/ClientGalleryCard"
import type { MyClientGalleryDto, ClientGalleryDetailsDto } from "../../types/clientGallery"
import {
    getClientGalleryDetails,
    getGalleryPhotoDownloadUrl,
    getGalleryZipDownloadUrl,
} from "../../services/clientGalleries"

type ProfileGalleriesTabProps = {
    galleries: MyClientGalleryDto[]
    loading: boolean
    error: string
    isBg: boolean
}

export default function ProfileGalleriesTab({
    galleries,
    loading,
    error,
    isBg,
}: ProfileGalleriesTabProps) {
    const [openedGallery, setOpenedGallery] = useState<ClientGalleryDetailsDto | null>(null)
    const [galleryLoadingId, setGalleryLoadingId] = useState<number | null>(null)
    const [galleryError, setGalleryError] = useState("")
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

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

    const openGallery = async (galleryId: number) => {
        try {
            setGalleryError("")
            setGalleryLoadingId(galleryId)

            const data = await getClientGalleryDetails(galleryId)
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

    if (!galleries.length) {
        return (
            <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-10 text-[14px] text-neutral-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                {isBg ? "Нямаш налични галерии." : "You do not have any galleries yet."}
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-[20px] font-semibold text-neutral-950 dark:text-white">
                            {isBg ? "Споделени галерии" : "Shared galleries"}
                        </h2>
                        <p className="mt-1 text-[14px] text-neutral-600 dark:text-zinc-300">
                            {isBg
                                ? "Оттук можеш да отваряш, разглеждаш и теглиш снимките от споделените ти албуми."
                                : "Here you can open, browse, and download photos from your shared albums."}
                        </p>
                    </div>

                    <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[14px] font-semibold text-neutral-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {galleries.length} {isBg ? "галерии" : "galleries"}
                    </div>
                </div>
            </div>

            {galleryError ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {galleryError}
                </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {galleries.map((gallery) => (
                    <ClientGalleryCard
                        key={gallery.id}
                        gallery={gallery}
                        isBg={isBg}
                        loading={galleryLoadingId === gallery.id}
                        onOpen={() => void openGallery(gallery.id)}
                        onDownloadAll={() => {
                            window.location.href = getGalleryZipDownloadUrl(gallery.id)
                        }}
                    />
                ))}
            </div>

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
                        {openedGallery.coverImageUrl ? (
                            <div className="overflow-hidden rounded-[24px] border border-neutral-200 dark:border-zinc-700">
                                <img
                                    src={openedGallery.coverImageUrl}
                                    alt={openedGallery.title}
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        ) : null}

                        {openedGallery.downloadEnabled && !openedGallery.isExpired ? (
                            <div className="flex flex-col gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/30 dark:bg-emerald-500/10 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
                                        {isBg ? "Изтеглянето е активно." : "Download is active."}
                                    </p>

                                    {openedGallery.remainingDownloadDays !== null ? (
                                        <p className="mt-1 text-[13px] text-emerald-700/80 dark:text-emerald-300/80">
                                            {isBg
                                                ? `Остават ${openedGallery.remainingDownloadDays} дни.`
                                                : `${openedGallery.remainingDownloadDays} days remaining.`}
                                        </p>
                                    ) : null}
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

                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                                                </div>
                                            </button>

                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openLightbox(index)}
                                                        className="pointer-events-auto inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-100"
                                                    >
                                                        {isBg ? "Отвори" : "Open"}
                                                    </button>

                                                    {canDownload ? (
                                                        <a
                                                            href={getGalleryPhotoDownloadUrl(openedGallery.id, photo.id)}
                                                            download
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="pointer-events-auto inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-4 text-[13px] font-semibold text-white shadow-md transition hover:bg-emerald-800"
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
                    item={{
                        id: selectedIndex + 1,
                        src: lightboxImages[selectedIndex]?.src || "",
                        alt: lightboxImages[selectedIndex]?.alt || `${openedGallery?.title ?? "Gallery"} ${selectedIndex + 1}`,
                        title: lightboxImages[selectedIndex]?.alt || `${openedGallery?.title ?? "Gallery"} ${selectedIndex + 1}`,
                        categoryKey: "",
                        categoryLabel: "",
                        albumSlug: "",
                        albumTitle: openedGallery?.title ?? "",
                        isCover: false,
                        displayOrder: selectedIndex,
                    } as any}
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