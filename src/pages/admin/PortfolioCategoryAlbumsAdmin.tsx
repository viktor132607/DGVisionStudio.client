import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiFetch } from "../../services/api"

type CategorySummary = {
    id: number
    name: string
    nameEn?: string | null
    key: string
    displayOrder: number
    isActive: boolean
}

type CategoryAlbumOption = {
    id: number
    title: string
    slug: string
    coverImageUrl?: string | null
    displayOrder: number
    isPublished: boolean
    isSelected: boolean
}

type CategoryAlbumsResponse = {
    category: CategorySummary
    albums: CategoryAlbumOption[]
}

export default function PortfolioCategoryAlbumsAdmin() {
    const [searchParams] = useSearchParams()
    const categoryIdParam = searchParams.get("id")
    const categoryId = categoryIdParam ? Number(categoryIdParam) : 0

    const [data, setData] = useState<CategoryAlbumsResponse | null>(null)
    const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([])
    const [search, setSearch] = useState("")
    const [showOnlySelected, setShowOnlySelected] = useState(false)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = async () => {
        if (!categoryId || !Number.isFinite(categoryId)) {
            setError("Невалиден category id.")
            setLoading(false)
            return
        }

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}/albums`, {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Неуспешно зареждане на албумите за категорията.")
            }

            const result = (await response.json()) as CategoryAlbumsResponse
            setData(result)
            setSelectedAlbumIds(
                (result.albums || []).filter((item) => item.isSelected).map((item) => item.id)
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Неуспешно зареждане на албумите за категорията."
            )
            setData(null)
            setSelectedAlbumIds([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [categoryId])

    const filteredAlbums = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()
        const albums = [...(data?.albums ?? [])].sort(
            (a, b) => a.displayOrder - b.displayOrder || a.id - b.id
        )

        return albums.filter((album) => {
            const matchesSearch =
                !normalizedSearch ||
                album.title.toLowerCase().includes(normalizedSearch) ||
                album.slug.toLowerCase().includes(normalizedSearch)

            const matchesSelection = showOnlySelected
                ? selectedAlbumIds.includes(album.id)
                : true

            return matchesSearch && matchesSelection
        })
    }, [data?.albums, search, selectedAlbumIds, showOnlySelected])

    const toggleAlbum = (albumId: number) => {
        setSelectedAlbumIds((current) =>
            current.includes(albumId)
                ? current.filter((id) => id !== albumId)
                : [...current, albumId]
        )
    }

    const selectAllVisible = () => {
        setSelectedAlbumIds((current) => {
            const next = new Set(current)
            filteredAlbums.forEach((album) => next.add(album.id))
            return Array.from(next)
        })
    }

    const clearAllVisible = () => {
        const visibleIds = new Set(filteredAlbums.map((album) => album.id))
        setSelectedAlbumIds((current) => current.filter((id) => !visibleIds.has(id)))
    }

    const handleSave = async () => {
        if (!categoryId || !Number.isFinite(categoryId)) {
            setError("Невалиден category id.")
            return
        }

        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}/albums`, {
                method: "PUT",
                body: JSON.stringify({
                    albumIds: selectedAlbumIds,
                }),
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || "Неуспешно записване на албумите.")
            }

            setSuccess("Албумите към категорията бяха обновени успешно.")
            await load()
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Неуспешно записване на албумите."
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link
                        to={categoryId ? `/admin/portfolio-categories/edit?id=${categoryId}` : "/admin"}
                        className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Назад към категорията
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage albums
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        Избери кои албуми да се визуализират в категорията.
                    </p>
                </div>

                {data?.category ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {data.category.name}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-zinc-400">
                            {data.category.key}
                        </div>
                    </div>
                ) : null}
            </div>

            {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Зареждане...
                </div>
            ) : null}

            {error ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    {success}
                </div>
            ) : null}

            {data ? (
                <>
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Търси по име или slug"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900"
                            />

                            <label className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:text-zinc-200">
                                <input
                                    type="checkbox"
                                    checked={showOnlySelected}
                                    onChange={(e) => setShowOnlySelected(e.target.checked)}
                                />
                                Само избрани
                            </label>

                            <button
                                type="button"
                                onClick={selectAllVisible}
                                className="rounded-xl border border-sky-300 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
                            >
                                Избери видимите
                            </button>

                            <button
                                type="button"
                                onClick={clearAllVisible}
                                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            >
                                Махни видимите
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px]">
                                <thead className="bg-gray-50 dark:bg-zinc-950">
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Покажи
                                        </th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Cover
                                        </th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Албум
                                        </th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Slug
                                        </th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Ред
                                        </th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                            Статус
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAlbums.length > 0 ? (
                                        filteredAlbums.map((album) => {
                                            const checked = selectedAlbumIds.includes(album.id)

                                            return (
                                                <tr
                                                    key={album.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 last:border-b-0 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                                >
                                                    <td className="p-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleAlbum(album.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                                        />
                                                    </td>

                                                    <td className="p-3">
                                                        {album.coverImageUrl ? (
                                                            <img
                                                                src={album.coverImageUrl}
                                                                alt={album.title}
                                                                className="h-14 w-20 rounded-xl border border-gray-200 object-cover dark:border-zinc-800"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-zinc-700 dark:text-zinc-500">
                                                                No image
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {album.title}
                                                        </div>
                                                    </td>

                                                    <td className="p-3 text-sm text-gray-600 dark:text-zinc-400">
                                                        {album.slug}
                                                    </td>

                                                    <td className="p-3 text-sm text-gray-600 dark:text-zinc-400">
                                                        {album.displayOrder}
                                                    </td>

                                                    <td className="p-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                album.isPublished
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                                                    : "bg-neutral-100 text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                            }`}
                                                        >
                                                            {album.isPublished ? "Публикуван" : "Скрит"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-sm text-gray-500 dark:text-zinc-400"
                                            >
                                                Няма намерени албуми.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            {saving ? "Запазване..." : "Запази"}
                        </button>

                        <button
                            type="button"
                            onClick={() => void load()}
                            disabled={saving}
                            className="inline-flex items-center rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Обнови
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    )
}