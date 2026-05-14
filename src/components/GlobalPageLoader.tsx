export default function GlobalPageLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="h-16 w-16 animate-spin rounded-full border-[4px] border-neutral-200 border-t-blue-600 dark:border-zinc-800 dark:border-t-blue-400" />
        </div>
    )
}