import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    deletePrintRequest,
    getAdminPrintRequests,
    markPrintRequestSeen,
    updatePrintRequestStatus,
} from "../../services/printRequests"
import { markAdminPrintRequestsSeen } from "../../services/adminNotifications"
import type { PrintRequestDto } from "../../types/printRequest"

export default function PrintRequestsAdmin() {
    const [requests, setRequests] = useState<PrintRequestDto[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [busyId, setBusyId] = useState<number | null>(null)

    const load = async () => {
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const data = await getAdminPrintRequests()
            setRequests(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при зареждане на заявките за принтиране.")
            setRequests([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const init = async () => {
            await load()

            try {
                await markAdminPrintRequestsSeen()

                setRequests(current =>
                    current.map(request => ({
                        ...request,
                        isSeenByAdmin: true,
                    }))
                )
            } catch {
            }
        }

        void init()
    }, [])

    const normalizeStatus = (status?: string | number | null) => {
        if (status === null || status === undefined || status === "") return "New"

        if (typeof status === "number") {
            if (status === 0) return "New"
            if (status === 1) return "InProgress"
            if (status === 2) return "Completed"
            if (status === 3) return "Cancelled"

            return String(status)
        }

        return status
    }

    const remove = async (id: number) => {
        const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази заявка?")

        if (!confirmed) return

        setBusyId(id)
        setError("")
        setSuccess("")

        try {
            await deletePrintRequest(id)
            setRequests(current => current.filter(request => request.id !== id))
            setSuccess("Заявката е изтрита успешно.")
            window.setTimeout(() => setSuccess(""), 2500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Изтриването беше неуспешно.")
        } finally {
            setBusyId(null)
        }
    }

    const changeStatus = async (id: number, status: string) => {
        setBusyId(id)
        setError("")
        setSuccess("")

        try {
            await updatePrintRequestStatus(id, status)

            setRequests(current =>
                current.map(request =>
                    request.id === id
                        ? {
                            ...request,
                            status,
                            isSeenByAdmin: true,
                            updatedAtUtc: new Date().toISOString(),
                        }
                        : request
                )
            )

            setSuccess("Статусът е променен успешно.")
            window.setTimeout(() => setSuccess(""), 2500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Промяната на статуса беше неуспешна.")
        } finally {
            setBusyId(null)
        }
    }

    const markSeen = async (id: number) => {
        setBusyId(id)
        setError("")
        setSuccess("")

        try {
            await markPrintRequestSeen(id)

            setRequests(current =>
                current.map(request =>
                    request.id === id
                        ? {
                            ...request,
                            isSeenByAdmin: true,
                            updatedAtUtc: new Date().toISOString(),
                        }
                        : request
                )
            )

            setSuccess("Заявката е маркирана като видяна.")
            window.setTimeout(() => setSuccess(""), 2500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Маркирането като видяна беше неуспешно.")
        } finally {
            setBusyId(null)
        }
    }

    const handleSearchChange = (value: string) => {
        setSearch(value)
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

    const statuses = useMemo(() => {
        return Array.from(new Set(requests.map(x => normalizeStatus(x.status)).filter(Boolean))).sort()
    }, [requests])

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase()

        return requests.filter(request => {
            const status = normalizeStatus(request.status)

            const matchesSearch =
                !term ||
                String(request.id).toLowerCase().includes(term) ||
                request.albumTitle?.toLowerCase().includes(term) ||
                request.fullName?.toLowerCase().includes(term) ||
                request.email?.toLowerCase().includes(term) ||
                request.userEmail?.toLowerCase().includes(term) ||
                request.phone?.toLowerCase().includes(term) ||
                request.notes?.toLowerCase().includes(term)

            const matchesStatus = statusFilter === "all" || status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [requests, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedRequests = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredRequests.slice(start, start + pageSize)
    }, [filteredRequests, safeCurrentPage, pageSize])

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Заявки за принтиране
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Общо: {filteredRequests.length}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => void load()}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
                        placeholder="Търси по албум, име, email, телефон, бележки..."
                        value={search}
                        onChange={event => handleSearchChange(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700 lg:flex-1"
                    />

                    <select
                        value={statusFilter}
                        onChange={event => handleStatusFilterChange(event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">Всички статуси</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <select
                        value={pageSize}
                        onChange={event => handlePageSizeChange(Number(event.target.value))}
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

            {success ? (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                    {success}
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
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">ID</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Албум</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Клиент</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Email</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Телефон</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Снимки</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Статус</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Бележки</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Дата</th>
                                    <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Действия</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagedRequests.length > 0 ? (
                                    pagedRequests.map(request => {
                                        const status = normalizeStatus(request.status)
                                        const isBusy = busyId === request.id
                                        const isClientGallery = request.id < 0

                                        return (
                                            <tr
                                                key={request.id}
                                                className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                            >
                                                <td className="p-3 text-xs text-gray-500 dark:text-zinc-400">
                                                    {request.id}
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {request.albumTitle || "-"}
                                                        </span>

                                                        {isClientGallery ? (
                                                            <span className="mt-1 w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                                                Client print upload
                                                            </span>
                                                        ) : null}

                                                        {!request.isSeenByAdmin ? (
                                                            <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                                                Нова
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>

                                                <td className="p-3 text-gray-900 dark:text-white">
                                                    {request.fullName || request.userEmail || "-"}
                                                </td>

                                                <td className="p-3 text-gray-900 dark:text-white">
                                                    {request.email || request.userEmail || "-"}
                                                </td>

                                                <td className="p-3 text-gray-900 dark:text-white">
                                                    {request.phone || "-"}
                                                </td>

                                                <td className="p-3 text-gray-900 dark:text-white">
                                                    {request.items?.length ?? 0}
                                                </td>

                                                <td className="p-3">
                                                    <select
                                                        value={status}
                                                        disabled={isBusy}
                                                        onChange={event => void changeStatus(request.id, event.target.value)}
                                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                                                    >
                                                        <option value="New">New</option>
                                                        <option value="InProgress">InProgress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>

                                                <td
                                                    className="max-w-xs truncate p-3 text-gray-900 dark:text-white"
                                                    title={request.notes || ""}
                                                >
                                                    {request.notes || "-"}
                                                </td>

                                                <td className="p-3 text-sm text-gray-600 dark:text-zinc-300">
                                                    {request.createdAtUtc
                                                        ? new Date(request.createdAtUtc).toLocaleString("bg-BG")
                                                        : "-"}
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                                        <Link
                                                            to={`/admin/client-galleries/edit?id=${request.portfolioAlbumId}`}
                                                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-800"
                                                        >
                                                            Отвори
                                                        </Link>

                                                        {!request.isSeenByAdmin ? (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => void markSeen(request.id)}
                                                                className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Видяна
                                                            </button>
                                                        ) : null}

                                                        <button
                                                            type="button"
                                                            onClick={() => void remove(request.id)}
                                                            disabled={isBusy}
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
                                        <td colSpan={10} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                            Няма намерени заявки за принтиране.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <button
                            disabled={safeCurrentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Prev
                        </button>

                        {pageNumbers.map(page => (
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
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    )
}