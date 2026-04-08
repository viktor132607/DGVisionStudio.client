type ProfileTabKey = "overview" | "galleries" | "security"

type ProfileTabsProps = {
    activeTab: ProfileTabKey
    onChange: (tab: ProfileTabKey) => void
    isBg: boolean
    galleriesCount?: number
    isAdmin?: boolean
}

export default function ProfileTabs({
    activeTab,
    onChange,
    isBg,
    galleriesCount = 0,
    isAdmin = false,
}: ProfileTabsProps) {
    const tabs: { key: ProfileTabKey; label: string; helper: string }[] = isBg
        ? [
              { key: "overview", label: "Профил", helper: "Информация за акаунта" },
              { key: "galleries", label: "Галерии", helper: "Споделени албуми" },
              { key: "security", label: "Сигурност", helper: "Парола и сесия" },
          ]
        : [
              { key: "overview", label: "Profile", helper: "Account information" },
              { key: "galleries", label: "Galleries", helper: "Shared albums" },
              { key: "security", label: "Security", helper: "Password and session" },
          ]

    return (
        <div>
            <div className="mb-5 rounded-[22px] border border-neutral-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-zinc-400">
                    {isBg ? "Навигация" : "Navigation"}
                </p>
                <p className="mt-3 text-[15px] leading-7 text-neutral-600 dark:text-zinc-300">
                    {isBg
                        ? `Имаш достъп до ${galleriesCount} галерии${isAdmin ? " и админ функции" : ""}.`
                        : `You have access to ${galleriesCount} galleries${isAdmin ? " and admin functions" : ""}.`}
                </p>
            </div>

            <div className="space-y-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onChange(tab.key)}
                            className={`flex w-full items-center justify-between rounded-[20px] border px-4 py-4 text-left transition ${
                                isActive
                                    ? "border-neutral-950 bg-neutral-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-black"
                                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                            }`}
                        >
                            <div>
                                <div className="text-[15px] font-semibold">{tab.label}</div>
                                <div
                                    className={`mt-1 text-[13px] ${
                                        isActive
                                            ? "text-white/80 dark:text-black/70"
                                            : "text-neutral-500 dark:text-zinc-400"
                                    }`}
                                >
                                    {tab.helper}
                                </div>
                            </div>

                            {tab.key === "galleries" ? (
                                <span
                                    className={`inline-flex min-w-[34px] items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                                        isActive
                                            ? "bg-white/15 text-white dark:bg-black/10 dark:text-black"
                                            : "bg-neutral-100 text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300"
                                    }`}
                                >
                                    {galleriesCount}
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export type { ProfileTabKey }