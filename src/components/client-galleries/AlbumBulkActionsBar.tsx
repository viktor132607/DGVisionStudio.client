type AlbumBulkActionsBarProps = {
    isBg: boolean
    selectedCount: number
    canMove: boolean
    onClearSelection: () => void
    onDeleteSelected: () => void
    onMoveSelected?: () => void
}

export default function AlbumBulkActionsBar({
    isBg,
    selectedCount,
    canMove,
    onClearSelection,
    onDeleteSelected,
    onMoveSelected,
}: AlbumBulkActionsBarProps) {
    if (selectedCount <= 0) return null

    return (
        <div className="sticky top-4 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                {isBg
                    ? `Избрани снимки: ${selectedCount}`
                    : `Selected photos: ${selectedCount}`}
            </div>

            <div className="flex flex-wrap gap-2">
                {canMove && onMoveSelected ? (
                    <button
                        type="button"
                        onClick={onMoveSelected}
                        className="inline-flex items-center rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
                    >
                        {isBg ? "Премести" : "Move"}
                    </button>
                ) : null}

                <button
                    type="button"
                    onClick={onDeleteSelected}
                    className="inline-flex items-center rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                    {isBg ? "Изтрий избраните" : "Delete selected"}
                </button>

                <button
                    type="button"
                    onClick={onClearSelection}
                    className="inline-flex items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    {isBg ? "Изчисти избора" : "Clear selection"}
                </button>
            </div>
        </div>
    )
}