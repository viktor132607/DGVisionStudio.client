import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { apiFetch } from "../../services/api"
import { markAdminContactRequestsSeen } from "../../services/adminNotifications"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { useAdminToast } from "../../hooks/useAdminToast"

type ContactStatus = "New" | "InProgress" | "Completed" | "Rejected"

type ContactRequest = {
    id: string
    name: string
    email: string
    phone?: string | null
    subject?: string | null
    message: string
    createdAtUtc?: string | null
    updatedAtUtc?: string | null
    status?: string | number | null
    adminComment?: string | null
    isArchived?: boolean
    isSeenByAdmin?: boolean
}

const statusOptions: ContactStatus[] = ["New", "InProgress", "Completed", "Rejected"]

const statusLabels: Record<ContactStatus, string> = {
    New: "Ново",
    InProgress: "В процес",
    Completed: "Завършено",
    Rejected: "Отказано",
}

const statusValues: Record<ContactStatus, number> = {
    New: 0,
    InProgress: 1,
    Completed: 2,
    Rejected: 3,
}

export default function ContactRequestsAdmin() {
    const { showToast } = useAdminToast()

    const [requests, setRequests] = useState<ContactRequest[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState<string | null>(null)
    const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null)

    const normalizeStatus = (status?: string | number | null): ContactStatus => {
        if (status === null || status === undefined || status === "") return "New"

        if (typeof status === "number") {
            if (status === 0) return "New"
            if (status === 1) return "InProgress"
            if (status === 2) return "Completed"
            if (status === 3) return "Rejected"
            return "New"
        }

        const normalized = status.toLowerCase().replace(/[\s_-]/g, "")

        if (normalized === "inprogress") return "InProgress"
        if (normalized === "completed" || normalized === "answered") return "Completed"
        if (normalized === "rejected" || normalized === "cancelled" || normalized === "canceled" || normalized === "closed" || normalized === "archived") return "Rejected"

        return "New"
    }

    const getDisplayCode = (id: string, codeMap: Map<string, string>) => {
        return codeMap.get(id) ?? "000000"
    }

    const load = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await apiFetch("/admin/contact-requests", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Грешка при зареждане на запитванията.")
            }

            const data = await response.json().catch(() => [])
            setRequests(Array.isArray(data) ? data : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на запитванията."

            setError(message)
            setRequests([])

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
                await markAdminContactRequestsSeen()

                setRequests((current) =>
                    current.map((request) => ({
                        ...request,
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

    const requestCodes = useMemo(() => {
        const sortedRequests = [...requests].sort((a, b) => {
            const firstDate = a.createdAtUtc ? new Date(a.createdAtUtc).getTime() : 0
            const secondDate = b.createdAtUtc ? new Date(b.createdAtUtc).getTime() : 0

            if (firstDate !== secondDate) return firstDate - secondDate

            return a.id.localeCompare(b.id)
        })

        return new Map(sortedRequests.map((request, index) => [request.id, String(index + 1).padStart(6, "0")]))
    }, [requests])

    const remove = async () => {
        if (!deleteRequestId) return

        setBusyId(deleteRequestId)
        setError("")

        try {
            const response = await apiFetch(`/admin/contact-requests/${deleteRequestId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Изтриването беше неуспешно.")
            }

            setRequests((current) => current.filter((request) => request.id !== deleteRequestId))
            setDeleteRequestId(null)

            showToast({
                type: "success",
                title: "Готово",
                message: "Запитването беше изтрито успешно.",
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

    const changeStatus = async (id: string, status: ContactStatus) => {
        const requestToUpdate = requests.find((request) => request.id === id)
        const isArchived = status === "Completed" || status === "Rejected"

        setBusyId(id)
        setError("")

        try {
            const response = await apiFetch(`/admin/contact-requests/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    status: statusValues[status],
                    adminComment: requestToUpdate?.adminComment ?? null,
                    isArchived,
                }),
            })

            if (!response.ok) {
                throw new Error("Промяната на статуса беше неуспешна.")
            }

            setRequests((current) =>
                current.map((request) =>
                    request.id === id
                        ? {
                            ...request,
                            status,
                            isArchived,
                            updatedAtUtc: new Date().toISOString(),
                        }
                        : request
                )
            )

            showToast({
                type: "success",
                title: "Готово",
                message: "Статусът беше променен успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Промяната на статуса беше неуспешна."

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

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const handlePageSizeChange = (value: number) => {
        setPageSize(value)
        setCurrentPage(1)
    }

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase()

        return requests.filter((request) => {
            const status = normalizeStatus(request.status)
            const displayCode = getDisplayCode(request.id, requestCodes)

            const matchesSearch =
                !term ||
                displayCode.includes(term) ||
                `#${displayCode}`.includes(term) ||
                request.name?.toLowerCase().includes(term) ||
                request.email?.toLowerCase().includes(term) ||
                request.phone?.toLowerCase().includes(term) ||
                request.subject?.toLowerCase().includes(term) ||
                request.message?.toLowerCase().includes(term)

            const matchesStatus = statusFilter === "all" || status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [requests, requestCodes, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedRequests = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredRequests.slice(start, start + pageSize)
    }, [filteredRequests, safeCurrentPage, pageSize])

    const groupedRequests = useMemo(() => {
        return {
            newRequests: pagedRequests.filter((request) => normalizeStatus(request.status) === "New"),
            inProgressRequests: pagedRequests.filter((request) => normalizeStatus(request.status) === "InProgress"),
            completedRequests: pagedRequests.filter((request) => normalizeStatus(request.status) === "Completed"),
            rejectedRequests: pagedRequests.filter((request) => normalizeStatus(request.status) === "Rejected"),
        }
    }, [pagedRequests])

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

    const renderRequestCards = (sectionRequests: ContactRequest[], emptyText: string) => (
        <div className="space-y-3 lg:hidden">
            {sectionRequests.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-5 text-sm text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">{emptyText}</p>
            ) : sectionRequests.map(request => {
                const status = normalizeStatus(request.status)
                const isBusy = busyId === request.id
                return (
                    <article key={request.id} aria-label={`Запитване #${getDisplayCode(request.id, requestCodes)}`}
                        className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="space-y-4 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-zinc-400">#{getDisplayCode(request.id, requestCodes)}</p>
                                    <h3 className="mt-1 text-lg font-semibold leading-snug text-gray-900 dark:text-white">{request.name}</h3>
                                </div>
                                {request.isSeenByAdmin === false && <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">Непрочетено</span>}
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs text-gray-500 dark:text-zinc-400">Имейл</dt>
                                    <dd className="mt-1 break-words text-blue-600 dark:text-blue-400"><a href={`mailto:${request.email}`} className="inline-flex min-h-11 max-w-full items-center [overflow-wrap:anywhere]">{request.email}</a></dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 dark:text-zinc-400">Телефон</dt>
                                    <dd className="mt-1 text-blue-600 dark:text-blue-400">{request.phone ? <a href={`tel:${request.phone}`} className="inline-flex min-h-11 items-center">{request.phone}</a> : "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 dark:text-zinc-400">Тема</dt>
                                    <dd className="mt-1 break-words text-gray-900 dark:text-zinc-100">{request.subject || "—"}</dd>
                                </div>
                                <div className="rounded-2xl bg-gray-50 p-3 dark:bg-zinc-800/60">
                                    <dt className="text-xs text-gray-500 dark:text-zinc-400">Съобщение</dt>
                                    <dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed text-gray-900 dark:text-zinc-100 [overflow-wrap:anywhere]">{request.message}</dd>
                                </div>
                            </dl>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">
                                {request.createdAtUtc ? new Date(request.createdAtUtc).toLocaleString("bg-BG") : "Няма дата"}
                            </p>
                            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400">
                                Статус
                                <select aria-label={`Статус на запитване #${getDisplayCode(request.id, requestCodes)}`}
                                    value={status} disabled={isBusy}
                                    onChange={event => void changeStatus(request.id, event.target.value as ContactStatus)}
                                    className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                    {statusOptions.map(option => <option key={option} value={option}>{statusLabels[option]}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-1 border-t border-gray-100 p-2 dark:border-zinc-800">
                            <Link to={`/admin/contact-requests/${request.id}`} className="flex min-h-11 items-center justify-center rounded-xl px-1 text-xs font-semibold text-blue-600 active:bg-blue-50 dark:text-blue-400 dark:active:bg-zinc-800">Преглед</Link>
                            <Link to={`/admin/contact-requests/${request.id}/edit`} className="flex min-h-11 items-center justify-center rounded-xl px-1 text-xs font-semibold text-blue-600 active:bg-blue-50 dark:text-blue-400 dark:active:bg-zinc-800">Редакция</Link>
                            <button type="button" onClick={() => setDeleteRequestId(request.id)} disabled={isBusy} className="min-h-11 rounded-xl px-1 text-xs font-semibold text-red-600 active:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:active:bg-red-500/10">{isBusy ? "…" : "Изтрий"}</button>
                        </div>
                    </article>
                )
            })}
        </div>
    )

    const renderRequestsTable = (sectionRequests: ContactRequest[], emptyText: string) => (
        <>
        {renderRequestCards(sectionRequests, emptyText)}
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <thead className="bg-gray-50 dark:bg-zinc-950">
                    <tr>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Код</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Име</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Email</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Телефон</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Тема</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Статус</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Съобщение</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Дата</th>
                        <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {sectionRequests.length > 0 ? (
                        sectionRequests.map((request) => {
                            const status = normalizeStatus(request.status)
                            const isBusy = busyId === request.id

                            return (
                                <tr
                                    key={request.id}
                                    className={`border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950 ${
                                        request.isSeenByAdmin === false
                                            ? "bg-red-50/60 dark:bg-red-500/5"
                                            : ""
                                    }`}
                                >
                                    <td className="p-3 text-xs font-semibold text-gray-600 dark:text-zinc-300">
                                        #{getDisplayCode(request.id, requestCodes)}
                                    </td>

                                    <td className="p-3 text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            {request.isSeenByAdmin === false ? (
                                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                                            ) : null}
                                            {request.name}
                                        </div>
                                    </td>

                                    <td className="p-3 text-gray-900 dark:text-white">{request.email}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{request.phone || "-"}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{request.subject || "-"}</td>
                                    <td className="p-3">
                                        <select
                                            value={statusLabels[status]}
                                            disabled={isBusy}
                                            onChange={(event) => void changeStatus(request.id, event.target.value as ContactStatus)}
                                            className="rounded-lg border border-green-700 bg-green-600 px-3 py-1.5 text-sm font-semibold text-white outline-none transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-500 dark:bg-green-600 dark:hover:bg-green-700"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option} value={option} className="bg-white text-gray-900">
                                                    {statusLabels[option]}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td
                                        className="max-w-xs truncate p-3 text-gray-900 dark:text-white"
                                        title={request.message}
                                    >
                                        {request.message}
                                    </td>

                                    <td className="p-3 text-sm text-gray-600 dark:text-zinc-300">
                                        {request.createdAtUtc
                                            ? new Date(request.createdAtUtc).toLocaleString("bg-BG")
                                            : "-"}
                                    </td>

                                    <td className="p-3">
                                        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                            <Link
                                                to={`/admin/contact-requests/${request.id}`}
                                                className="rounded-lg bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-700"
                                            >
                                                Details
                                            </Link>

                                            <Link
                                                to={`/admin/contact-requests/${request.id}/edit`}
                                                className="rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => setDeleteRequestId(request.id)}
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
                            <td colSpan={9} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                {emptyText}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </>
    )

    return (
        <div className="min-h-screen bg-[#f2f2f7] p-6 dark:bg-black lg:bg-transparent lg:dark:bg-transparent">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Запитвания
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Общо: {filteredRequests.length}
                        </p>
                    </div>


                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_200px_180px]">
                    <label className="relative col-span-2 min-w-0 lg:col-span-1">
                    <span className="sr-only">Търси запитвания</span>
                    <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Търси запитвания"
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        className="min-h-11 w-full rounded-xl border-0 bg-white py-2 pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                    />

                    </label>
                    <select
                        aria-label="Филтрирай по статус"
                        value={statusFilter}
                        onChange={(event) => handleStatusFilterChange(event.target.value)}
                        className="min-h-11 rounded-xl border-0 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">Всички статуси</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Запитвания на страница"
                        value={pageSize}
                        onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                        className="min-h-11 rounded-xl border-0 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
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
                    <section className="space-y-5">
                        <div>
                            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Активни заявки</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">Нови</h3>
                                    {renderRequestsTable(groupedRequests.newRequests, "Няма нови заявки.")}
                                </div>

                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">В процес</h3>
                                    {renderRequestsTable(groupedRequests.inProgressRequests, "Няма заявки в процес.")}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Архив</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">Завършени</h3>
                                    {renderRequestsTable(groupedRequests.completedRequests, "Няма завършени заявки.")}
                                </div>

                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">Отказани</h3>
                                    {renderRequestsTable(groupedRequests.rejectedRequests, "Няма отказани заявки.")}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <button
                            disabled={safeCurrentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Предишна
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
                            Следваща
                        </button>
                    </div>
                </>
            ) : null}

            <ConfirmDialog
                open={deleteRequestId !== null}
                title="Изтриване на запитване"
                description="Сигурен ли си, че искаш да изтриеш това запитване?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={busyId === deleteRequestId}
                onConfirm={() => void remove()}
                onCancel={() => {
                    if (busyId !== deleteRequestId) {
                        setDeleteRequestId(null)
                    }
                }}
            />
        </div>
    )
}
