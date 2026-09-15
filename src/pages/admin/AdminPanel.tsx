import { Link } from "react-router-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { apiFetch, apiFetchJson } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { useAdminToast } from "../../hooks/useAdminToast"

import { useAlbumArchive } from "../../hooks/useAlbumArchive"
import { fetchEveryAlbum, toggleVisibleSelection } from "../../utils/albumSelection"
import type { AlbumPage } from "../../utils/albumSelection"
import "../../styles/adminAlbumManagement.css"

const actionClass = "inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
const selectClass = "h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
const readSort = () => { try { return localStorage.getItem("dgvisionstudio.admin.albumSort") || "activity_desc" } catch { return "activity_desc" } }
const readActivity = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem("dgvisionstudio.admin.albumActivity") || "{}") } catch { return {} } }

type DashboardStats = {
    users: number
    newUsers: number
    contacts: number
    newContactRequests: number
    services: number
    testimonials: number
    printRequests: number
    newPrintRequests: number
    portfolioCategories: number
    portfolioAlbums: number
    portfolioImages: number
}

type PortfolioCategoryRow = {
    id: number
    key: string
    name: string
    nameEn?: string | null
    description?: string | null
    displayOrder: number
    isActive: boolean
}

type PortfolioAlbumRow = {
    id: number
    portfolioCategoryId: number
    slug: string
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    displayOrder: number
    columnNumber?: number | null
    isPublished: boolean
    createdAtUtc?: string
    updatedAtUtc?: string
    allowClientAccess?: boolean
    portfolioCategory?: PortfolioCategoryRow | null
}

type NotificationKey = "users" | "contacts" | "printRequests"

type NotificationSeenState = Record<NotificationKey, number>

const NOTIFICATION_SEEN_STORAGE_KEY = "dgvisionstudio.admin.notificationSeenCounts"

const defaultNotificationSeenState: NotificationSeenState = {
    users: 0,
    contacts: 0,
    printRequests: 0,
}

const readNotificationSeenState = (): NotificationSeenState => {
    if (typeof window === "undefined") return defaultNotificationSeenState

    try {
        const raw = window.localStorage.getItem(NOTIFICATION_SEEN_STORAGE_KEY)
        if (!raw) return defaultNotificationSeenState

        const parsed = JSON.parse(raw) as Partial<NotificationSeenState>

        return {
            users: Number(parsed.users) || 0,
            contacts: Number(parsed.contacts) || 0,
            printRequests: Number(parsed.printRequests) || 0,
        }
    } catch {
        return defaultNotificationSeenState
    }
}

const saveNotificationSeenState = (state: NotificationSeenState) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(NOTIFICATION_SEEN_STORAGE_KEY, JSON.stringify(state))
}

