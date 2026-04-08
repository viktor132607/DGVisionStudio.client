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
    return (
        <div className="border-b border-neutral-300 bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 dark:scrollbar-thumb-zinc-600 w-full overflow-x-auto">
                <div className="flex min-w-full w-max items-center justify-center gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:gap-8 lg:px-8">
                    {categories
                        .filter((category) => category.isActive !== false)
                        .sort(
                            (a, b) =>
                                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                                a.label.localeCompare(b.label)
                        )
                        .map((category) => {
                            const active = activeCategory === category.key

                            return (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => onChange(category.key)}
                                    className={`relative whitespace-nowrap pb-2 text-[11px] font-bold uppercase tracking-[0.06em] transition sm:text-sm ${
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