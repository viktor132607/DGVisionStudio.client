type AlbumBulkActionsBarProps = {
    isBg: boolean
    selectedCount: number
    canMove: boolean
    onClearSelection: () => void
    onDeleteSelected: () => void
    onMoveSelected?: () => void
}

const selectAllPhotoCheckboxes = () => {
    const checkboxes = Array.from(
        document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    ).filter((input) => {
        const className = String(input.className || "")
        return className.includes("border-white/80") && className.includes("bg-white/90")
    })

    checkboxes.forEach((checkbox) => {
        if (!checkbox.checked && !checkbox.disabled) {
            checkbox.click()
        }
    })
}

export default function AlbumBulkActionsBar({
    isBg,
    selectedCount,
    canMove,
    onClearSelection,
    onDeleteSelected,
    onMoveSelected,
}: AlbumBulkActionsBarProps) {
    return (
        <div className="sticky top-4 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                {isBg
                    ? `Избрани снимки: ${selectedCount}`
                    : `Selected photos: ${selectedCount}`}
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={selectAllPhotoCheckboxes}
                    className="inline-flex items-center rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                    {isBg ? "Маркирай всички" : "Select all"}
                </button>

                {canMove && onMoveSelected ? (
                    <button
                        type="button"
                        onClick={onMoveSelected}
                        disabled={selectedCount <= 0}
                        className="inline-flex items-center rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
                    >
                        {isBg ? "Премести" : "Move"}
                    </button>
                ) : null}

                <button
                    type="button"
                    onClick={onDeleteSelected}
                    disabled={selectedCount <= 0}
                    className="inline-flex items-center rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                    {isBg ? "Изтрий избраните" : "Delete selected"}
                </button>

                <button
                    type="button"
                    onClick={onClearSelection}
                    disabled={selectedCount <= 0}
                    className="inline-flex items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    {isBg ? "Изчисти избора" : "Clear selection"}
                </button>
            </div>
        </div>
    )
}