export default function AdminPanel() {
    const { showToast } = useAdminToast()

    const [stats, setStats] = useState<DashboardStats>({
        users: 0,
        newUsers: 0,
        contacts: 0,
        newContactRequests: 0,
        services: 0,
        testimonials: 0,
        printRequests: 0,
        newPrintRequests: 0,
        portfolioCategories: 0,
        portfolioAlbums: 0,
        portfolioImages: 0,
    })

    const [statsLoading, setStatsLoading] = useState(true)
    const [notificationSeen, setNotificationSeen] = useState<NotificationSeenState>(() => readNotificationSeenState())

    const [albums, setAlbums] = useState<PortfolioAlbumRow[]>([])
    const [albumsLoading, setAlbumsLoading] = useState(true)
    const [albumsError, setAlbumsError] = useState("")
    const [busyAlbumId, setBusyAlbumId] = useState<number | null>(null)
    const [albumSearch, setAlbumSearch] = useState("")
    const [albumStatusFilter, setAlbumStatusFilter] = useState("all")
    const [deleteAlbumId, setDeleteAlbumId] = useState<number | null>(null)
    const [selectedAlbumIds, setSelectedAlbumIds] = useState<Set<number>>(() => new Set())
    const [albumCategoryFilter, setAlbumCategoryFilter] = useState("all")
    const [albumSort, setAlbumSort] = useState(readSort)
    const [targetCategoryId, setTargetCategoryId] = useState("")
    const [bulkDeleteIds, setBulkDeleteIds] = useState<number[] | null>(null)
    const [bulkBusy, setBulkBusy] = useState(false)
    const [bulkError, setBulkError] = useState("")
    const bulkLock = useRef(false)
    const archive = useAlbumArchive()
    const albumManagementBusy = bulkBusy || archive.busy || busyAlbumId !== null || albumsLoading


    const [categories, setCategories] = useState<PortfolioCategoryRow[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState("")
    const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null)
    const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
    const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(null)
    const [dragOverCategoryId, setDragOverCategoryId] = useState<number | null>(null)

    const loadStats = async () => {
        setStatsLoading(true)

        try {
            const response = await apiFetch("/admin/dashboard", {
                method: "GET",
                skipJsonContentType: true,
            })

            const data = await response.json()

            setStats({
                users: data?.users ?? 0,
                newUsers: data?.newUsers ?? 0,
                contacts: data?.contacts ?? 0,
                newContactRequests: data?.newContactRequests ?? 0,
                services: data?.services ?? 0,
                testimonials: data?.testimonials ?? 0,
                printRequests: data?.printRequests ?? 0,
                newPrintRequests: data?.newPrintRequests ?? 0,
                portfolioCategories: data?.portfolioCategories ?? data?.categories ?? 0,
                portfolioAlbums: data?.portfolioAlbums ?? data?.albums ?? 0,
                portfolioImages: data?.portfolioImages ?? data?.images ?? 0,
            })
        } catch {
            setStats({
                users: 0,
                newUsers: 0,
                contacts: 0,
                newContactRequests: 0,
                services: 0,
                testimonials: 0,
                printRequests: 0,
                newPrintRequests: 0,
                portfolioCategories: 0,
                portfolioAlbums: 0,
                portfolioImages: 0,
            })
        } finally {
            setStatsLoading(false)
        }
    }

    const loadAlbums = async () => {
        setAlbumsLoading(true)
        setAlbumsError("")

        try {
            const items = await fetchEveryAlbum<PortfolioAlbumRow>((page) =>
                apiFetchJson<AlbumPage<PortfolioAlbumRow>>(`/admin/portfolio/albums?page=${page}&pageSize=100`))
            setSelectedAlbumIds(current => new Set([...current].filter(id => items.some(album => album.id === id))))

            setAlbums(
                [...items].sort(
                    (a, b) =>
                        (a.portfolioCategoryId ?? 0) - (b.portfolioCategoryId ?? 0) ||
                        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                        (a.id ?? 0) - (b.id ?? 0)
                )
            )
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на албумите."
            setAlbumsError(message)
            setAlbums([])
            setSelectedAlbumIds(new Set())

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setAlbumsLoading(false)
        }
    }

    const loadCategories = async () => {
        setCategoriesLoading(true)
        setCategoriesError("")

        try {
            const response = await apiFetch("/admin/portfolio/categories", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Грешка при зареждане на категориите.")
            }

            const data = await response.json().catch(() => [])
            const items = Array.isArray(data) ? data : []

            setCategories(
                [...items].sort(
                    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0)
                )
            )
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на категориите."
            setCategoriesError(message)
            setCategories([])

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setCategoriesLoading(false)
        }
    }

    const loadAll = async () => {
        await Promise.all([loadStats(), loadAlbums(), loadCategories()])
    }

    useEffect(() => {
        void loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDeleteAlbum = async () => {
        if (!deleteAlbumId) return

        setBusyAlbumId(deleteAlbumId)
        setAlbumsError("")

        try {
            const response = await apiFetch(`/admin/portfolio/albums/${deleteAlbumId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Изтриването беше неуспешно.")
            }

            setAlbums((current) => current.filter((x) => x.id !== deleteAlbumId))
            setSelectedAlbumIds(current => { const next = new Set(current); next.delete(deleteAlbumId); return next })
            setDeleteAlbumId(null)
            await loadStats()

            showToast({
                type: "success",
                title: "Готово",
                message: "Албумът беше изтрит успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Изтриването беше неуспешно."
            setAlbumsError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyAlbumId(null)
        }
    }

    const handleToggleCategory = async (category: PortfolioCategoryRow) => {
        setBusyCategoryId(category.id)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${category.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    key: category.key,
                    name: category.name,
                    nameEn: category.nameEn?.trim() || category.name,
                    description: category.description ?? "",
                    displayOrder: category.displayOrder,
                    isActive: !category.isActive,
                }),
            })

            if (!response.ok) {
                throw new Error("Неуспешна промяна на категорията.")
            }

            setCategories((current) =>
                current.map((x) =>
                    x.id === category.id
                        ? { ...x, isActive: !x.isActive }
                        : x
                )
            )

            showToast({
                type: "success",
                title: "Готово",
                message: !category.isActive
                    ? "Категорията беше активирана."
                    : "Категорията беше направена неактивна.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешна промяна на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
        }
    }

    const handleDeleteCategory = async () => {
        if (!deleteCategoryId) return

        setBusyCategoryId(deleteCategoryId)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${deleteCategoryId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Неуспешно изтриване на категорията.")
            }

            setCategories((current) => current.filter((x) => x.id !== deleteCategoryId))
            setDeleteCategoryId(null)
            await Promise.all([loadStats(), loadAlbums()])

            showToast({
                type: "success",
                title: "Готово",
                message: "Категорията беше изтрита успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно изтриване на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
        }
    }

    const moveCategory = async (categoryId: number, newDisplayOrder: number) => {
        setBusyCategoryId(categoryId)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}/move`, {
                method: "PUT",
                body: JSON.stringify({
                    displayOrder: newDisplayOrder,
                }),
            })

            if (!response.ok) {
                throw new Error("Неуспешна промяна на реда на категорията.")
            }

            await loadCategories()

            showToast({
                type: "success",
                title: "Готово",
                message: "Редът на категорията беше обновен.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешна промяна на реда на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
        }
    }

    const handleDropCategory = async (targetCategory: PortfolioCategoryRow) => {
        if (!draggedCategoryId || draggedCategoryId === targetCategory.id) {
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
            return
        }

        const draggedCategory = categories.find((x) => x.id === draggedCategoryId)
        if (!draggedCategory) {
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
            return
        }

        await moveCategory(draggedCategory.id, targetCategory.displayOrder)
    }

    const getAlbumStatus = (album: PortfolioAlbumRow) => {
        return album.isPublished ? "active" : "inactive"
    }

    const getAlbumCategoryName = (album: PortfolioAlbumRow) => {
        return album.portfolioCategory?.name || categories.find((x) => x.id === album.portfolioCategoryId)?.name || "—"
    }

    const filteredAlbums = useMemo(() => {
        const normalizedSearch = albumSearch.trim().toLocaleLowerCase("bg")
        const activity = readActivity()
        const created = (album: PortfolioAlbumRow) => Date.parse(album.createdAtUtc || "") || album.id
        const latest = (album: PortfolioAlbumRow) => Math.max(Number(activity?.[album.id]) || 0, Date.parse(album.updatedAtUtc || "") || 0, created(album))
        const compareText = (a: string, b: string) => a.localeCompare(b, "bg", { sensitivity: "base" })
        return albums.filter((album) => {
            const matchesStatus = albumStatusFilter === "all" || getAlbumStatus(album) === albumStatusFilter
            const matchesCategory = albumCategoryFilter === "all" || album.portfolioCategoryId === Number(albumCategoryFilter)
            const text = [album.title, album.slug, album.description, getAlbumCategoryName(album)].join(" ").toLocaleLowerCase("bg")
            return matchesStatus && matchesCategory && (!normalizedSearch || text.includes(normalizedSearch))
        }).sort((a, b) => {
            switch (albumSort) {
                case "created_desc": return created(b) - created(a) || b.id - a.id
                case "created_asc": return created(a) - created(b) || a.id - b.id
                case "title_asc": return compareText(a.title, b.title) || a.id - b.id
                case "title_desc": return compareText(b.title, a.title) || a.id - b.id
                case "category_asc": return compareText(getAlbumCategoryName(a), getAlbumCategoryName(b)) || compareText(a.title, b.title)
                case "active_first": return Number(b.isPublished) - Number(a.isPublished) || latest(b) - latest(a)
                case "manual": return a.portfolioCategoryId - b.portfolioCategoryId || a.displayOrder - b.displayOrder || a.id - b.id
                default: return latest(b) - latest(a) || b.id - a.id
            }
        })
    }, [albums, categories, albumSearch, albumStatusFilter, albumCategoryFilter, albumSort])

    const visibleIds = filteredAlbums.map(album => album.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedAlbumIds.has(id))
    const selectedVisibleCount = visibleIds.filter(id => selectedAlbumIds.has(id)).length
    const activeCategories = categories.filter(category => category.isActive)
    const runBulkAction = async (ids: number[], categoryId?: number) => {
        if (bulkLock.current || ids.length === 0) return
        bulkLock.current = true
        setBulkBusy(true)
        setBulkError("")
        try {
            const result = await apiFetchJson<{ count: number }>(`/admin/portfolio/albums/${categoryId === undefined ? "bulk-delete" : "bulk-move"}`, {
                method: "POST",
                body: JSON.stringify({ albumIds: ids, categoryId }),
            })
            setBulkDeleteIds(null)
            if (categoryId === undefined) setSelectedAlbumIds(current => new Set([...current].filter(id => !ids.includes(id))))
            await Promise.all([loadAlbums(), loadStats()])
            showToast({ type: "success", title: "Готово", message: categoryId === undefined
                ? `Изтрити албуми: ${result.count}.`
                : `Преместени албуми: ${result.count} в „${categories.find(c => c.id === categoryId)?.name}“.` })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Операцията беше неуспешна."
            setBulkError(message)
            setBulkDeleteIds(null)
            showToast({ type: "error", title: "Грешка", message })
        } finally { bulkLock.current = false; setBulkBusy(false) }
    }

    const albumStats = useMemo(() => {
        const active = albums.filter((x) => getAlbumStatus(x) === "active").length
        const inactive = albums.filter((x) => getAlbumStatus(x) === "inactive").length

        return {
            total: albums.length,
            active,
            inactive,
            expired: 0,
        }
    }, [albums])

    const getUnseenCount = (key: NotificationKey, currentTotal: number, fallbackNewCount: number) => {
        const seenCount = notificationSeen[key] ?? 0

        if (seenCount <= 0) return fallbackNewCount

        return Math.max(0, currentTotal - seenCount)
    }

    const markNotificationAsSeen = (key: NotificationKey, currentTotal: number) => {
        const nextState = {
            ...notificationSeen,
            [key]: currentTotal,
        }

        setNotificationSeen(nextState)
        saveNotificationSeenState(nextState)
    }

    const mainCards = [
        {
            title: "Потребители",
            value: statsLoading ? "..." : stats.users,
            link: "/admin/users",
            desc: statsLoading
                ? "Управление на потребители"
                : `Нови потребители: ${getUnseenCount("users", stats.users, stats.newUsers)}`,
            hasNew: getUnseenCount("users", stats.users, stats.newUsers) > 0,
            notificationKey: "users" as NotificationKey,
            currentTotal: stats.users,
        },
        {
            title: "Запитвания",
            value: statsLoading ? "..." : stats.contacts,
            link: "/admin/contact-requests",
            desc: statsLoading
                ? "Управление на съобщения"
                : `Нови запитвания: ${getUnseenCount("contacts", stats.contacts, stats.newContactRequests)}`,
            hasNew: getUnseenCount("contacts", stats.contacts, stats.newContactRequests) > 0,
            notificationKey: "contacts" as NotificationKey,
            currentTotal: stats.contacts,
        },
        {
            title: "Заявки за принтиране",
            value: statsLoading ? "..." : stats.printRequests,
            link: "/admin/print-requests",
            desc: statsLoading
                ? "Управление на заявки за принтиране"
                : `Нови заявки: ${getUnseenCount("printRequests", stats.printRequests, stats.newPrintRequests)}`,
            hasNew: getUnseenCount("printRequests", stats.printRequests, stats.newPrintRequests) > 0,
            notificationKey: "printRequests" as NotificationKey,
            currentTotal: stats.printRequests,
        },
    ]

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Админ панел
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">
                        Централно управление на съдържание, потребители, категории и албуми
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadAll()}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                    Обнови всичко
                </button>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mainCards.map((card) => (
                    <Link
                        key={card.title}
                        to={card.link}
                        onClick={() => markNotificationAsSeen(card.notificationKey, Number(card.currentTotal) || 0)}
                        className={`relative rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${
                            card.hasNew
                                ? "border-red-300 ring-2 ring-red-100 dark:border-red-500/40 dark:ring-red-500/10"
                                : "border-gray-200 dark:border-zinc-800"
                        }`}
                    >
                        {card.hasNew ? (
                            <span className="absolute right-4 top-4 inline-flex h-3 w-3 rounded-full bg-red-600" />
                        ) : null}

                        <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                            {card.title}
                        </h3>
                        <p className="mt-2 mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                            {card.value}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-zinc-300">{card.desc}</p>
                    </Link>
                ))}
            </div>

            <section id="albums" data-react-album-management="true" className="mb-10 scroll-mt-24">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Албуми
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button type="button" className={actionClass} disabled={albumManagementBusy || categoriesLoading}
                            onClick={() => void archive.start(null)}>
                            Изтегли всички
                        </button>
                        <button
                            type="button"
                            onClick={() => void loadAlbums()}
                            disabled={albumManagementBusy}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        >
                            Обнови албумите
                        </button>

                        <Link
                            to="/admin/client-galleries/new"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            Създай нов албум
                        </Link>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                            Общо албуми
                        </div>
                        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                            {albumsLoading ? "..." : albumStats.total}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm dark:border-green-500/20 dark:bg-zinc-900">
                        <div className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">
                            Активни
                        </div>
                        <div className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
                            {albumsLoading ? "..." : albumStats.active}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                            Неактивни
                        </div>
                        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                            {albumsLoading ? "..." : albumStats.inactive}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-500/20 dark:bg-zinc-900">
                        <div className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
                            Изтекли
                        </div>
                        <div className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
                            {albumsLoading ? "..." : albumStats.expired}
                        </div>
                    </div>
                </div>

                <div className="mb-5 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900" role="region" aria-label="Управление на албуми">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Търсене
                            <input type="text" value={albumSearch} onChange={e => setAlbumSearch(e.target.value)}
                                placeholder="Търси албум..." className={`${selectClass} mt-2`} />
                        </label>
                        <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Категория
                            <select value={albumCategoryFilter} onChange={e => setAlbumCategoryFilter(e.target.value)} className={`${selectClass} mt-2`}>
                                <option value="all">Всички категории</option>
                                {categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (неактивна)"}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Статус
                            <select value={albumStatusFilter} onChange={e => setAlbumStatusFilter(e.target.value)} className={`${selectClass} mt-2`}>
                                <option value="all">Всички албуми</option><option value="active">Активни</option><option value="inactive">Неактивни</option>
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Подреждане
                            <select value={albumSort} className={`${selectClass} mt-2`} onChange={e => {
                                setAlbumSort(e.target.value)
                                try { localStorage.setItem("dgvisionstudio.admin.albumSort", e.target.value) } catch { /* Session-only sorting. */ }
                            }}>
                                <option value="activity_desc">Последно добавени / редактирани</option>
                                <option value="created_desc">Най-ново създадени</option><option value="created_asc">Най-старо създадени</option>
                                <option value="title_asc">Име: А–Я</option><option value="title_desc">Име: Я–А</option>
                                <option value="category_asc">Категория</option><option value="active_first">Активни първо</option><option value="manual">Ръчен ред</option>
                            </select>
                        </label>
                    </div>

                    <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-800" aria-label="Групови действия за албуми">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
                                <input type="checkbox" className="h-5 w-5 accent-sky-600" checked={allVisibleSelected}
                                    ref={element => { if (element) element.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected }}
                                    disabled={albumManagementBusy || visibleIds.length === 0}
                                    onChange={() => setSelectedAlbumIds(current => toggleVisibleSelection(current, visibleIds))} />
                                Маркирай показаните ({visibleIds.length})
                            </label>
                            <span className="text-sm text-gray-700 dark:text-zinc-200" role="status">
                                Маркирани: {selectedAlbumIds.size}{selectedAlbumIds.size > selectedVisibleCount ? ` (${selectedAlbumIds.size - selectedVisibleCount} извън филтъра)` : ""}
                            </span>
                            <button type="button" className={actionClass} disabled={albumManagementBusy || !selectedAlbumIds.size}
                                onClick={() => setSelectedAlbumIds(new Set())}>Изчисти избора</button>
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                            <button type="button" className={actionClass} disabled={albumManagementBusy || !selectedAlbumIds.size}
                                onClick={() => void archive.start([...selectedAlbumIds])}>Изтегли маркираните ({selectedAlbumIds.size})</button>
                            <label className="min-w-0 flex-1 text-sm font-medium text-gray-700 dark:text-zinc-200 sm:min-w-52 sm:max-w-xs">
                                Премести в категория
                                <select className={`${selectClass} mt-1`} value={targetCategoryId} disabled={albumManagementBusy || categoriesLoading}
                                    onChange={e => setTargetCategoryId(e.target.value)}>
                                    <option value="">Избери активна категория</option>
                                    {activeCategories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </label>
                            <button type="button" className={actionClass} disabled={albumManagementBusy || !selectedAlbumIds.size || !targetCategoryId}
                                onClick={() => void runBulkAction([...selectedAlbumIds], Number(targetCategoryId))}>Премести маркираните</button>
                            <button type="button" className={`${actionClass} !border-red-300 !text-red-600 dark:!text-red-300`}
                                disabled={albumManagementBusy || !selectedAlbumIds.size}
                                onClick={() => setBulkDeleteIds([...selectedAlbumIds])}>Изтрий маркираните</button>
                        </div>
                        {bulkBusy && <p role="status" className="text-sm dark:text-white">Запазване на промените...</p>}
                        {bulkError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{bulkError}</p>}
                    </div>

                    {(archive.busy || archive.job || archive.error) && (
                        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-800 dark:text-white">
                            <p role="status" className="text-sm font-semibold">
                                {archive.busy ? archive.job?.status === "verifying" ? "Проверка на готовия архив..."
                                    : archive.job?.status === "writing" ? `Добавени снимки: ${archive.job.completedFiles} / ${archive.job.totalFiles}`
                                    : "Подготовка на архива..." : archive.downloadUrl ? "Архивът е готов. Изтеглянето е стартирано." : "Подготовката е прекъсната."}
                            </p>
                            {archive.busy && archive.job && archive.job.totalFiles > 0 &&
                                <progress className="w-full accent-sky-600" aria-label="Подготовка на архив" max={archive.job.totalFiles} value={archive.job.completedFiles} />}
                            {archive.error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{archive.error}</p>}
                            {archive.downloadUrl && <p className="text-sm">Ако изтеглянето не започне, <a href={archive.downloadUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline dark:text-sky-300">изтегли {archive.job?.fileName}</a>. Линкът е валиден 1 час.</p>}
                            {!archive.busy && <div className="flex flex-wrap gap-2">
                                {archive.error && <button type="button" className={actionClass} onClick={() => void archive.resume()}>Провери отново</button>}
                                <button type="button" className={actionClass} onClick={() => void archive.close()}>Затвори</button>
                            </div>}
                        </div>
                    )}
                </div>

                {albumsError ? (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {albumsError}
                    </div>
                ) : null}

                {albumsLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Зареждане...
                    </div>
                ) : null}

                {!albumsLoading && !filteredAlbums.length ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Няма създадени албуми.
                    </div>
                ) : null}

                {!albumsLoading && filteredAlbums.length > 0 ? (
                    <div className="grid grid-cols-2 gap-[2px] md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {filteredAlbums.map((album) => {
                            const status = getAlbumStatus(album)
                            const categoryName = getAlbumCategoryName(album)

                            return (
                                <div
                                    key={album.id}
                                    data-album-id={album.id}
                                    data-selected={selectedAlbumIds.has(album.id)}
                                    className="album-management-card overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        <label className="absolute bottom-2 left-2 z-10 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white/95 px-3 text-xs font-semibold text-gray-900 shadow">
                                            <input type="checkbox" className="h-5 w-5 accent-sky-600" checked={selectedAlbumIds.has(album.id)}
                                                aria-label={`Маркирай албум „${album.title}“`} disabled={albumManagementBusy}
                                                onChange={() => setSelectedAlbumIds(current => {
                                                    const next = new Set(current)
                                                    if (next.has(album.id)) next.delete(album.id); else next.add(album.id)
                                                    return next
                                                })} />
                                            Маркирай
                                        </label>
                                        {album.coverImageUrl ? (
                                            <img
                                                src={resolveAssetUrl(album.coverImageUrl)}
                                                alt={album.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400 dark:text-zinc-500">
                                                Няма корица
                                            </div>
                                        )}

                                        <div className="absolute left-4 top-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                                                    status === "active"
                                                        ? "border-green-200 bg-green-50/95 text-green-700 dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-300"
                                                        : "border-gray-200 bg-white/95 text-gray-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
                                                }`}
                                            >
                                                {status === "active" ? "Активен" : "Неактивен"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {album.title}
                                            </h3>

                                            <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-6 text-gray-600 dark:text-zinc-300">
                                                {album.description || "Няма описание"}
                                            </p>

                                            <div className="mt-3 text-xs font-medium text-gray-500 dark:text-zinc-400">
                                                Категория: {categoryName}
                                            </div>

                                            <div className="mt-1 text-xs font-medium text-gray-500 dark:text-zinc-400">
                                                Slug: {album.slug}
                                            </div>
                                        </div>

                                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                                    В портфолио
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {album.isPublished ? "Да" : "Не"}
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                                    Ред
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {album.displayOrder}
                                                </div>
                                            </div>
                                        </div>

                                        <button type="button" className={`${actionClass} mb-3 w-full`} disabled={albumManagementBusy}
                                            aria-label={`Изтегли архив на албум „${album.title}“`} onClick={() => void archive.start([album.id])}>
                                            Изтегли архив
                                        </button>
                                        <div className="album-card-actions flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                            <Link
                                                to={`/admin/client-galleries/edit?id=${album.id}`}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                            >
                                                Редакция
                                            </Link>

                                            <Link
                                                to={`/admin/client-galleries/access?id=${album.id}`}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                            >
                                                Достъп
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => setDeleteAlbumId(album.id)}
                                                disabled={albumManagementBusy}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                                            >
                                                {busyAlbumId === album.id ? "Зареждане..." : "Изтрий"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </section>

            <section id="categories" className="mb-10 scroll-mt-24">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Категории
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">
                            Създавай, редактирай, подреждай и управлявай категориите в портфолиото
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void loadCategories()}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        >
                            Обнови категориите
                        </button>

                        <Link
                            to="/admin/portfolio-categories/new"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            Създай нова категория
                        </Link>
                    </div>
                </div>

                {categoriesError ? (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {categoriesError}
                    </div>
                ) : null}

                {categoriesLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Зареждане...
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px]">
                                <thead className="bg-gray-50 dark:bg-zinc-950">
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Ред
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Категория
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Статус
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            draggable={busyCategoryId !== category.id}
                                            onDragStart={() => setDraggedCategoryId(category.id)}
                                            onDragOver={(event) => {
                                                event.preventDefault()
                                                setDragOverCategoryId(category.id)
                                            }}
                                            onDragLeave={() => {
                                                if (dragOverCategoryId === category.id) {
                                                    setDragOverCategoryId(null)
                                                }
                                            }}
                                            onDrop={() => void handleDropCategory(category)}
                                            onDragEnd={() => {
                                                setDraggedCategoryId(null)
                                                setDragOverCategoryId(null)
                                            }}
                                            className={`border-b border-gray-100 align-middle last:border-b-0 dark:border-zinc-800 ${
                                                category.isActive
                                                    ? "bg-green-200 hover:bg-green-300 dark:bg-green-700/60 dark:hover:bg-green-700/75"
                                                    : dragOverCategoryId === category.id
                                                      ? "bg-sky-50 dark:bg-sky-500/10"
                                                      : "bg-white dark:bg-zinc-900"
                                            }`}
                                        >
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="cursor-grab select-none text-base text-gray-400 dark:text-zinc-500">
                                                        ⋮⋮
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                                        {category.displayOrder}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                {category.name}
                                                {category.nameEn ? (
                                                    <span className="font-medium text-gray-500 dark:text-zinc-300">
                                                        {" / "}{category.nameEn}
                                                    </span>
                                                ) : null}
                                            </td>

                                            <td className="p-0">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleToggleCategory(category)}
                                                    disabled={busyCategoryId === category.id}
                                                    className={`flex h-full min-h-[40px] w-full items-center justify-center px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        category.isActive
                                                            ? "bg-green-700 text-white hover:bg-green-800 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                                    }`}
                                                >
                                                    {category.isActive ? "Активна" : "Неактивна"}
                                                </button>
                                            </td>

                                            <td className="p-0">
                                                <div className="flex min-h-[40px] w-full flex-nowrap items-stretch justify-end gap-0">
                                                    <Link
                                                        to={`/admin/portfolio-categories/edit?id=${category.id}`}
                                                        className="flex min-h-[40px] w-[140px] items-center justify-center bg-slate-100 px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                                    >
                                                        Редактирай
                                                    </Link>

                                                    <Link
                                                        to={`/admin/portfolio-categories/albums?id=${category.id}`}
                                                        className="flex min-h-[40px] w-[160px] items-center justify-center bg-slate-100 px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                                    >
                                                        Управление албуми
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteCategoryId(category.id)}
                                                        disabled={busyCategoryId === category.id}
                                                        className="flex min-h-[40px] w-[145px] items-center justify-center bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500"
                                                    >
                                                        Изтрий категория
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            <ConfirmDialog
                open={bulkDeleteIds !== null}
                title={`Изтриване на ${bulkDeleteIds?.length || 0} албума`}
                description={`Ще бъдат изтрити маркираните албуми и снимките в тях, включително избраните извън текущия филтър: ${albums.filter(a => bulkDeleteIds?.includes(a.id)).slice(0, 3).map(a => a.title).join(", ")}${(bulkDeleteIds?.length || 0) > 3 ? "…" : ""}. Потвърждаваш ли?`}
                confirmText={`Изтрий ${bulkDeleteIds?.length || 0} албума`}
                busy={bulkBusy}
                onConfirm={() => { if (bulkDeleteIds) void runBulkAction(bulkDeleteIds) }}
                onCancel={() => { if (!bulkBusy) setBulkDeleteIds(null) }}
            />

            <ConfirmDialog
                open={deleteCategoryId !== null}
                title="Изтриване на категория"
                description="Сигурен ли си, че искаш да изтриеш тази категория?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={busyCategoryId === deleteCategoryId}
                onConfirm={() => void handleDeleteCategory()}
                onCancel={() => {
                    if (busyCategoryId !== deleteCategoryId) {
                        setDeleteCategoryId(null)
                    }
                }}
            />

            <ConfirmDialog
                open={deleteAlbumId !== null}
                title="Изтриване на албум"
                description="Сигурен ли си, че искаш да изтриеш този албум?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={busyAlbumId === deleteAlbumId}
                onConfirm={() => void handleDeleteAlbum()}
                onCancel={() => {
                    if (busyAlbumId !== deleteAlbumId) {
                        setDeleteAlbumId(null)
                    }
                }}
            />
        </div>
    )
}

