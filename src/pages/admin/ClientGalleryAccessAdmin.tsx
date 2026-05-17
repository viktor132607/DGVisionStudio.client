import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
    getAdminClientGalleryById,
    getGalleryAccesses,
    grantGalleryAccess,
    removeGalleryAccess,
    updateGalleryAccess,
} from "../../services/clientGalleries"
import { apiFetch } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"
import type { PagedResultDto } from "../../types/pagination"

type GalleryAccessDto = {
    userId: string
    userEmail: string
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
    isExpired: boolean
}

type UserOption = {
    id: string
    email: string
    isBlocked: boolean
}

type GallerySummary = {
    id: number
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    portfolioCategoryId?: number | null
    isPublic?: boolean
    isPublished?: boolean
    isActive?: boolean
    allowClientAccess?: boolean
    photosCount: number
}

function toDateInputValue(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function getDefaultExpiryDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return toDateInputValue(date)
}

function formatDisplayDate(dateValue?: string | null): string {
    if (!dateValue) return "Без дата"

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return "Без дата"

    return date.toLocaleDateString("bg-BG")
}

function toUtcEndOfDayIso(dateValue: string): string | null {
    if (!dateValue) return null
    return `${dateValue}T23:59:59.999Z`
}

function fromUtcToDateInput(dateValue?: string | null): string {
    if (!dateValue) return ""
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ""
    return toDateInputValue(date)
}

function toBoolean(value: unknown, fallback = false) {
    if (typeof value === "boolean") return value
    if (typeof value === "string") return value.toLowerCase() === "true"
    if (typeof value === "number") return value === 1
    return fallback
}

