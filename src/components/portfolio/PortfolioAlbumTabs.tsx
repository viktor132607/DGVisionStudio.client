import { useTranslation } from "react-i18next"
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
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    return (
        <div className="border-b border-neutral-300 bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="px-4 py-4 sm:hidden">
                <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-400">
                        {isBg ? "Албум" : "Album"}
                    </span>

                    <span className="relative block">
                        <select
                            value={activeAlbum}
                            onChange={(event) => onChange(event.target.value)}
                            className="h-12 w-full appearance-none rounded-2xl border border-neutral-300 bg-white px-4 pr-12 text-[13px] font-extrabold uppercase tracking-[0.08em] text-neutral-950 outline-none transition focus:border-neutral-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                            aria-label={isBg ? "Избери албум" : "Choose album"}
                        >
                            {albums.map((album) => (
                                <option key={album.key} value={album.key}>
                                    {album.label}
                                </option>
                            ))}
                        </select>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700 dark:text-zinc-200"
                            aria-hidden="true"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </span>
                </label>
            </div>

            <div className="hidden w-full sm:block">
                <div className="flex w-full flex-wrap items-center justify-center gap-2 px-6 py-3 lg:px-8">
                    {albums.map((album) => {
                        const active = activeAlbum === album.key

                        return (
                            <button
                                key={album.key}
                                type="button"
                                onClick={() => onChange(album.key)}
                                className={`inline-flex h-10 items-center justify-center rounded-full border px-5 text-xs font-bold uppercase tracking-[0.08em] transition ${
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
