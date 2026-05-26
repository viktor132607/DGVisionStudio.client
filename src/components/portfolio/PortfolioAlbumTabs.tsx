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
                <div className="flex min-w-full w-max items-center justify-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
                    {albums.map((album) => {
                        const active = activeAlbum === album.key

                        return (
                            <button
                                key={album.key}
                                type="button"
                                onClick={() => onChange(album.key)}
                                className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-[11px] font-bold uppercase tracking-[0.08em] transition sm:px-5 sm:text-xs ${
                                    active
                                        ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                        : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                                }`}
                            >
                                {album.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}