import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { apiFetch } from "../../services/api"
import { getAdminClientGalleries } from "../../services/clientGalleries"
import type { MyClientGalleryDto } from "../../types/clientGallery"

const MAX_VIDEO_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024
const allowedVideoExtensions = [".mp4", ".mov", ".webm", ".m4v"]

function isAllowedVideo(file: File) {
    const name = file.name.toLowerCase()
    return file.type.startsWith("video/") && allowedVideoExtensions.some((extension) => name.endsWith(extension))
}

async function readError(response: Response) {
    try {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const data = await response.json()
            return data?.message || data?.details || data?.title || "Upload failed."
        }

        const text = await response.text()
        return text || "Upload failed."
    } catch {
        return "Upload failed."
    }
}

export default function GalleryVideosAdmin() {
    const [galleries, setGalleries] = useState<MyClientGalleryDto[]>([])
    const [galleryId, setGalleryId] = useState<number | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const selectedGallery = useMemo(
        () => galleries.find((gallery) => gallery.id === galleryId) || null,
        [galleries, galleryId]
    )

    const load = async () => {
        setLoading(true)
        setError("")
        setMessage("")

        try {
            const data = await getAdminClientGalleries()
            setGalleries(data)
            setGalleryId((current) => current ?? data[0]?.id ?? null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load albums.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        event.target.value = ""
        setMessage("")
        setError("")

        if (!file) {
            setSelectedFile(null)
            return
        }

        if (!isAllowedVideo(file)) {
            setSelectedFile(null)
            setError("Only video files are allowed: mp4, mov, webm, m4v.")
            return
        }

        if (file.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
            setSelectedFile(null)
            setError("Video is too large. Maximum size is 100MB.")
            return
        }

        setSelectedFile(file)
    }

    const upload = async () => {
        if (!galleryId || !selectedFile) return

        setUploading(true)
        setError("")
        setMessage("")

        const formData = new FormData()
        formData.append("file", selectedFile)

        try {
            const response = await apiFetch(`/admin/client-galleries/${galleryId}/videos/upload`, {
                method: "POST",
                body: formData,
                skipJsonContentType: true,
            })

            if (!response.ok) throw new Error(await readError(response))

            setSelectedFile(null)
            setMessage("Video uploaded to album.")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Видео в албуми</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Качване на видео клип към съществуващ албум. Максимум 100MB на видео.</p>
                </div>

                <button type="button" onClick={load} disabled={loading || uploading} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
                    Презареди
                </button>
            </div>

            {error ? <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            {message ? <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                {loading ? (
                    <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500 dark:bg-black/30">Зареждане...</div>
                ) : galleries.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500 dark:bg-black/30">Няма налични албуми.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Албум
                            <select value={galleryId ?? ""} onChange={(event) => setGalleryId(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white">
                                {galleries.map((gallery) => (
                                    <option key={gallery.id} value={gallery.id}>{gallery.title}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Видео файл
                            <input type="file" accept="video/*,.mp4,.mov,.webm,.m4v" onChange={handleFileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-white dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        <div className="lg:col-span-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:bg-black/30 dark:text-white/70">
                            Избран албум: <span className="font-black text-slate-950 dark:text-white">{selectedGallery?.title || "-"}</span>
                            <br />
                            Избран файл: <span className="font-black text-slate-950 dark:text-white">{selectedFile?.name || "няма"}</span>
                        </div>

                        <button type="button" onClick={upload} disabled={!galleryId || !selectedFile || uploading} className="lg:col-span-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">
                            {uploading ? "Качване..." : "Качи видео"}
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}
