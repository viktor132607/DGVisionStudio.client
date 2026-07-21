import type { PortfolioItem } from "../../types/portfolio"

type PortfolioGridProps = {
    items: PortfolioItem[]
    onSelect: (index: number) => void
}

function isVideoItem(item: PortfolioItem) {
    return item.mediaType === "Video" || /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(item.originalSrc || item.src || "")
}

export default function PortfolioGrid({
    items,
    onSelect,
}: PortfolioGridProps) {
    return (
        <div className="w-full bg-neutral-300 px-[5mm] py-[1px] dark:bg-zinc-800">
            <div className="grid grid-cols-2 gap-[1px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item, index) => {
                    const isVideo = isVideoItem(item)
                    const mediaSrc = item.originalSrc || item.src

                    return (
                        <button
                            key={`${item.id}-${index}`}
                            type="button"
                            onClick={() => onSelect(index)}
                            className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 text-left dark:bg-zinc-900"
                        >
                            {isVideo ? (
                                <>
                                    <video
                                        src={mediaSrc}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className="absolute inset-0 h-full w-full bg-black object-contain transition duration-500 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                        Video
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition group-hover:scale-105">
                                            ▶
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={item.src}
                                    alt={item.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                    onError={(event) => {
                                        const image = event.currentTarget
                                        const fallbackSrc = item.originalSrc?.trim()

                                        if (fallbackSrc && image.dataset.originalFallback !== "true") {
                                            image.dataset.originalFallback = "true"
                                            image.src = fallbackSrc
                                            return
                                        }

                                        image.alt = ""
                                        image.classList.add("opacity-0")
                                    }}
                                />
                            )}

                            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/30" />

                            <div className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-4 sm:p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 sm:tracking-[0.28em]">
                                    {item.albumLabel}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white sm:text-[15px]">
                                    {item.title}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
