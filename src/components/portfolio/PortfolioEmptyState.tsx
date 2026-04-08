type PortfolioEmptyStateProps = {
    isBg: boolean
}

export default function PortfolioEmptyState({ isBg }: PortfolioEmptyStateProps) {
    return (
        <div className="w-full px-[5mm] py-12">
            <div className="rounded-[26px] border border-neutral-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800">
                <h2 className="text-[20px] font-bold uppercase tracking-[0.08em] text-neutral-900 dark:text-white sm:text-[24px]">
                    {isBg ? "Категорията е празна" : "This category is empty"}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-neutral-600 dark:text-zinc-300 sm:text-base">
                    {isBg
                        ? "Все още няма качено съдържание за тази категория или албум."
                        : "There is no uploaded content for this category or album yet."}
                </p>
            </div>
        </div>
    )
}