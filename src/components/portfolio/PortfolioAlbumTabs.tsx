import type { AlbumTab } from "../../types/portfolio"

type PortfolioAlbumTabsProps = {
    albums: AlbumTab[]
    activeAlbum: string
    onChange: (album: string) => void
}

export default function PortfolioAlbumTabs({
    albums,
    activeAlbum,
    onChange,
}: PortfolioAlbumTabsProps) {
    return (
        <div className="border-b border-neutral-300 bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 dark:scrollbar-thumb-zinc-600 w-full overflow-x-auto">
                <div className="flex min-w-full w-max items-center justify-center gap-4 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:gap-6 lg:px-8">
                    {albums.map((album) => {
                        const active = activeAlbum === album.key

                        return (
                            <button
                                key={album.key}
                                type="button"
                                onClick={() => onChange(album.key)}
                                className={`relative whitespace-nowrap pb-2 text-[10px] font-bold uppercase tracking-[0.08em] transition sm:text-xs ${
                                    active
                                        ? "text-neutral-900 dark:text-white"
                                        : "text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white"
                                }`}
                            >
                                {album.label}

                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] transition-all ${
                                        active
                                            ? "w-full bg-neutral-900 dark:bg-white"
                                            : "w-0 bg-neutral-900 dark:bg-white"
                                    }`}
                                />
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}