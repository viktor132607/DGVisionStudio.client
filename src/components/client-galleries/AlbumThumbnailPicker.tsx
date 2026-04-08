type ThumbnailPhoto = {
    id: number
    previewUrl: string
    fileName?: string
    isCover?: boolean
}

type AlbumThumbnailPickerProps = {
    isBg: boolean
    photos: ThumbnailPhoto[]
    selectedPhotoId: number | null
    onSelect: (photoId: number) => void
}

export default function AlbumThumbnailPicker({
    isBg,
    photos,
    selectedPhotoId,
    onSelect,
}: AlbumThumbnailPickerProps) {
    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                    {isBg ? "Thumbnail / корица" : "Thumbnail / cover"}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-zinc-400">
                    {isBg
                        ? "Избери коя снимка да се използва като основна корица на албума."
                        : "Choose which photo will be used as the album cover."}
                </p>
            </div>

            {photos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500 dark:border-zinc-700 dark:text-zinc-400">
                    {isBg
                        ? "Първо добави снимки, за да избереш корица."
                        : "Add photos first to choose a cover."}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {photos.map((photo) => {
                        const active = selectedPhotoId === photo.id

                        return (
                            <button
                                key={photo.id}
                                type="button"
                                onClick={() => onSelect(photo.id)}
                                className={`group overflow-hidden rounded-2xl border text-left transition ${
                                    active
                                        ? "border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900"
                                        : "border-neutral-200 hover:border-neutral-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                                }`}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-zinc-800">
                                    <img
                                        src={photo.previewUrl}
                                        alt={photo.fileName || "thumbnail"}
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute left-2 top-2">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                active
                                                    ? "bg-sky-600 text-white"
                                                    : "bg-white/90 text-neutral-900 dark:bg-zinc-900/90 dark:text-white"
                                            }`}
                                        >
                                            {active
                                                ? isBg
                                                    ? "Избрана"
                                                    : "Selected"
                                                : isBg
                                                  ? "Избери"
                                                  : "Pick"}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </section>
    )
}