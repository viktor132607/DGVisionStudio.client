import type { PortfolioAlbumCard } from "../../types/portfolio"

type PortfolioAlbumGridProps = {
    items: PortfolioAlbumCard[]
    onSelect: (albumId: number) => void
}

export default function PortfolioAlbumGrid({
    items,
    onSelect,
}: PortfolioAlbumGridProps) {
    return (
        <div className="w-full bg-neutral-300 px-[5mm] py-[1px] dark:bg-zinc-800">
            <div className="grid grid-cols-1 gap-[1px] min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 text-left dark:bg-zinc-900"
                    >
                        <img
                            src={item.coverSrc}
                            alt={item.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />

                        <div className="absolute inset-0 bg-black/25 transition duration-300 group-hover:bg-black/40" />

                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 sm:tracking-[0.28em]">
                                {item.categoryLabel}
                            </p>

                            <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                                {item.title}
                            </p>

                            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/75 sm:text-xs">
                                {item.imageCount} снимки
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}