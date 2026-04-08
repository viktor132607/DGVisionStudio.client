import { useMemo, useState } from "react"

type UserOption = {
    id: string
    email: string
}

export type SelectedUserAccess = {
    userId: string
    email: string
    previewEnabled: boolean
    downloadEnabled: boolean
}

type UserAccessSelectorProps = {
    isBg: boolean
    users: UserOption[]
    value: SelectedUserAccess[]
    onChange: (value: SelectedUserAccess[]) => void
}

export default function UserAccessSelector({
    isBg,
    users,
    value,
    onChange,
}: UserAccessSelectorProps) {
    const [search, setSearch] = useState("")

    const normalizedSearch = search.trim().toLowerCase()

    const filteredUsers = useMemo(() => {
        return users
            .filter((user) => user.email.toLowerCase().includes(normalizedSearch))
            .slice(0, 20)
    }, [users, normalizedSearch])

    const selectedUserIds = new Set(value.map((item) => item.userId))

    const addUser = (user: UserOption) => {
        if (selectedUserIds.has(user.id)) return

        onChange([
            ...value,
            {
                userId: user.id,
                email: user.email,
                previewEnabled: true,
                downloadEnabled: false,
            },
        ])

        setSearch("")
    }

    const updateUser = (
        userId: string,
        patch: Partial<Pick<SelectedUserAccess, "previewEnabled" | "downloadEnabled">>
    ) => {
        onChange(
            value.map((item) =>
                item.userId === userId
                    ? {
                          ...item,
                          ...patch,
                      }
                    : item
            )
        )
    }

    const removeUser = (userId: string) => {
        onChange(value.filter((item) => item.userId !== userId))
    }

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                    {isBg ? "Достъп на потребители" : "User access"}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-zinc-400">
                    {isBg
                        ? "Добави потребители по имейл и задай preview / download достъп."
                        : "Add users by email and set preview / download access."}
                </p>
            </div>

            <div className="mb-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isBg ? "Търси по имейл..." : "Search by email..."}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                />
            </div>

            {search.trim() ? (
                <div className="mb-5 rounded-2xl border border-neutral-200 dark:border-zinc-800">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const alreadyAdded = selectedUserIds.has(user.id)

                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    disabled={alreadyAdded}
                                    onClick={() => addUser(user)}
                                    className="flex w-full items-center justify-between border-b border-neutral-200 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                                >
                                    <span className="text-sm text-neutral-900 dark:text-white">
                                        {user.email}
                                    </span>

                                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                                        {alreadyAdded
                                            ? isBg
                                                ? "Добавен"
                                                : "Added"
                                            : isBg
                                              ? "Добави"
                                              : "Add"}
                                    </span>
                                </button>
                            )
                        })
                    ) : (
                        <div className="px-4 py-4 text-sm text-neutral-500 dark:text-zinc-400">
                            {isBg ? "Няма намерени потребители." : "No users found."}
                        </div>
                    )}
                </div>
            ) : null}

            {value.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500 dark:border-zinc-700 dark:text-zinc-400">
                    {isBg
                        ? "Още няма добавени потребители с достъп."
                        : "No users with access added yet."}
                </div>
            ) : (
                <div className="space-y-3">
                    {value.map((item) => (
                        <div
                            key={item.userId}
                            className="rounded-2xl border border-neutral-200 p-4 dark:border-zinc-800"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="min-w-0 text-sm font-semibold text-neutral-950 dark:text-white">
                                    <span className="break-all">{item.email}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeUser(item.userId)}
                                    className="inline-flex items-center rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                                >
                                    {isBg ? "Премахни" : "Remove"}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-5">
                                <label className="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={item.previewEnabled}
                                        onChange={(e) =>
                                            updateUser(item.userId, {
                                                previewEnabled: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded"
                                    />
                                    Preview
                                </label>

                                <label className="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={item.downloadEnabled}
                                        onChange={(e) =>
                                            updateUser(item.userId, {
                                                downloadEnabled: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded"
                                    />
                                    Download
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}