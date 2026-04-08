import type { ClientPhotoDto } from "../../types/clientGallery"

type ClientPhotoGridProps = {
    photos: ClientPhotoDto[]
    getPhotoDownloadUrl: (photoId: number) => string
    isBg: boolean
}

export default function ClientPhotoGrid({
    photos,
    getPhotoDownloadUrl,
    isBg,
}: ClientPhotoGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
                <div
                    key={photo.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <img
                        src={photo.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />

                    <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-neutral-500 dark:text-zinc-400">
                                #{photo.displayOrder}
                            </span>

                            <span
                                className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                                    photo.canDownload
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                        : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                            >
                                {photo.canDownload
                                    ? isBg
                                        ? "Изтегляне"
                                        : "Download"
                                    : isBg
                                      ? "Само preview"
                                      : "Preview only"}
                            </span>
                        </div>

                        {photo.canDownload ? (
                            <a
                                href={getPhotoDownloadUrl(photo.id)}
                                className="inline-flex w-full items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {isBg ? "Изтегли снимката" : "Download photo"}
                            </a>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    )
}