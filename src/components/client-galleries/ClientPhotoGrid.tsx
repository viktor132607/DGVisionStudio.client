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

export default function ClientPhotoGrid({
    photos,
    getPhotoDownloadUrl,
    isBg,
}: ClientPhotoGridProps) {
    return (
        <div className="w-full bg-neutral-300 px-[5mm] py-[1px] dark:bg-zinc-800">
            <div className="grid grid-cols-2 gap-[1px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {photos.map((photo, index) => {
                    const video = isVideo(photo)
                    const mediaUrl = photo.originalUrl || photo.previewUrl
                    const title = getTitle(photo, `${isBg ? "Медия" : "Media"} ${index + 1}`)

                    return (
                        <div
                            key={photo.id}
                            className="group relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-zinc-900"
                        >
                            {video ? (
                                <>
                                    <video
                                        src={mediaUrl}
                                        controls
                                        playsInline
                                        preload="metadata"
                                        className="absolute inset-0 h-full w-full bg-black object-contain"
                                    />
                                    <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                        Video
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={photo.previewUrl}
                                    alt={title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                />
                            )}

                            {!video ? (
                                <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/30" />
                            ) : null}

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-4 sm:p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 sm:tracking-[0.28em]">
                                    #{photo.displayOrder}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white sm:text-[15px]">
                                    {title}
                                </p>
                            </div>

                            {photo.canDownload ? (
                                <a
                                    href={getPhotoDownloadUrl(photo.id)}
                                    className="absolute bottom-3 right-3 z-10 inline-flex items-center justify-center rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition hover:bg-black/85"
                                >
                                    {video
                                        ? isBg
                                            ? "Изтегли видео"
                                            : "Download video"
                                        : isBg
                                          ? "Изтегли"
                                          : "Download"}
                                </a>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
