import { useTranslation } from "react-i18next"
import type { ClientPhotoDto } from "../../types/clientGallery"

type ClientPhotoListProps = {
    photos: ClientPhotoDto[]
    coverImageUrl?: string | null
    onDelete?: (photoId: number) => void | Promise<void>
    onSetCover?: (previewUrl: string) => void | Promise<void>
    deletingPhotoId?: number | null
    settingCoverUrl?: string | null
}

function normalizeImageUrl(value?: string | null) {
    if (!value) return ""

    const trimmed = value.trim().replaceAll("\\", "/")

    try {
        const url = new URL(trimmed)
        return url.pathname.replace(/^\/+/, "")
    } catch {
        return trimmed.replace(/^\/+/, "")
    }
}

export default function ClientPhotoList({
    photos,
    coverImageUrl,
    onDelete,
    onSetCover,
    deletingPhotoId = null,
    settingCoverUrl = null,
}: ClientPhotoListProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const t = isBg
        ? {
              title: "Снимки",
              empty: "Няма качени снимки.",
              order: "Ред",
              cover: "Корица",
              currentCover: "Текуща корица",
              setCover: "Направи корица",
              delete: "Изтрий",
              deleting: "Изтриване...",
              settingCover: "Запазване...",
              downloadable: "Original",
              previewOnly: "Preview only",
              published: "Публикувана",
              hidden: "Скрита",
          }
        : {
              title: "Photos",
              empty: "No uploaded photos.",
              order: "Order",
              cover: "Cover",
              currentCover: "Current cover",
              setCover: "Set cover",
              delete: "Delete",
              deleting: "Deleting...",
              settingCover: "Saving...",
              downloadable: "Original",
              previewOnly: "Preview only",
              published: "Published",
              hidden: "Hidden",
          }

    const normalizedCoverImageUrl = normalizeImageUrl(coverImageUrl)
    const normalizedSettingCoverUrl = normalizeImageUrl(settingCoverUrl)

    return (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-[16px] font-semibold text-neutral-950 dark:text-white">
                {t.title}
            </h3>

            {!photos.length ? (
                <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.empty}</p>
            ) : null}

            {photos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => {
                        const normalizedPreviewUrl = normalizeImageUrl(photo.previewUrl)
                        const normalizedOriginalUrl = normalizeImageUrl(photo.originalUrl)

                        const isCurrentCover =
                            !!normalizedCoverImageUrl &&
                            (normalizedCoverImageUrl === normalizedPreviewUrl ||
                                normalizedCoverImageUrl === normalizedOriginalUrl)

                        const isSettingCover =
                            !!normalizedSettingCoverUrl &&
                            (normalizedSettingCoverUrl === normalizedPreviewUrl ||
                                normalizedSettingCoverUrl === normalizedOriginalUrl)

                        const coverPayload = photo.originalUrl || photo.previewUrl

                        return (
                            <div
                                key={photo.id}
                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                            >
                                <div className="aspect-[4/3] bg-neutral-200 dark:bg-zinc-800">
                                    <img
                                        src={photo.previewUrl}
                                        alt={photo.altText || photo.caption || ""}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="space-y-3 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[12px] font-semibold text-neutral-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                            {t.order}: {photo.displayOrder}
                                        </span>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                                                photo.canDownload
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                            }`}
                                        >
                                            {photo.canDownload ? t.downloadable : t.previewOnly}
                                        </span>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                                                photo.isPublished
                                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
                                                    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                            }`}
                                        >
                                            {photo.isPublished ? t.published : t.hidden}
                                        </span>

                                        {isCurrentCover ? (
                                            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                                                {t.currentCover}
                                            </span>
                                        ) : null}
                                    </div>

                                    {photo.altText || photo.caption ? (
                                        <div className="space-y-1">
                                            {photo.altText ? (
                                                <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                                                    {photo.altText}
                                                </p>
                                            ) : null}

                                            {photo.caption ? (
                                                <p className="text-[13px] text-neutral-600 dark:text-zinc-400">
                                                    {photo.caption}
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onSetCover?.(coverPayload)}
                                            disabled={!onSetCover || isCurrentCover || isSettingCover}
                                            className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                                        >
                                            {isSettingCover ? t.settingCover : t.setCover}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete?.(photo.id)}
                                            disabled={!onDelete || deletingPhotoId === photo.id}
                                            className="rounded-full border border-red-300 bg-transparent px-3 py-2 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            {deletingPhotoId === photo.id ? t.deleting : t.delete}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : null}
        </div>
    )
}