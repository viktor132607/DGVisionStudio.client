import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"
import { deleteAdminClientGallery, getAdminClientGalleries } from "../../services/clientGalleries"
import type { MyClientGalleryDto } from "../../types/clientGallery"
import ConfirmDialog from "../../components/admin/ConfirmDialog"

type DashboardStats = {
    users: number
    contacts: number
    services: number
    testimonials: number
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

export default function AdminPanel() {
    const [stats, setStats] = useState<DashboardStats>({
        users: 0,
        contacts: 0,
        services: 0,
        testimonials: 0,
        portfolioCategories: 0,
        portfolioAlbums: 0,
        portfolioImages: 0,
    })

    const [statsLoading, setStatsLoading] = useState(true)

    const [albums, setAlbums] = useState<MyClientGalleryDto[]>([])
    const [albumsLoading, setAlbumsLoading] = useState(true)
    const [albumsError, setAlbumsError] = useState("")
    const [busyAlbumId, setBusyAlbumId] = useState<number | null>(null)
    const [albumSearch, setAlbumSearch] = useState("")
    const [albumStatusFilter, setAlbumStatusFilter] = useState("all")
    const [deleteAlbumId, setDeleteAlbumId] = useState<number | null>(null)

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
                contacts: data?.contacts ?? 0,
                services: data?.services ?? 0,
                testimonials: data?.testimonials ?? 0,
                portfolioCategories: data?.portfolioCategories ?? 0,
                portfolioAlbums: data?.portfolioAlbums ?? 0,
                portfolioImages: data?.portfolioImages ?? 0,
            })
        } catch {
            setStats({
                users: 0,
                contacts: 0,
                services: 0,
                testimonials: 0,
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
            const data = await getAdminClientGalleries()
            setAlbums(Array.isArray(data) ? data : [])
        } catch (err) {
            setAlbumsError(err instanceof Error ? err.message : "Грешка при зареждане на албумите.")
            setAlbums([])
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
            setCategoriesError(err instanceof Error ? err.message : "Грешка при зареждане на категориите.")
            setCategories([])
        } finally {
            setCategoriesLoading(false)
        }
    }

    const loadAll = async () => {
        await Promise.all([loadStats(), loadAlbums(), loadCategories()])
    }

    useEffect(() => {
        void loadAll()
    }, [])

    const handleDeleteAlbum = async () => {
        if (!deleteAlbumId) return

        setBusyAlbumId(deleteAlbumId)
        setAlbumsError("")

        try {
            await deleteAdminClientGallery(deleteAlbumId)
            setAlbums((current) => current.filter((x) => x.id !== deleteAlbumId))
            setDeleteAlbumId(null)
        } catch (err) {
            setAlbumsError(err instanceof Error ? err.message : "Изтриването беше неуспешно.")
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
        } catch (err) {
            setCategoriesError(err instanceof Error ? err.message : "Неуспешна промяна на категорията.")
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
        } catch (err) {
            setCategoriesError(err instanceof Error ? err.message : "Неуспешно изтриване на категорията.")
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
        } catch (err) {
            setCategoriesError(
                err instanceof Error ? err.message : "Неуспешна промяна на реда на категорията."
            )
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

    const getAlbumStatus = (album: MyClientGalleryDto) => {
        if (album.isExpired) return "expired"
        if (album.previewEnabled || album.downloadEnabled) return "active"
        return "inactive"
    }

    const filteredAlbums = useMemo(() => {
        const normalizedSearch = albumSearch.trim().toLowerCase()

        return albums.filter((album) => {
            const status = getAlbumStatus(album)

            const matchesStatus = albumStatusFilter === "all" ? true : status === albumStatusFilter
            const matchesSearch =
                !normalizedSearch ||
                album.title.toLowerCase().includes(normalizedSearch) ||
                album.description?.toLowerCase().includes(normalizedSearch)

            return matchesStatus && matchesSearch
        })
    }, [albums, albumSearch, albumStatusFilter])

    const albumStats = useMemo(() => {
        const active = albums.filter((x) => getAlbumStatus(x) === "active").length
        const inactive = albums.filter((x) => getAlbumStatus(x) === "inactive").length
        const expired = albums.filter((x) => getAlbumStatus(x) === "expired").length

        return {
            total: albums.length,
            active,
            inactive,
            expired,
        }
    }, [albums])

    const mainCards = [
        {
            title: "Потребители",
            value: statsLoading ? "..." : stats.users,
            link: "/admin/users",
            desc: "Управление на потребители",
        },
        {
            title: "Запитвания",
            value: statsLoading ? "..." : stats.contacts,
            link: "/admin/contact-requests",
            desc: "Управление на съобщения",
        },
        {
            title: "Отзиви",
            value: statsLoading ? "..." : stats.testimonials,
            link: "/admin/testimonials",
            desc: "Управление на отзиви",
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
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
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

            <section id="albums" className="mb-10 scroll-mt-24">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Албуми
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void loadAlbums()}
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

                <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 xl:grid-cols-12">
                    <div className="xl:col-span-8">
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Търсене
                        </label>
                        <input
                            type="text"
                            value={albumSearch}
                            onChange={(e) => setAlbumSearch(e.target.value)}
                            placeholder="Търси по заглавие или описание..."
                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                        />
                    </div>

                    <div className="xl:col-span-4">
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            Статус
                        </label>
                        <select
                            value={albumStatusFilter}
                            onChange={(e) => setAlbumStatusFilter(e.target.value)}
                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                        >
                            <option value="all">Всички</option>
                            <option value="active">Активни</option>
                            <option value="inactive">Неактивни</option>
                            <option value="expired">Изтекли</option>
                        </select>
                    </div>
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

                            return (
                                <div
                                    key={album.id}
                                    className="overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        {album.coverImageUrl ? (
                                            <img
                                                src={album.coverImageUrl}
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
                                                    status === "expired"
                                                        ? "border-red-200 bg-red-50/95 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300"
                                                        : status === "active"
                                                          ? "border-green-200 bg-green-50/95 text-green-700 dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-300"
                                                          : "border-gray-200 bg-white/95 text-gray-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
                                                }`}
                                            >
                                                {status === "expired"
                                                    ? "Изтекъл"
                                                    : status === "active"
                                                      ? "Активен"
                                                      : "Неактивен"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {album.title}
                                            </h3>

                                            {album.description ? (
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-zinc-300">
                                                    {album.description}
                                                </p>
                                            ) : null}

                                            <div className="mt-3 text-xs font-medium text-gray-500 dark:text-zinc-400">
                                                Категория: —
                                            </div>
                                        </div>

                                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                                    В портфолио
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                    Незададено
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                                                    Сваляне
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {album.downloadEnabled ? "Включено" : "Изключено"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
                                                disabled={busyAlbumId === album.id}
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

            <section className="mb-10">
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
                            <table className="w-full min-w-[1180px]">
                                <thead className="bg-gray-50 dark:bg-zinc-950">
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Ред
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Категория
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Име EN
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Ключ
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Статус
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
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
                                            className={`border-b border-gray-100 align-top last:border-b-0 dark:border-zinc-800 ${
                                                dragOverCategoryId === category.id
                                                    ? "bg-sky-50 dark:bg-sky-500/10"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="cursor-grab select-none text-lg text-gray-400 dark:text-zinc-500">
                                                        ⋮⋮
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-zinc-300">
                                                        {category.displayOrder}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                {category.name}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-zinc-300">
                                                {category.nameEn || "—"}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-zinc-300">
                                                {category.key}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                                        category.isActive
                                                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
                                                            : "border-gray-200 bg-gray-50 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                    }`}
                                                >
                                                    {category.isActive ? "Активна" : "Неактивна"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        to={`/admin/portfolio-categories/edit?id=${category.id}`}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                                    >
                                                        Редактиране
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => void handleToggleCategory(category)}
                                                        disabled={busyCategoryId === category.id}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                                                    >
                                                        {category.isActive ? "Направи неактивна" : "Направи активна"}
                                                    </button>

                                                    <Link
                                                        to={`/admin/portfolio-categories/albums?id=${category.id}`}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-300 bg-white px-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-500/40 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
                                                    >
                                                        Manage albums
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteCategoryId(category.id)}
                                                        disabled={busyCategoryId === category.id}
                                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                                                    >
                                                        Delete category
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