export default function ClientGalleryAccessAdmin() {
    const [searchParams] = useSearchParams()
    const galleryIdParam = searchParams.get("id")
    const galleryId = galleryIdParam ? Number(galleryIdParam) : 0

    const [gallery, setGallery] = useState<GallerySummary | null>(null)
    const [accesses, setAccesses] = useState<GalleryAccessDto[]>([])
    const [users, setUsers] = useState<UserOption[]>([])
    const [selectedUserEmail, setSelectedUserEmail] = useState("")
    const [previewEnabled, setPreviewEnabled] = useState(true)
    const [downloadEnabled, setDownloadEnabled] = useState(false)
    const [downloadExpiresAt, setDownloadExpiresAt] = useState(getDefaultExpiryDate())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [editingByUserId, setEditingByUserId] = useState<
        Record<string, { previewEnabled: boolean; downloadEnabled: boolean; downloadExpiresAt: string }>
    >({})

    const loadGallery = async () => {
        if (!galleryId) return

        const data = await getAdminClientGalleryById(galleryId)
        const photos = Array.isArray((data as any).photos) ? (data as any).photos : []

        setGallery({
            id: galleryId,
            title: data.title || "",
            titleEn: (data as any).titleEn || null,
            description: data.description || null,
            coverImageUrl: data.coverImageUrl || null,
            portfolioCategoryId:
                typeof (data as any).portfolioCategoryId === "number"
                    ? (data as any).portfolioCategoryId
                    : null,
            isPublic:
                typeof (data as any).isPublic === "boolean"
                    ? (data as any).isPublic
                    : Boolean((data as any).portfolioCategoryId || (data as any).isPublished),
            isPublished: toBoolean((data as any).isPublished, false),
            isActive: toBoolean((data as any).isActive ?? (data as any).allowClientAccess, false),
            allowClientAccess: toBoolean((data as any).allowClientAccess ?? (data as any).isActive, false),
            photosCount: photos.length,
        })
    }

    const loadUsers = async () => {
        const response = await apiFetch("/admin/users?page=1&pageSize=200", {
            method: "GET",
            skipJsonContentType: true,
        })

        if (!response.ok) {
            throw new Error("Неуспешно зареждане на потребителите.")
        }

        const data = (await response.json().catch(() => null)) as PagedResultDto<UserOption> | UserOption[] | null

        const rawUsers = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
              ? data.items
              : []

        const normalized = rawUsers
            .filter((x) => x?.email && !x?.isBlocked)
            .map((x) => ({
                id: String(x.id ?? ""),
                email: String(x.email ?? ""),
                isBlocked: Boolean(x.isBlocked),
            }))

        setUsers(normalized)
    }

    const loadAccesses = async () => {
        if (!galleryId) return

        const data = await getGalleryAccesses(galleryId)
        const normalizedAccesses = Array.isArray(data) ? data : []

        setAccesses(normalizedAccesses)

        const nextEditingState: Record<
            string,
            { previewEnabled: boolean; downloadEnabled: boolean; downloadExpiresAt: string }
        > = {}

        for (const access of normalizedAccesses) {
            nextEditingState[access.userId] = {
                previewEnabled: Boolean(access.previewEnabled),
                downloadEnabled: Boolean(access.downloadEnabled),
                downloadExpiresAt: fromUtcToDateInput(access.downloadExpiresAtUtc) || getDefaultExpiryDate(),
            }
        }

        setEditingByUserId(nextEditingState)
    }

    const loadAll = async () => {
        try {
            setLoading(true)
            setError("")

            await Promise.all([loadGallery(), loadAccesses(), loadUsers()])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неуспешно зареждане на достъпите.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadAll()
    }, [galleryId])

    const availableUsers = useMemo(() => {
        const usedEmails = new Set(accesses.map((x) => x.userEmail.toLowerCase()))
        return users
            .filter((user) => !usedEmails.has(user.email.toLowerCase()))
            .sort((a, b) => a.email.localeCompare(b.email))
    }, [users, accesses])

    useEffect(() => {
        if (!selectedUserEmail && availableUsers.length > 0) {
            setSelectedUserEmail(availableUsers[0].email)
        }
    }, [availableUsers, selectedUserEmail])

    useEffect(() => {
        if (!downloadEnabled) {
            setDownloadExpiresAt(getDefaultExpiryDate())
        }
    }, [downloadEnabled])

    const handleGrantAccess = async () => {
        if (!galleryId || !selectedUserEmail) return

        try {
            setSaving(true)
            setError("")

            await grantGalleryAccess(galleryId, {
                userEmail: selectedUserEmail,
                previewEnabled,
                downloadEnabled,
                downloadExpiresAtUtc: downloadEnabled ? toUtcEndOfDayIso(downloadExpiresAt) : null,
            })

            setPreviewEnabled(true)
            setDownloadEnabled(false)
            setDownloadExpiresAt(getDefaultExpiryDate())
            setSelectedUserEmail("")

            await loadAll()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неуспешно създаване на достъп.")
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateAccess = async (userId: string) => {
        const current = editingByUserId[userId]
        if (!current) return

        try {
            setSaving(true)
            setError("")

            await updateGalleryAccess(galleryId, userId, {
                previewEnabled: current.previewEnabled,
                downloadEnabled: current.downloadEnabled,
                downloadExpiresAtUtc: current.downloadEnabled
                    ? toUtcEndOfDayIso(current.downloadExpiresAt)
                    : null,
            })

            await loadAccesses()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неуспешно обновяване на достъпа.")
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveAccess = async (userId: string) => {
        try {
            setSaving(true)
            setError("")

            await removeGalleryAccess(galleryId, userId)
            await loadAll()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неуспешно премахване на достъпа.")
        } finally {
            setSaving(false)
        }
    }

    if (!galleryId || !Number.isFinite(galleryId)) {
        return (
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    Невалиден идентификатор на галерия.
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    to="/admin"
                    className="mb-4 inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                    Назад
                </Link>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Управление на достъп
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">
                    Давай и редактирай достъп до клиентска галерия или portfolio албум.
                </p>
            </div>

            {loading ? (
                <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Зареждане...
                </div>
            ) : null}

            {error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {gallery ? (
                <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                        <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-800 lg:aspect-auto">
                            {gallery.coverImageUrl ? (
                                <img
                                    src={resolveAssetUrl(gallery.coverImageUrl)}
                                    alt={gallery.title || "Album cover"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full min-h-[220px] items-center justify-center text-sm font-medium text-gray-400 dark:text-zinc-500">
                                    Няма корица
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {gallery.title || "Без име"}
                                    </h2>

                                    {gallery.titleEn ? (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                                            {gallery.titleEn}
                                        </p>
                                    ) : null}

                                    {gallery.description ? (
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-zinc-300">
                                            {gallery.description}
                                        </p>
                                    ) : null}
                                </div>

                                <Link
                                    to={`/admin/client-galleries/edit?id=${gallery.id}`}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                >
                                    Редакция
                                </Link>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                        Снимки
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {gallery.photosCount}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                        В портфолио
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {gallery.isPublished ? "Да" : "Не"}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                        Public
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {gallery.isPublic ? "Да" : "Не"}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                        Client access
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {gallery.allowClientAccess || accesses.length > 0 ? "Да" : "Не"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Добави достъп
                </h2>

                <div className="grid gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Имейл на клиент
                        </label>

                        <select
                            value={selectedUserEmail}
                            onChange={(e) => setSelectedUserEmail(e.target.value)}
                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                            disabled={loading || saving || availableUsers.length === 0}
                        >
                            {availableUsers.length === 0 ? (
                                <option value="">Няма налични потребители</option>
                            ) : null}

                            {availableUsers.map((user) => (
                                <option key={user.id} value={user.email}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                        <input
                            type="checkbox"
                            checked={previewEnabled}
                            onChange={(e) => setPreviewEnabled(e.target.checked)}
                        />
                        Разрешен preview достъп
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                        <input
                            type="checkbox"
                            checked={downloadEnabled}
                            onChange={(e) => setDownloadEnabled(e.target.checked)}
                        />
                        Разрешено изтегляне
                    </label>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Крайна дата за изтегляне
                        </label>
                        <input
                            type="date"
                            value={downloadExpiresAt}
                            onChange={(e) => setDownloadExpiresAt(e.target.value)}
                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                            disabled={!downloadEnabled}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleGrantAccess()}
                        disabled={saving || loading || !selectedUserEmail}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {saving ? "Запазване..." : "Запази достъп"}
                    </button>
                </div>
            </div>

            <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Активни достъпи
                </h2>

                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Зареждане...
                    </div>
                ) : accesses.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Няма активни достъпи.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {accesses.map((access) => {
                            const current = editingByUserId[access.userId]

                            return (
                                <div
                                    key={access.userId}
                                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
                                >
                                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-base font-semibold text-slate-900 dark:text-white">
                                            {access.userEmail}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                Preview: {current?.previewEnabled ? "ON" : "OFF"}
                                            </span>

                                            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                Download: {current?.downloadEnabled ? "ON" : "OFF"}
                                            </span>

                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                    access.isExpired
                                                        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                                                        : "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
                                                }`}
                                            >
                                                {access.isExpired ? "Изтекъл" : "Активен"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                                            <input
                                                type="checkbox"
                                                checked={current?.previewEnabled ?? false}
                                                onChange={(e) =>
                                                    setEditingByUserId((prev) => ({
                                                        ...prev,
                                                        [access.userId]: {
                                                            ...prev[access.userId],
                                                            previewEnabled: e.target.checked,
                                                        },
                                                    }))
                                                }
                                            />
                                            Разрешен preview достъп
                                        </label>

                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                                            <input
                                                type="checkbox"
                                                checked={current?.downloadEnabled ?? false}
                                                onChange={(e) =>
                                                    setEditingByUserId((prev) => ({
                                                        ...prev,
                                                        [access.userId]: {
                                                            ...prev[access.userId],
                                                            downloadEnabled: e.target.checked,
                                                            downloadExpiresAt: e.target.checked
                                                                ? prev[access.userId]?.downloadExpiresAt || getDefaultExpiryDate()
                                                                : getDefaultExpiryDate(),
                                                        },
                                                    }))
                                                }
                                            />
                                            Разрешено изтегляне
                                        </label>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Крайна дата за изтегляне
                                        </label>
                                        <input
                                            type="date"
                                            value={current?.downloadExpiresAt ?? ""}
                                            onChange={(e) =>
                                                setEditingByUserId((prev) => ({
                                                    ...prev,
                                                    [access.userId]: {
                                                        ...prev[access.userId],
                                                        downloadExpiresAt: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                            disabled={!(current?.downloadEnabled ?? false)}
                                        />
                                        <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                                            Текущо: {formatDisplayDate(access.downloadExpiresAtUtc)}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={() => void handleUpdateAccess(access.userId)}
                                            disabled={saving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                        >
                                            {saving ? "Запазване..." : "Обнови"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => void handleRemoveAccess(access.userId)}
                                            disabled={saving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-red-300 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            Премахни
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}