import type { ClientPhotoDto } from "../../types/clientGallery"

type ClientPhotoGridProps = {
    photos: ClientPhotoDto[]
    getPhotoDownloadUrl: (photoId: number) => string
    isBg: boolean
}

function isVideo(photo: ClientPhotoDto) {
    return photo.mediaType === "Video" || /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(photo.originalUrl || photo.previewUrl || "")
}

function getTitle(photo: ClientPhotoDto, fallback: string) {
    return photo.name?.trim() || photo.altText?.trim() || photo.caption?.trim() || fallback
}

export default function ClientPhotoGrid({ photos, getPhotoDownloadUrl, isBg }: ClientPhotoGridProps) {
    return (
        <div className="w-full bg-neutral-300 px-1 py-[1px] dark:bg-zinc-800 sm:px-[5mm]">
            <div className="grid grid-cols-2 gap-[1px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {photos.map((photo, index) => {
                    const video = isVideo(photo)
                    const mediaUrl = photo.originalUrl || photo.previewUrl
                    const title = getTitle(photo, `${isBg ? "Медия" : "Media"} ${index + 1}`)

                    return (
                        <div key={photo.id} className="group relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-zinc-900">
                            <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={isBg ? `Отвори ${title}` : `Open ${title}`}
                                className="absolute inset-0 block"
                            >
                                {video ? (
                                    <>
                                        <video src={mediaUrl} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-contain transition duration-500 group-hover:scale-[1.02]" />
                                        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:px-3 sm:text-[10px] sm:tracking-[0.16em]">Video</div>
                                    </>
                                ) : (
                                    <img src={photo.previewUrl} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                                )}

                                <div className="pointer-events-none absolute inset-0 bg-black/10 transition duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/30" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-100 transition duration-300 sm:translate-y-4 sm:p-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/70 sm:text-[10px] sm:tracking-[0.28em]">#{photo.displayOrder}</p>
                                    <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-white sm:mt-1 sm:text-[15px]">{title}</p>
                                </div>
                            </a>

                            {photo.canDownload ? (
                                <a
                                    href={getPhotoDownloadUrl(photo.id)}
                                    download
                                    className="absolute bottom-2 right-2 z-10 inline-flex items-center justify-center rounded-full bg-black/75 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm transition hover:bg-black/90 sm:bottom-3 sm:right-3 sm:px-3 sm:text-[11px]"
                                >
                                    {video ? (isBg ? "Изтегли видео" : "Download video") : isBg ? "Изтегли" : "Download"}
                                </a>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
