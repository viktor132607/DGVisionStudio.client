import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    deletePrintRequest,
    getAdminPrintRequests,
    markPrintRequestSeen,
    updatePrintRequestStatus,
} from "../../services/printRequests"
import { markAdminPrintRequestsSeen } from "../../services/adminNotifications"
import { getGalleryPhotoDownloadUrl, getGalleryZipDownloadUrl } from "../../services/clientGalleries"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"
import type { PrintRequestDto, PrintRequestItemDto } from "../../types/printRequest"

type PrintStatus = "New" | "InProgress" | "Completed" | "Cancelled"

const statusOptions: PrintStatus[] = ["New", "InProgress", "Completed", "Cancelled"]

function normalizeStatus(status?: string | number | null): PrintStatus {
    if (status === 1 || status === "InProgress") return "InProgress"
    if (status === 2 || status === "Completed") return "Completed"
    if (status === 3 || status === "Cancelled") return "Cancelled"
    return "New"
}

function getPreviewImageUrl(item: PrintRequestItemDto) {
    const rawUrl = item.thumbnailUrl || item.imageUrl || ""
    return rawUrl ? resolveAssetUrl(rawUrl) : ""
}

function getPhotoId(item: PrintRequestItemDto) {
    return item.portfolioImageId || item.id
}

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
    const [previewRequest, setPreviewRequest] = useState<PrintRequestDto | null>(null)
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])

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
                setRequests(current => current.map(request => ({ ...request, isSeenByAdmin: true })))
            } catch {
            }
        }

        void init()
    }, [])

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

            return matchesSearch && (statusFilter === "all" || status === statusFilter)
        })
    }, [requests, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const pagedRequests = useMemo(() => filteredRequests.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize), [filteredRequests, safeCurrentPage, pageSize])

    const grouped = useMemo(() => ({
        newRequests: pagedRequests.filter(request => normalizeStatus(request.status) === "New"),
        inProgressRequests: pagedRequests.filter(request => normalizeStatus(request.status) === "InProgress"),
        completedRequests: pagedRequests.filter(request => normalizeStatus(request.status) === "Completed"),
        cancelledRequests: pagedRequests.filter(request => normalizeStatus(request.status) === "Cancelled"),
    }), [pagedRequests])

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

    const downloadUrl = (url: string) => {
        window.location.href = url
    }

    const downloadItem = (request: PrintRequestDto, item: PrintRequestItemDto) => {
        downloadUrl(getGalleryPhotoDownloadUrl(request.portfolioAlbumId, getPhotoId(item)))
    }

    const downloadAll = (request: PrintRequestDto) => {
        downloadUrl(getGalleryZipDownloadUrl(request.portfolioAlbumId))
    }

    const downloadSelected = () => {
        if (!previewRequest) return

        previewRequest.items
            .filter(item => selectedItemIds.includes(item.id))
            .forEach((item, index) => window.setTimeout(() => downloadItem(previewRequest, item), index * 300))
    }

    const openPreview = (request: PrintRequestDto) => {
        setPreviewRequest({ ...request, items: Array.isArray(request.items) ? request.items : [] })
        setSelectedItemIds([])
    }

    const closePreview = () => {
        setPreviewRequest(null)
        setSelectedItemIds([])
    }

    const toggleSelectedItem = (id: number) => {
        setSelectedItemIds(current => current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id])
    }

    const toggleAllSelected = () => {
        if (!previewRequest) return

        const allIds = previewRequest.items.map(item => item.id)
        setSelectedItemIds(current => current.length === allIds.length ? [] : allIds)
    }

    const remove = async (id: number) => {
        if (!window.confirm("Сигурен ли си, че искаш да изтриеш тази заявка?")) return

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

    const changeStatus = async (id: number, status: PrintStatus) => {
        setBusyId(id)
        setError("")
        setSuccess("")

        try {
            await updatePrintRequestStatus(id, status)
            setRequests(current => current.map(request => request.id === id ? { ...request, status, isSeenByAdmin: true, updatedAtUtc: new Date().toISOString() } : request))
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
            setRequests(current => current.map(request => request.id === id ? { ...request, isSeenByAdmin: true, updatedAtUtc: new Date().toISOString() } : request))
            setSuccess("Заявката е маркирана като видяна.")
            window.setTimeout(() => setSuccess(""), 2500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Маркирането като видяна беше неуспешно.")
        } finally {
            setBusyId(null)
        }
    }

    const printRequest = (request: PrintRequestDto) => {
        openPreview(request)
        window.setTimeout(() => window.print(), 100)
    }

    const renderTable = (items: PrintRequestDto[], emptyText: string) => (
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
                    {items.length > 0 ? items.map(request => {
                        const status = normalizeStatus(request.status)
                        const isBusy = busyId === request.id

                        return (
                            <tr key={request.id} className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                                <td className="p-3 text-xs text-gray-500 dark:text-zinc-400">{request.id}</td>
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{request.albumTitle || "-"}</span>
                                        {request.id < 0 ? <span className="mt-1 w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Client print upload</span> : null}
                                        {!request.isSeenByAdmin ? <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">Нова</span> : null}
                                    </div>
                                </td>
                                <td className="p-3 text-gray-900 dark:text-white">{request.fullName || request.userEmail || "-"}</td>
                                <td className="p-3 text-gray-900 dark:text-white">{request.email || request.userEmail || "-"}</td>
                                <td className="p-3 text-gray-900 dark:text-white">{request.phone || "-"}</td>
                                <td className="p-3 text-gray-900 dark:text-white">{request.items?.length ?? 0}</td>
                                <td className="p-3">
                                    <select value={status} disabled={isBusy} onChange={event => void changeStatus(request.id, event.target.value as PrintStatus)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                                        {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </td>
                                <td className="max-w-xs truncate p-3 text-gray-900 dark:text-white" title={request.notes || ""}>{request.notes || "-"}</td>
                                <td className="p-3 text-sm text-gray-600 dark:text-zinc-300">{request.createdAtUtc ? new Date(request.createdAtUtc).toLocaleString("bg-BG") : "-"}</td>
                                <td className="p-3">
                                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                        <button type="button" onClick={() => openPreview(request)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-800">Преглед</button>
                                        <button type="button" onClick={() => downloadAll(request)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">Изтегли всички</button>
                                        <button type="button" onClick={() => printRequest(request)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Print</button>
                                        {!request.isSeenByAdmin ? <button type="button" disabled={isBusy} onClick={() => void markSeen(request.id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">Видяна</button> : null}
                                        <button type="button" onClick={() => void remove(request.id)} disabled={isBusy} className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isBusy ? "..." : "Delete"}</button>
                                    </div>
                                </td>
                            </tr>
                        )
                    }) : <tr><td colSpan={10} className="p-6 text-center text-gray-500 dark:text-zinc-400">{emptyText}</td></tr>}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Заявки за принтиране</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Общо: {filteredRequests.length}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void load()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">Обнови</button>
                        <Link to="/admin" className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">Назад</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row">
                    <input type="text" placeholder="Търси по албум, име, email, телефон, бележки..." value={search} onChange={event => { setSearch(event.target.value); setCurrentPage(1) }} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700 lg:flex-1" />
                    <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                        <option value="all">Всички статуси</option>
                        {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                        <option value={20}>20 / страница</option>
                        <option value={60}>60 / страница</option>
                        <option value={100}>100 / страница</option>
                    </select>
                </div>
            </div>

            {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}
            {success ? <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">{success}</div> : null}
            {loading ? <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">Зареждане...</div> : null}

            {!loading ? (
                <>
                    <section className="space-y-5">
                        <div>
                            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Активни заявки</h2>
                            <div className="space-y-6">
                                <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">New</h3>{renderTable(grouped.newRequests, "Няма нови заявки за принтиране.")}</div>
                                <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">In progress</h3>{renderTable(grouped.inProgressRequests, "Няма заявки в процес.")}</div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Архив</h2>
                            <div className="space-y-6">
                                <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">Completed</h3>{renderTable(grouped.completedRequests, "Няма завършени заявки.")}</div>
                                <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">Cancelled</h3>{renderTable(grouped.cancelledRequests, "Няма отказани заявки.")}</div>
                            </div>
                        </div>
                    </section>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">Prev</button>
                        {pageNumbers.map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`rounded-lg border px-3 py-1.5 ${page === safeCurrentPage ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black" : "border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"}`}>{page}</button>)}
                        <button disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">Next</button>
                    </div>
                </>
            ) : null}

            {previewRequest ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-zinc-800"><div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Преглед на снимки</h2><p className="text-sm text-gray-500 dark:text-zinc-400">{previewRequest.albumTitle} · {previewRequest.items.length} снимки</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={toggleAllSelected} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">{selectedItemIds.length === previewRequest.items.length ? "Махни избора" : "Избери всички"}</button><button type="button" onClick={downloadSelected} disabled={!selectedItemIds.length} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">Изтегли избрани</button><button type="button" onClick={() => downloadAll(previewRequest)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Изтегли всички</button><button type="button" onClick={closePreview} className="rounded-lg bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-800">Затвори</button></div></div>
                        <div className="max-h-[72vh] overflow-y-auto p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{previewRequest.items.map((item, index) => { const imageUrl = getPreviewImageUrl(item); const selected = selectedItemIds.includes(item.id); return (<div key={item.id} className={`overflow-hidden rounded-xl border bg-white dark:bg-zinc-950 ${selected ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-gray-200 dark:border-zinc-800"}`}><button type="button" onClick={() => toggleSelectedItem(item.id)} className="block w-full bg-gray-100 dark:bg-zinc-800">{imageUrl ? <img src={imageUrl} alt={`Print ${index + 1}`} className="h-52 w-full object-contain" /> : <div className="flex h-52 items-center justify-center text-sm text-gray-500">Няма снимка</div>}</button><div className="space-y-2 p-3 text-sm text-gray-700 dark:text-zinc-300"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={selected} onChange={() => toggleSelectedItem(item.id)} />#{index + 1}</label><div>Брой: {item.quantity}</div><div>Размер: {item.size || "-"}</div><div>Хартия: {item.paperType || "-"}</div><div className="truncate" title={item.notes || ""}>Бележки: {item.notes || "-"}</div><button type="button" onClick={() => downloadItem(previewRequest, item)} className="w-full rounded-lg bg-slate-700 px-3 py-2 text-white hover:bg-slate-800">Изтегли</button></div></div>) })}</div></div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
