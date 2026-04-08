import { useTranslation } from "react-i18next"
import type { ClientPhotoDto } from "../../../types/clientGallery"

type AdminClientPhotoGridProps = {
    photos: ClientPhotoDto[]
    coverImageUrl?: string | null
    onSelect: (photo: ClientPhotoDto) => void
}

export default function AdminClientPhotoGrid({
    photos,
    coverImageUrl,
    onSelect,
}: AdminClientPhotoGridProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const t = isBg
        ? {
              title: "Снимки",
              empty: "Все още няма качени снимки.",
              cover: "Cover",
              public: "Публична",
              hidden: "Скрита",
          }
        : {
              title: "Photos",
              empty: "No uploaded photos yet.",
              cover: "Cover",
              public: "Public",
              hidden: "Hidden",
          }

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-neutral-950 dark:text-white">
                    {t.title}
                </h3>
                <span className="text-[13px] text-neutral-500 dark:text-zinc-400">
                    {photos.length}
                </span>
            </div>

            {!photos.length ? (
                <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.empty}</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {photos.map((photo) => {
                        const isCover = coverImageUrl === photo.previewUrl

                        return (
                            <button
                                key={photo.id}
                                type="button"
                                onClick={() => onSelect(photo)}
                                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
                            >
                                <div className="relative aspect-square overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                    <img
                                        src={photo.previewUrl}
                                        alt=""
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                    />

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {isCover ? (
                                                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">
                                                    {t.cover}
                                                </span>
                                            ) : null}

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    photo.showInPublicGallery
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-zinc-100 text-zinc-800"
                                                }`}
                                            >
                                                {photo.showInPublicGallery ? t.public : t.hidden}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}