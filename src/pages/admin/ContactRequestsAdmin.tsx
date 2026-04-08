import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../services/api"

type ContactRequest = {
    id: number
    name: string
    email: string
    phone: string
    subject: string
    message: string
    createdAt: string
    status?: string
}

export default function ContactRequestsAdmin() {
    const [requests, setRequests] = useState<ContactRequest[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)

    const load = () => {
        apiFetch("/admin/contact-requests", {
            method: "GET",
            skipJsonContentType: true,
        })
            .then(r => r.json())
            .then(data => setRequests(Array.isArray(data) ? data : []))
            .catch(() => setRequests([]))
    }

    useEffect(() => {
        load()
    }, [])

    const remove = async (id: number) => {
        await apiFetch(`/admin/contact-requests/${id}`, {
            method: "DELETE",
        })

        load()
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
        const unique = Array.from(new Set(requests.map(x => x.status).filter(Boolean)))
        return unique
    }, [requests])

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase()

        return requests.filter(r => {
            const matchesSearch =
                !term ||
                String(r.id).includes(term) ||
                r.name?.toLowerCase().includes(term) ||
                r.email?.toLowerCase().includes(term) ||
                r.phone?.toLowerCase().includes(term) ||
                r.subject?.toLowerCase().includes(term) ||
                r.message?.toLowerCase().includes(term)

            const matchesStatus =
                statusFilter === "all" || r.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [requests, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedRequests = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredRequests.slice(start, start + pageSize)
    }, [filteredRequests, safeCurrentPage, pageSize])

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Contact Requests
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Total: {filteredRequests.length}
                        </p>
                    </div>

                    <Link
                        to="/admin"
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Back
                    </Link>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, subject, message..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700 lg:flex-1"
                    />

                    <select
                        value={statusFilter}
                        onChange={e => handleStatusFilterChange(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">All statuses</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <select
                        value={pageSize}
                        onChange={e => handlePageSizeChange(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value={20}>20 / page</option>
                        <option value={60}>60 / page</option>
                        <option value={100}>100 / page</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <thead className="bg-gray-50 dark:bg-zinc-950">
                        <tr>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">ID</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Name</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Email</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Phone</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Subject</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Status</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Message</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedRequests.length > 0 ? (
                            pagedRequests.map(r => (
                                <tr
                                    key={r.id}
                                    className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                >
                                    <td className="p-3 text-xs text-gray-500 dark:text-zinc-400">{r.id}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{r.name}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{r.email}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{r.phone || "-"}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{r.subject || "-"}</td>
                                    <td className="p-3 text-gray-900 dark:text-white">{r.status || "-"}</td>
                                    <td
                                        className="max-w-xs truncate p-3 text-gray-900 dark:text-white"
                                        title={r.message}
                                    >
                                        {r.message}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                            <Link
                                                to={`/admin/contact-requests/${r.id}`}
                                                className="rounded-lg bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-700"
                                            >
                                                Details
                                            </Link>

                                            <Link
                                                to={`/admin/contact-requests/${r.id}/edit`}
                                                className="rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                                            >
                                                Edit
                                            </Link>

                                            <Link
                                                to={`/admin/contact-requests/${r.id}/status`}
                                                className="rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-800"
                                            >
                                                Status
                                            </Link>

                                            <button
                                                onClick={() => remove(r.id)}
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                    No contact requests found.
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
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    Prev
                </button>

                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg border px-3 py-1.5 ${
                            safeCurrentPage === page
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    Next
                </button>
            </div>
        </div>
    )
}