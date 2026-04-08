type PortfolioCategoryOption = {
    id: number
    name: string
    nameEn?: string | null
    key: string
    isActive: boolean
}

type AlbumVisibilitySectionProps = {
    isBg: boolean
    isPublic: boolean
    isPublished: boolean
    categories: PortfolioCategoryOption[]
    portfolioCategoryId: number | null
    onIsPublicChange: (value: boolean) => void
    onIsPublishedChange: (value: boolean) => void
    onPortfolioCategoryIdChange: (value: number | null) => void
}

export default function AlbumVisibilitySection({
    isBg,
    isPublic,
    isPublished,
    categories,
    portfolioCategoryId,
    onIsPublicChange,
    onIsPublishedChange,
    onPortfolioCategoryIdChange,
}: AlbumVisibilitySectionProps) {
    const activeCategories = categories
        .filter((category) => category.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                    {isBg ? "Видимост и портфолио" : "Visibility and portfolio"}
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                    <input
                        type="radio"
                        name="album-visibility"
                        checked={!isPublic}
                        onChange={() => onIsPublicChange(false)}
                        className="mt-1 h-4 w-4"
                    />
                    <div>
                        <div className="text-sm font-semibold text-neutral-950 dark:text-white">
                            {isBg ? "Частен албум" : "Private album"}
                        </div>
                        <div className="mt-1 text-sm text-neutral-600 dark:text-zinc-400">
                            {isBg
                                ? "Няма да се визуализира в портфолиото. Подходящ за клиентски достъп."
                                : "Will not be visible in the portfolio. Suitable for client access."}
                        </div>
                    </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                    <input
                        type="radio"
                        name="album-visibility"
                        checked={isPublic}
                        onChange={() => onIsPublicChange(true)}
                        className="mt-1 h-4 w-4"
                    />
                    <div>
                        <div className="text-sm font-semibold text-neutral-950 dark:text-white">
                            {isBg ? "Публичен албум" : "Public album"}
                        </div>
                        <div className="mt-1 text-sm text-neutral-600 dark:text-zinc-400">
                            {isBg
                                ? "Ще може да се показва в портфолиото."
                                : "Can be shown in the portfolio."}
                        </div>
                    </div>
                </label>
            </div>

            {isPublic ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                                {isBg ? "Категория" : "Category"}
                            </label>

                            <a
                                href="/admin/portfolio-categories/new"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-sky-700 underline underline-offset-4 dark:text-sky-300"
                            >
                                {isBg ? "Създай категория" : "Create category"}
                            </a>
                        </div>

                        <select
                            value={portfolioCategoryId ?? ""}
                            onChange={(e) =>
                                onPortfolioCategoryIdChange(
                                    e.target.value ? Number(e.target.value) : null
                                )
                            }
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition focus:border-neutral-400 focus:ring-0 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black"
                        >
                            <option value="">
                                {isBg ? "Избери категория" : "Select category"}
                            </option>

                            {activeCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {isBg
                                        ? category.name
                                        : category.nameEn?.trim() || category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-neutral-800 dark:text-zinc-200">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => onIsPublishedChange(e.target.checked)}
                                className="h-4 w-4 rounded"
                            />
                            {isBg
                                ? "Активен в портфолиото веднага"
                                : "Active in portfolio immediately"}
                        </label>
                    </div>
                </div>
            ) : null}
        </section>
    )
}