import type { ReactNode } from "react"

type ProfileOverviewTabProps = {
    email?: string
    roles?: string[]
    isBg: boolean
    extra?: ReactNode
}

export default function ProfileOverviewTab({
    email,
    roles,
    isBg,
    extra,
}: ProfileOverviewTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-zinc-400">
                        {isBg ? "Имейл" : "Email"}
                    </p>
                    <p className="mt-3 break-all text-[17px] font-medium text-neutral-950 dark:text-white">
                        {email || "-"}
                    </p>
                </div>

                <div className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-zinc-400">
                        {isBg ? "Роли" : "Roles"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {roles?.length ? (
                            roles.map((role) => (
                                <span
                                    key={role}
                                    className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[13px] font-semibold text-neutral-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                >
                                    {role}
                                </span>
                            ))
                        ) : (
                            <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[13px] font-semibold text-neutral-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                {isBg ? "Потребител" : "User"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {extra}
        </div>
    )
}