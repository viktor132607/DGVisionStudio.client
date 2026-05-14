import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../services/api"
import type { PagedResultDto } from "../../types/pagination"

type User = {
    id: string
    email: string
    isBlocked: boolean
    emailConfirmed?: boolean
    roles?: string[]
    isProtectedAdmin?: boolean
}

export default function UsersAdmin() {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const loadUsers = () => {
        setLoading(true)

        apiFetch(`/admin/users?page=${currentPage}&pageSize=${pageSize}`, {
            method: "GET",
            skipJsonContentType: true,
        })
            .then(r => r.json())
            .then((data: PagedResultDto<User> | User[]) => {
                if (Array.isArray(data)) {
                    setUsers(data)
                    setTotal(data.length)
                    return
                }

                setUsers(Array.isArray(data.items) ? data.items : [])
                setTotal(Number(data.total ?? 0))
            })
            .catch(() => {
                setUsers([])
                setTotal(0)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadUsers()
    }, [currentPage, pageSize])

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        return users
            .filter(u => {
                if (statusFilter === "active") return !u.isBlocked
                if (statusFilter === "blocked") return u.isBlocked
                return true
            })
            .filter(u => {
                if (!normalizedSearch) return true

                return (
                    u.email?.toLowerCase().includes(normalizedSearch) ||
                    u.id?.toLowerCase().includes(normalizedSearch) ||
                    (u.roles ?? []).join(" ").toLowerCase().includes(normalizedSearch)
                )
            })
    }, [users, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const block = async (id: string) => {
        await apiFetch(`/admin/users/${id}/block`, {
            method: "POST",
        })
        loadUsers()
    }

    const unblock = async (id: string) => {
        await apiFetch(`/admin/users/${id}/unblock`, {
            method: "POST",
        })
        loadUsers()
    }

    const remove = async (id: string) => {
        const confirmDelete = window.confirm("Сигурен ли си, че искаш да изтриеш този потребител?")
        if (!confirmDelete) return

        await apiFetch(`/admin/users/${id}`, {
            method: "DELETE",
        })
        loadUsers()
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Link
                        to="/admin"
                        className="mb-4 inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    >
                        Назад
                    </Link>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Администриране на потребители
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 sm:text-base">
                        Управление на потребителски акаунти и достъп до албуми
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center self-start rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 lg:self-auto"
                >
                    Обнови
                </button>
            </div>

            <div className="mb-6 grid w-full gap-4 rounded-none border-y border-gray-200 bg-white p-4 shadow-none dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl sm:border sm:p-5 sm:shadow-sm xl:grid-cols-12">
                <div className="xl:col-span-6">
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                        Търсене в текущата страница
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Търси по имейл..."
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                    />
                </div>

                <div className="xl:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                        Статус в текущата страница
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                    >
                        <option value="all">Всички</option>
                        <option value="active">Активни</option>
                        <option value="blocked">Блокирани</option>
                    </select>
                </div>

                <div className="xl:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                        На страница
                    </label>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value))
                            setCurrentPage(1)
                        }}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                    Показани {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    {" - "}
                    {Math.min(currentPage * pageSize, total)} от {total}
                </div>

                <div className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                    {loading ? "Зареждане..." : `Страница ${currentPage} от ${totalPages}`}
                </div>
            </div>

            <div className="w-full overflow-hidden rounded-none border-y border-gray-200 bg-white shadow-none dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl sm:border sm:shadow-sm">
                <div className="hidden xl:block">
                    <table className="w-full table-fixed">
                        <thead className="bg-gray-50 dark:bg-zinc-950">
                            <tr className="border-b border-gray-200 dark:border-zinc-800">
                                <th className="w-[42%] px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                    Имейл
                                </th>
                                <th className="w-[16%] px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                    Потвърден
                                </th>
                                <th className="w-[16%] px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                    Статус
                                </th>
                                <th className="w-[26%] px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                    Действия
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <tr
                                        key={u.id}
                                        className="border-b border-gray-100 align-top transition hover:bg-gray-50 last:border-b-0 dark:border-zinc-800 dark:hover:bg-zinc-950/70"
                                    >
                                        <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                                            <div className="flex flex-col gap-2">
                                                <span className="break-all font-semibold">{u.email}</span>

                                                <div className="flex flex-wrap gap-2">
                                                    {u.roles?.includes("Admin") ? (
                                                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                                                            Админ
                                                        </span>
                                                    ) : null}

                                                    {u.isProtectedAdmin && u.roles?.includes("Admin") ? (
                                                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                                                            Защитен администратор
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5 text-sm font-medium text-gray-700 dark:text-zinc-300">
                                            {typeof u.emailConfirmed === "boolean"
                                                ? u.emailConfirmed ? "Да" : "Не"
                                                : "-"}
                                        </td>

                                        <td className="px-5 py-5">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    u.isBlocked
                                                        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                                                        : "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
                                                }`}
                                            >
                                                {u.isBlocked ? "Блокиран" : "Активен"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    to={`/admin/users/${u.id}/albums`}
                                                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    Албуми
                                                </Link>

                                                {!u.isBlocked ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => block(u.id)}
                                                        disabled={u.isProtectedAdmin || loading}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Блокирай
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => unblock(u.id)}
                                                        disabled={loading}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Отблокирай
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => remove(u.id)}
                                                    disabled={u.isProtectedAdmin || loading}
                                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                                >
                                                    Изтрий
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-sm font-medium text-gray-500 dark:text-zinc-400">
                                        Няма намерени потребители
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="grid gap-4 p-4 xl:hidden sm:p-5">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="mb-3">
                                    <div className="break-all text-base font-semibold text-gray-900 dark:text-white">
                                        {u.email}
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {u.roles?.includes("Admin") ? (
                                            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                                                Админ
                                            </span>
                                        ) : null}

                                        {u.isProtectedAdmin && u.roles?.includes("Admin") ? (
                                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                                                Защитен администратор
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                            Потвърден
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                            {typeof u.emailConfirmed === "boolean"
                                                ? u.emailConfirmed ? "Да" : "Не"
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                            Статус
                                        </div>
                                        <div className="mt-2">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    u.isBlocked
                                                        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                                                        : "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
                                                }`}
                                            >
                                                {u.isBlocked ? "Блокиран" : "Активен"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                    <Link
                                        to={`/admin/users/${u.id}/albums`}
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Албуми
                                    </Link>

                                    {!u.isBlocked ? (
                                        <button
                                            type="button"
                                            onClick={() => block(u.id)}
                                            disabled={u.isProtectedAdmin || loading}
                                            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Блокирай
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => unblock(u.id)}
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Отблокирай
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => remove(u.id)}
                                        disabled={u.isProtectedAdmin || loading}
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                    >
                                        Изтрий
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm font-medium text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                            Няма намерени потребители
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                    Предишна
                </button>

                <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                    Следваща
                </button>
            </div>
        </div>
    )
}