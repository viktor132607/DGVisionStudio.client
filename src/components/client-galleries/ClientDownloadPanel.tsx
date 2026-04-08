type ClientDownloadPanelProps = {
    downloadEnabled: boolean
    isExpired: boolean
    remainingDownloadDays?: number | null
    downloadAllUrl?: string
    isBg: boolean
}

export default function ClientDownloadPanel({
    downloadEnabled,
    isExpired,
    remainingDownloadDays,
    downloadAllUrl,
    isBg,
}: ClientDownloadPanelProps) {
    if (!downloadEnabled || isExpired) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-[14px] text-neutral-500 dark:text-zinc-400">
                    {isBg
                        ? "Изтеглянето не е активно."
                        : "Downloading is not active."}
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[14px] font-medium text-emerald-700 dark:text-emerald-300">
                        {isBg
                            ? "Изтеглянето е активно."
                            : "Downloading is active."}
                    </p>

                    {remainingDownloadDays !== null && remainingDownloadDays !== undefined ? (
                        <p className="mt-1 text-[13px] text-emerald-700/90 dark:text-emerald-300/90">
                            {isBg
                                ? `Остават ${remainingDownloadDays} дни.`
                                : `${remainingDownloadDays} days remaining.`}
                        </p>
                    ) : null}
                </div>

                {downloadAllUrl ? (
                    <a
                        href={downloadAllUrl}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-700 bg-emerald-700 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-emerald-800 dark:border-emerald-300 dark:bg-emerald-300 dark:text-black dark:hover:bg-emerald-200"
                    >
                        {isBg ? "Изтегли всички" : "Download all"}
                    </a>
                ) : null}
            </div>
        </div>
    )
}