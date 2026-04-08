import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiFetch } from "../../services/api"
import {
    grantGalleryAccess,
    removeGalleryAccess,
    updateGalleryAccess,
} from "../../services/clientGalleries"

type UserHeader = {
    id: string
    email: string
    emailConfirmed?: boolean
    isBlocked?: boolean
    roles?: string[]
}

type UserAlbumAccess = {
    galleryId: number
    galleryTitle: string
    galleryDescription?: string | null
    galleryCoverImageUrl?: string | null
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
}

type AvailableGallery = {
    id: number
    title: string
    coverImageUrl?: string | null
}

type ResponseModel = {
    user: UserHeader
    accesses: UserAlbumAccess[]
    availableGalleries: AvailableGallery[]
}

export default function UserAlbumsAdmin() {
    const { id } = useParams()
    const [data, setData] = useState<ResponseModel | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedGalleryId, setSelectedGalleryId] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    const load = async () => {
        if (!id) return

        setLoading(true)
        setError("")

        try {
            const response = await apiFetch(`/admin/users/${id}/albums`, {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Failed to load user album access.")
            }

            const result = (await response.json()) as ResponseModel
            setData(result)
            setSelectedGalleryId(result.availableGalleries[0]?.id ?? 0)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load user album access.")
            setData(null)
            setSelectedGalleryId(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [id])

    const availableOptions = useMemo(() => data?.availableGalleries ?? [], [data])

    const addAlbum = async () => {
        if (!data?.user?.email || !selectedGalleryId) return

        setSaving(true)
        try {
            await grantGalleryAccess(selectedGalleryId, {
                userEmail: data.user.email,
                previewEnabled: true,
                downloadEnabled: false,
                downloadExpiresAtUtc: null,
            })

            await load()
        } finally {
            setSaving(false)
        }
    }

    const togglePreview = async (item: UserAlbumAccess) => {
        if (!data?.user?.id) return

        await updateGalleryAccess(item.galleryId, data.user.id, {
            previewEnabled: !item.previewEnabled,
            downloadEnabled: item.downloadEnabled,
            downloadExpiresAtUtc: item.downloadExpiresAtUtc ?? null,
        })

        await load()
    }

    const toggleDownload = async (item: UserAlbumAccess) => {
        if (!data?.user?.id) return

        await updateGalleryAccess(item.galleryId, data.user.id, {
            previewEnabled: item.previewEnabled,
            downloadEnabled: !item.downloadEnabled,
            downloadExpiresAtUtc: item.downloadExpiresAtUtc ?? null,
        })

        await load()
    }

    const removeAccessFromAlbum = async (item: UserAlbumAccess) => {
        if (!data?.user?.id) return
        if (!window.confirm(`Remove access to "${item.galleryTitle}"?`)) return

        await removeGalleryAccess(item.galleryId, data.user.id)
        await load()
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div>
                    <Link
                        to="/admin/users"
                        className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Back to users
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage albums
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        User album access management
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Loading...
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {data?.user ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {data.user.email}
                                </h2>
                                <p className="mt-1 break-all text-sm text-gray-500 dark:text-zinc-400">
                                    User ID: {data.user.id}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {data.user.roles?.map((role) => (
                                    <span
                                        key={role}
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            role === "Admin"
                                                ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                                                : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                                        }`}
                                    >
                                        {role}
                                    </span>
                                ))}

                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        data.user.isBlocked
                                            ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                                            : "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                    }`}
                                >
                                    {data.user.isBlocked ? "Blocked" : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}

                {data ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                                    Add album
                                </label>
                                <select
                                    value={selectedGalleryId}
                                    onChange={(e) => setSelectedGalleryId(Number(e.target.value))}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900"
                                >
                                    <option value={0}>Select album</option>
                                    {availableOptions.map((gallery) => (
                                        <option key={gallery.id} value={gallery.id}>
                                            {gallery.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={addAlbum}
                                disabled={!selectedGalleryId || saving}
                                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {saving ? "Adding..." : "Add album"}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead className="bg-gray-50 dark:bg-zinc-950">
                            <tr className="border-b border-gray-200 dark:border-zinc-800">
                                <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">Cover</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">Album</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">Preview</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">Download</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-300">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data?.accesses?.length ? (
                                data.accesses.map((item) => (
                                    <tr
                                        key={item.galleryId}
                                        className="border-b border-gray-100 hover:bg-gray-50 last:border-b-0 dark:border-zinc-800 dark:hover:bg-zinc-950"
                                    >
                                        <td className="p-3">
                                            {item.galleryCoverImageUrl ? (
                                                <img
                                                    src={item.galleryCoverImageUrl}
                                                    alt={item.galleryTitle}
                                                    className="h-16 w-16 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-zinc-800" />
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {item.galleryTitle}
                                            </div>
                                            {item.galleryDescription ? (
                                                <div className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                                                    {item.galleryDescription}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() => void togglePreview(item)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    item.previewEnabled
                                                        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                                        : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                }`}
                                            >
                                                {item.previewEnabled ? "Enabled" : "Disabled"}
                                            </button>
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() => void toggleDownload(item)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    item.downloadEnabled
                                                        ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                                                        : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                }`}
                                            >
                                                {item.downloadEnabled ? "Enabled" : "Disabled"}
                                            </button>

                                            {item.downloadExpiresAtUtc ? (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                                                    Expires: {new Date(item.downloadExpiresAtUtc).toLocaleString()}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() => void removeAccessFromAlbum(item)}
                                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                            >
                                                Remove access
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-sm text-gray-500 dark:text-zinc-400"
                                    >
                                        No albums assigned to this user.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}