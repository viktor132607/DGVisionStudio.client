import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../services/api"

type Testimonial = {
    id: number
    clientName: string
    clientRole?: string
    clientCompany?: string
    content: string
    rating: number
    displayOrder: number
    isPublished: boolean
    createdAtUtc?: string
}

export default function TestimonialsAdmin() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)

    const load = () => {
        apiFetch("/admin/testimonials", {
            method: "GET",
            skipJsonContentType: true,
        })
            .then(r => r.json())
            .then(data => setTestimonials(Array.isArray(data) ? data : []))
            .catch(() => setTestimonials([]))
    }

    useEffect(() => {
        load()
    }, [])

    const remove = async (id: number) => {
        const confirmed = window.confirm("Delete this testimonial?")
        if (!confirmed) return

        await apiFetch(`/admin/testimonials/${id}`, {
            method: "DELETE",
        })

        load()
    }

    const filteredTestimonials = useMemo(() => {
        const term = search.trim().toLowerCase()

        return testimonials.filter(item => {
            const matchesSearch =
                !term ||
                String(item.id).includes(term) ||
                item.clientName?.toLowerCase().includes(term) ||
                item.clientRole?.toLowerCase().includes(term) ||
                item.clientCompany?.toLowerCase().includes(term) ||
                item.content?.toLowerCase().includes(term)

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "published" && item.isPublished) ||
                (statusFilter === "unpublished" && !item.isPublished)

            return matchesSearch && matchesStatus
        })
    }, [testimonials, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedTestimonials = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredTestimonials.slice(start, start + pageSize)
    }, [filteredTestimonials, safeCurrentPage, pageSize])

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Testimonials
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Total: {filteredTestimonials.length}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={load}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Refresh
                        </button>

                        <Link
                            to="/admin"
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                        type="text"
                        placeholder="Search by client or content..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700 lg:flex-1"
                    />

                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="all">All statuses</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>

                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                            setCurrentPage(1)
                        }}
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
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Client</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Role / Company</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Rating</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Order</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Published</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Content</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedTestimonials.length > 0 ? (
                            pagedTestimonials.map(item => (
                                <tr
                                    key={item.id}
                                    className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                >
                                    <td className="p-3 text-xs text-gray-500 dark:text-zinc-400">
                                        {item.id}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {item.clientName}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {[item.clientRole, item.clientCompany].filter(Boolean).join(" / ") || "-"}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {item.rating}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {item.displayOrder}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {String(item.isPublished)}
                                    </td>
                                    <td
                                        className="max-w-xs truncate p-3 text-gray-900 dark:text-white"
                                        title={item.content}
                                    >
                                        {item.content}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => remove(item.id)}
                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                    No testimonials found.
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