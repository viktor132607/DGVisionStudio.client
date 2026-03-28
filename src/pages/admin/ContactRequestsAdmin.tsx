import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

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
        fetch("/api/admin/contact-requests", {
            credentials: "include"
        })
            .then(r => r.json())
            .then(setRequests)
    }

    useEffect(() => {
        load()
    }, [])

    const remove = async (id: number) => {
        await fetch(`/api/admin/contact-requests/${id}`, {
            method: "DELETE",
            credentials: "include"
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
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold">Contact Requests</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Total: {filteredRequests.length}
                        </p>
                    </div>

                    <Link
                        to="/admin"
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition"
                    >
                        Back
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, subject, message..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full lg:flex-1 px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-gray-300"
                    />

                    <select
                        value={statusFilter}
                        onChange={e => handleStatusFilterChange(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
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
                        className="px-4 py-2 border rounded-lg bg-white"
                    >
                        <option value={20}>20 / page</option>
                        <option value={60}>60 / page</option>
                        <option value={100}>100 / page</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-white border rounded-xl shadow-sm overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Subject</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Message</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedRequests.length > 0 ? (
                            pagedRequests.map(r => (
                                <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                                    <td className="p-3 text-xs text-gray-500">{r.id}</td>
                                    <td className="p-3">{r.name}</td>
                                    <td className="p-3">{r.email}</td>
                                    <td className="p-3">{r.phone || "-"}</td>
                                    <td className="p-3">{r.subject || "-"}</td>
                                    <td className="p-3">{r.status || "-"}</td>
                                    <td className="p-3 max-w-xs truncate" title={r.message}>
                                        {r.message}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                                            <Link
                                                to={`/admin/contact-requests/${r.id}`}
                                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                            >
                                                Details
                                            </Link>

                                            <Link
                                                to={`/admin/contact-requests/${r.id}/edit`}
                                                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                            >
                                                Edit
                                            </Link>

                                            <Link
                                                to={`/admin/contact-requests/${r.id}/status`}
                                                className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                                            >
                                                Status
                                            </Link>

                                            <button
                                                onClick={() => remove(r.id)}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500">
                                    No contact requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Prev
                </button>

                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 border rounded-lg ${safeCurrentPage === page
                                ? "bg-black text-white border-black"
                                : "bg-white hover:bg-gray-50"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}