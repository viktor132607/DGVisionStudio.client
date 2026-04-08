import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../services/api"

type ServiceItem = {
    id: number
    title: string
    shortDescription?: string
    description?: string
    coverImageUrl?: string
    displayOrder: number
    isActive: boolean
    createdAtUtc?: string
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceItem[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pageSize, setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1)

    const load = () => {
        apiFetch("/admin/services", {
            method: "GET",
            skipJsonContentType: true,
        })
            .then(r => r.json())
            .then(data => setServices(Array.isArray(data) ? data : []))
            .catch(() => setServices([]))
    }

    useEffect(() => {
        load()
    }, [])

    const remove = async (id: number) => {
        const confirmed = window.confirm("Delete this service?")
        if (!confirmed) return

        await apiFetch(`/admin/services/${id}`, {
            method: "DELETE",
        })

        load()
    }

    const filteredServices = useMemo(() => {
        const term = search.trim().toLowerCase()

        return services.filter(s => {
            const matchesSearch =
                !term ||
                String(s.id).includes(term) ||
                s.title?.toLowerCase().includes(term) ||
                s.shortDescription?.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term)

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && s.isActive) ||
                (statusFilter === "inactive" && !s.isActive)

            return matchesSearch && matchesStatus
        })
    }, [services, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const pagedServices = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredServices.slice(start, start + pageSize)
    }, [filteredServices, safeCurrentPage, pageSize])

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Services
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Total: {filteredServices.length}
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
                        placeholder="Search by title or description..."
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Title</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Short Description</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Order</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Status</th>
                            <th className="p-3 text-left text-gray-700 dark:text-zinc-300">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedServices.length > 0 ? (
                            pagedServices.map(service => (
                                <tr
                                    key={service.id}
                                    className="border-b transition last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                >
                                    <td className="p-3 text-xs text-gray-500 dark:text-zinc-400">
                                        {service.id}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {service.title}
                                    </td>
                                    <td
                                        className="max-w-xs truncate p-3 text-gray-900 dark:text-white"
                                        title={service.shortDescription || ""}
                                    >
                                        {service.shortDescription || "-"}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-white">
                                        {service.displayOrder}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                                service.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {service.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                                            <button
                                                onClick={() => remove(service.id)}
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
                                <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                                    No services found.
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