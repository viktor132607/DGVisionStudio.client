import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../../services/api"
import { markAdminUsersSeen } from "../../../services/adminNotifications"
import ConfirmDialog from "../../../components/admin/ConfirmDialog"
import { useAdminToast } from "../../../hooks/useAdminToast"

type UserRow = {
    id: string
    email: string
    isBlocked: boolean
    isSeenByAdmin: boolean
    createdAtUtc?: string | null
    emailConfirmed: boolean
    roles: string[]
    isProtectedAdmin: boolean
}

type PagedUsersResponse = {
    page: number
    pageSize: number
    total: number
    items: UserRow[]
}

export default function UsersAdmin() {
    const { showToast } = useAdminToast()

    const [users, setUsers] = useState<UserRow[]>([])
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState<string | null>(null)
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

    const load = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await apiFetch("/admin/users?page=1&pageSize=500", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Грешка при зареждане на потребителите.")
            }

            const data = (await response.json().catch(() => null)) as PagedUsersResponse | null
            setUsers(Array.isArray(data?.items) ? data.items : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на потребителите."
            setError(message)
            setUsers([])

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const init = async () => {
            await load()

            try {
                await markAdminUsersSeen()

                setUsers((current) =>
                    current.map((user) => ({
                        ...user,
                        isSeenByAdmin: true,
                    }))
                )
            } catch {
                // Не чупим страницата само заради seen брояча.
            }
        }

        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const makeAdmin = async (id: string) => {
        setBusyId(id)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${id}/make-admin`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Неуспешно добавяне на Admin роля.")
            }

            await load()

            showToast({
                type: "success",
                title: "Готово",
                message: "Admin ролята беше добавена успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно добавяне на Admin роля."
            setError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyId(null)
        }
    }

    const removeAdmin = async (id: string) => {
        setBusyId(id)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${id}/remove-admin`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Неуспешно премахване на Admin роля.")
            }

            await load()

            showToast({
                type: "success",
                title: "Готово",
                message: "Admin ролята беше премахната успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно премахване на Admin роля."
            setError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyId(null)
        }
    }

    const blockUser = async (id: string) => {
        setBusyId(id)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${id}/block`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Неуспешно блокиране на потребителя.")
            }

            await load()

            showToast({
                type: "success",
                title: "Готово",
                message: "Потребителят беше блокиран успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно блокиране на потребителя."
            setError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyId(null)
        }
    }

    const unblockUser = async (id: string) => {
        setBusyId(id)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${id}/unblock`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Неуспешно отблокиране на потребителя.")
            }

            await load()

            showToast({
                type: "success",
                title: "Готово",
                message: "Потребителят беше отблокиран успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно отблокиране на потребителя."
            setError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyId(null)
        }
    }

    const deleteUser = async () => {
        if (!deleteUserId) return

        setBusyId(deleteUserId)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${deleteUserId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Изтриването беше неуспешно.")
            }

            setUsers((current) => current.filter((user) => user.id !== deleteUserId))
            setDeleteUserId(null)

            showToast({
                type: "success",
                title: "Готово",
                message: "Потребителят беше изтрит успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Изтриването беше неуспешно."
            setError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyId(null)
        }
    }

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value)
        setCurrentPage(1)
    }

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const handlePageSizeChange = (value: number) => {
        setPageSize(value)
        setCurrentPage(1)
    }

    const roles = useMemo(() => {
        return Array.from(new Set(users.flatMap((user) => user.roles || []))).sort()
    }, [users])

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase()

        return users.filter((user) => {
            const matchesSearch =
                !term ||
                user.id.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term)

            const matchesRole =
                roleFilter === "all" ||
                user.roles?.includes(roleFilter)

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && !user.isBlocked) ||
                (statusFilter === "blocked" && user.isBlocked) ||
                (statusFilter === "confirmed" && user.emailConfirmed) ||
                (statusFilter === "unconfirmed" && !user.emailConfirmed)

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, search, roleFilter, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedUsers = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredUsers.slice(start, start + pageSize)
    }, [filteredUsers, safeCurrentPage, pageSize])

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Потребители
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Общо: {filteredUsers.length}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => void load()}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Обнови
                        </button>

                        <Link
                            to="/admin"
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Назад
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                        type="text"
                        placeholder="Търси по email или ID..."
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700 lg:flex-1"
                    />

                    <select
                        value={roleFilter}
                        onChange={(event) => handleRoleFilterChange(event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">Всички роли</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) => handleStatusFilterChange(event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">Всички статуси</option>
                        <option value="active">Активни</option>
                        <option value="blocked">Блокирани</option>
                        <option value="confirmed">Потвърден email</option>
                        <option value="unconfirmed">Непотвърден email</option>
                    </select>

                    <select
                        value={pageSize}
                        onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value={20}>20 / страница</option>
                        <option value={60}>60 / страница</option>
                        <option value={100}>100 / страница</option>
                    </select>
                </div>
            </div>

            {error ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Зареждане...
                </div>
            ) : null}

            {!loading ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <thead className="bg-gray-50 dark:bg-zinc-950">
                                <tr>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Email</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Роли</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Email статус</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Статус</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Дата</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Действия</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagedUsers.length > 0 ? (
                                    pagedUsers.map((user) => {
                                        const isAdmin = user.roles?.includes("Admin")
                                        const isBusy = busyId === user.id

                                        return (
                                            <tr
                                                key={user.id}
                                                className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                            >
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {user.email}
                                                        </span>

                                                        {!user.isSeenByAdmin ? (
                                                            <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                                                Нов
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>

                                                <td className="p-3 text-gray-900 dark:text-white">
                                                    {user.roles?.length ? user.roles.join(", ") : "-"}
                                                </td>

                                                <td className="p-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                            user.emailConfirmed
                                                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                                        }`}
                                                    >
                                                        {user.emailConfirmed ? "Confirmed" : "Unconfirmed"}
                                                    </span>
                                                </td>

                                                <td className="p-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                            user.isBlocked
                                                                ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                                                : "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                                                        }`}
                                                    >
                                                        {user.isBlocked ? "Blocked" : "Active"}
                                                    </span>
                                                </td>

                                                <td className="p-3 text-sm text-gray-600 dark:text-zinc-300">
                                                    {user.createdAtUtc
                                                        ? new Date(user.createdAtUtc).toLocaleString("bg-BG")
                                                        : "-"}
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                                        <Link
                                                            to={`/admin/users/${user.id}/albums`}
                                                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-800"
                                                        >
                                                            Manage albums
                                                        </Link>

                                                        {isAdmin ? (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy || user.isProtectedAdmin}
                                                                onClick={() => void removeAdmin(user.id)}
                                                                className="rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Remove admin
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => void makeAdmin(user.id)}
                                                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Make admin
                                                            </button>
                                                        )}

                                                        {user.isBlocked ? (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => void unblockUser(user.id)}
                                                                className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Unblock
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy || user.isProtectedAdmin}
                                                                onClick={() => void blockUser(user.id)}
                                                                className="rounded-lg bg-orange-600 px-3 py-1.5 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Block
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            disabled={isBusy || user.isProtectedAdmin}
                                                            onClick={() => setDeleteUserId(user.id)}
                                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {isBusy ? "..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                            Няма намерени потребители.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <button
                            disabled={safeCurrentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Prev
                        </button>

                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`rounded-lg border px-3 py-1.5 ${
                                    page === safeCurrentPage
                                        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black"
                                        : "border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={safeCurrentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : null}

            <ConfirmDialog
                open={deleteUserId !== null}
                title="Изтриване на потребител"
                description="Сигурен ли си, че искаш да изтриеш този потребител?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={busyId === deleteUserId}
                onConfirm={() => void deleteUser()}
                onCancel={() => {
                    if (busyId !== deleteUserId) {
                        setDeleteUserId(null)
                    }
                }}
            />
        </div>
    )
}