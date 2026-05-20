import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "../../services/api"
import { getAdminClientGalleries } from "../../services/clientGalleries"
import type { AdminGalleryUserOptionDto, MyClientGalleryDto } from "../../types/clientGallery"
import ContactRequestAlbumEditor from "../../components/admin/ContactRequestAlbumEditor"
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
}

const statusOptions: ContactStatus[] = ["New", "InProgress", "Completed", "Rejected"]

const statusValues: Record<ContactStatus, number> = {
    New: 0,
    InProgress: 1,
    Completed: 2,
    Rejected: 3,
}

function normalizeStatus(status?: string | number | null): ContactStatus {
    if (status === null || status === undefined || status === "") return "New"

    if (typeof status === "number") {
        if (status === 1) return "InProgress"
        if (status === 2) return "Completed"
        if (status === 3) return "Rejected"
        return "New"
    }

    const normalized = status.toLowerCase().replace(/[\s_-]/g, "")
    if (normalized === "inprogress") return "InProgress"
    if (normalized === "completed" || normalized === "answered") return "Completed"
    if (normalized === "rejected" || normalized === "closed" || normalized === "archived") return "Rejected"
    return "New"
}

export default function ContactRequestEditAdmin() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { showToast } = useAdminToast()

    const [request, setRequest] = useState<ContactRequest | null>(null)
    const [status, setStatus] = useState<ContactStatus>("New")
    const [adminComment, setAdminComment] = useState("")
    const [users, setUsers] = useState<AdminGalleryUserOptionDto[]>([])
    const [galleries, setGalleries] = useState<MyClientGalleryDto[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const isArchived = useMemo(() => status === "Completed" || status === "Rejected", [status])

    const loadUsers = async () => {
        const response = await apiFetch("/admin/client-galleries/users", {
            method: "GET",
            skipJsonContentType: true,
        })

        if (!response.ok) throw new Error("Неуспешно зареждане на потребителите.")
        const data = (await response.json().catch(() => [])) as AdminGalleryUserOptionDto[]
        setUsers(Array.isArray(data) ? data : [])
    }

    const loadGalleries = async () => {
        const data = await getAdminClientGalleries()
        setGalleries(Array.isArray(data) ? data : [])
    }

    const loadRequest = async () => {
        if (!id) throw new Error("Липсва ID на запитването.")

        const response = await apiFetch(`/admin/contact-requests/${id}`, {
            method: "GET",
            skipJsonContentType: true,
        })

        if (!response.ok) throw new Error("Неуспешно зареждане на запитването.")

        const data = (await response.json()) as ContactRequest
        setRequest(data)
        setStatus(normalizeStatus(data.status))
        setAdminComment(data.adminComment || "")
    }

    const load = async () => {
        setLoading(true)
        setError("")

        try {
            await Promise.all([loadRequest(), loadUsers(), loadGalleries()])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно зареждане."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleSaveStatus = async (event: FormEvent) => {
        event.preventDefault()
        if (!id || !request) return

        setSaving(true)
        setError("")

        try {
            const response = await apiFetch(`/admin/contact-requests/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    status: statusValues[status],
                    adminComment: adminComment.trim() || null,
                    isArchived,
                }),
            })

            if (!response.ok) throw new Error("Промяната на статуса беше неуспешна.")

            const updated = (await response.json().catch(() => null)) as ContactRequest | null
            if (updated) setRequest(updated)

            showToast({ type: "success", title: "Готово", message: "Запитването беше обновено." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Записът беше неуспешен."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-6 text-sm text-gray-500 dark:text-zinc-400">Зареждане...</div>
    }

    if (!request) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error || "Запитването не е намерено."}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Редакция на запитване</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{request.name} · {request.email}</p>
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={() => void load()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">Обнови</button>
                    <Link to="/admin/contact-requests" className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">Назад</Link>
                </div>
            </div>

            {error ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Данни от запитването</h2>
                        <div className="grid gap-3 text-sm text-gray-700 dark:text-zinc-300 md:grid-cols-2">
                            <div><b>Име:</b> {request.name}</div>
                            <div><b>Email:</b> {request.email}</div>
                            <div><b>Телефон:</b> {request.phone || "-"}</div>
                            <div><b>Тема:</b> {request.subject || "-"}</div>
                            <div className="md:col-span-2"><b>Съобщение:</b> {request.message}</div>
                        </div>
                    </section>

                    <form onSubmit={handleSaveStatus} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Статус</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                                Смяна на статус
                                <select value={status} onChange={(event) => setStatus(event.target.value as ContactStatus)} className="rounded-lg border border-green-700 bg-green-600 px-3 py-2 font-semibold text-white">
                                    {statusOptions.map((item) => <option key={item} value={item} className="bg-white text-gray-900">{item}</option>)}
                                </select>
                            </label>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                                {isArchived ? "Ще отиде в Архив." : "Ще стои в Активни заявки."}
                            </div>

                            <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
                                Админ коментар
                                <textarea value={adminComment} onChange={(event) => setAdminComment(event.target.value)} rows={4} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                            </label>
                        </div>

                        <button type="submit" disabled={saving} className="mt-5 rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900 disabled:opacity-60">
                            {saving ? "Запазване..." : "Запази статус"}
                        </button>
                    </form>
                </div>

                <ContactRequestAlbumEditor
                    requestName={request.name}
                    requestEmail={request.email}
                    requestSubject={request.subject}
                    requestMessage={request.message}
                    users={users}
                    galleries={galleries}
                    onGalleriesChange={setGalleries}
                    onSuccess={(message) => showToast({ type: "success", title: "Готово", message })}
                    onError={(message) => {
                        setError(message)
                        showToast({ type: "error", title: "Грешка", message })
                    }}
                />
            </div>

            <div className="mt-6">
                <button type="button" onClick={() => navigate("/admin/contact-requests")} className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">Към запитвания</button>
            </div>
        </div>
    )
}
