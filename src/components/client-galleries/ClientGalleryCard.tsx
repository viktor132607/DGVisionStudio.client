import type { MouseEvent } from "react"
import type { MyClientGalleryDto } from "../../types/clientGallery"
import ClientGalleryStatusBadge from "./ClientGalleryStatusBadge"

type ClientGalleryCardProps = {
    gallery: MyClientGalleryDto
    isBg: boolean
    onOpen?: () => void
    onDownloadAll?: () => void
    loading?: boolean
}

export default function ClientGalleryCard({
    gallery,
    isBg,
    onOpen,
    onDownloadAll,
    loading = false,
}: ClientGalleryCardProps) {
    const canPreview = gallery.previewEnabled && !gallery.isExpired
    const canDownload = gallery.downloadEnabled && !gallery.isExpired

    const handleOpen = () => {
        if (loading || !canPreview) return
        onOpen?.()
    }

    const handleDownload = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (!canDownload) return
        onDownloadAll?.()
    }

    return (
        <div className="group overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <button
                type="button"
                onClick={handleOpen}
                disabled={!canPreview}
                className="block w-full text-left disabled:cursor-not-allowed"
            >
                <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                    {gallery.coverImageUrl ? (
                        <img
                            src={gallery.coverImageUrl}
                            alt={gallery.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[14px] font-medium text-neutral-500 dark:text-zinc-400">
                            {isBg ? "Няма корица" : "No cover"}
                        </div>
                    )}
                </div>
            </button>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-[18px] font-semibold text-neutral-950 dark:text-white">
                            {gallery.title}
                        </h3>

                        {gallery.description ? (
                            <p className="mt-2 line-clamp-2 min-h-[3rem] text-[14px] leading-6 text-neutral-600 dark:text-zinc-300">
                                {gallery.description}
                            </p>
                        ) : (
                            <div className="mt-2 min-h-[3rem]" />
                        )}
                    </div>

                    <ClientGalleryStatusBadge
                        previewEnabled={gallery.previewEnabled}
                        downloadEnabled={gallery.downloadEnabled}
                        isExpired={gallery.isExpired}
                        isBg={isBg}
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-500 dark:text-zinc-400">
                            {isBg ? "Преглед" : "Preview"}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-neutral-950 dark:text-white">
                            {gallery.previewEnabled ? (isBg ? "Разрешен" : "Enabled") : (isBg ? "Изключен" : "Disabled")}
                        </p>
                    </div>

                    <div className="rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-500 dark:text-zinc-400">
                            {isBg ? "Изтегляне" : "Download"}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-neutral-950 dark:text-white">
                            {gallery.downloadEnabled ? (isBg ? "Разрешено" : "Enabled") : (isBg ? "Изключено" : "Disabled")}
                        </p>
                    </div>
                </div>

                {gallery.downloadEnabled && gallery.remainingDownloadDays !== null ? (
                    <p className="text-[13px] text-neutral-500 dark:text-zinc-400">
                        {isBg
                            ? `Остават ${gallery.remainingDownloadDays} дни`
                            : `${gallery.remainingDownloadDays} days remaining`}
                    </p>
                ) : (
                    <div className="h-[20px]" />
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={handleOpen}
                        disabled={loading || !canPreview}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-5 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {loading
                            ? isBg ? "Зареждане..." : "Loading..."
                            : isBg ? "Отвори" : "Open"}
                    </button>

                    {canDownload ? (
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-700 px-5 text-[14px] font-semibold text-white transition hover:bg-emerald-800"
                        >
                            {isBg ? "Изтегли всички" : "Download all"}
                        </button>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </div>
    )
}