import { useTranslation } from "react-i18next"
import type { CategoryTab } from "../../types/portfolio"

type PortfolioCategoryTabsProps = {
    categories: CategoryTab[]
    activeCategory: string
    onChange: (category: string) => void
}

export default function PortfolioCategoryTabs({
    categories,
    activeCategory,
    onChange,
}: PortfolioCategoryTabsProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const visibleCategories = categories
        .filter((category) => category.isActive !== false)
        .sort(
            (a, b) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                a.label.localeCompare(b.label)
        )

    return (
        <div className="border-b border-neutral-300 bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="px-4 py-4 sm:hidden">
                <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-400">
                        {isBg ? "Категория" : "Category"}
                    </span>

                    <span className="relative block">
                        <select
                            value={activeCategory}
                            onChange={(event) => onChange(event.target.value)}
                            className="h-12 w-full appearance-none rounded-2xl border border-neutral-300 bg-white px-4 pr-12 text-[13px] font-extrabold uppercase tracking-[0.08em] text-neutral-950 outline-none transition focus:border-neutral-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                            aria-label={isBg ? "Избери категория" : "Choose category"}
                        >
                            {visibleCategories.map((category) => (
                                <option key={category.key} value={category.key}>
                                    {category.label}
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

            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 hidden w-full overflow-x-auto dark:scrollbar-thumb-zinc-600 sm:block">
                <div className="flex min-w-full w-max items-center justify-center gap-6 px-6 py-5 lg:gap-8 lg:px-8">
                    {visibleCategories.map((category) => {
                        const active = activeCategory === category.key

                        return (
                            <button
                                key={category.key}
                                type="button"
                                onClick={() => onChange(category.key)}
                                className={`relative whitespace-nowrap pb-2 text-sm font-bold uppercase tracking-[0.06em] transition ${
                                    active
                                        ? "text-neutral-900 dark:text-white"
                                        : "text-neutral-600 hover:text-neutral-900 dark:text-zinc-300 dark:hover:text-white"
                                }`}
                            >
                                {category.label}

                                <span
                                    className={`absolute bottom-0 left-0 h-[3px] transition-all ${
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
