import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent } from "react"
import { apiFetch, apiFetchJson } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"

type SlideshowImage = {
    id: number
    imageUrl: string
    thumbnailUrl?: string | null
    caption?: string | null
    altText?: string | null
    albumTitle?: string | null
    categoryName?: string | null
    portfolioAlbumId?: number | null
}

type SlideshowResponse = {
    selectedImages?: SlideshowImage[]
    availableImages?: SlideshowImage[]
    introVideoUrl?: string | null
    useDefaultInterval?: boolean
    intervalMs?: number | null
    defaultIntervalMs?: number | null
    minIntervalMs?: number | null
    maxIntervalMs?: number | null
}

type AlbumOption = {
    key: string
    title: string
    category?: string | null
    count: number
}

type SavedLayout = {
    name: string
    imageIds: number[]
    createdAt: string
}

const SLIDESHOW_LAYOUTS_STORAGE_KEY = "dgvisionstudio.admin.slideshowLayouts"
const FALLBACK_DEFAULT_INTERVAL_MS = 4500
const FALLBACK_MIN_INTERVAL_MS = 1000
const FALLBACK_MAX_INTERVAL_MS = 30000

const imageSrc = (image: SlideshowImage) => resolveAssetUrl(image.thumbnailUrl || image.imageUrl || "")
const imageTitle = (image: SlideshowImage) => image.caption || image.altText || image.albumTitle || `Снимка #${image.id}`
const albumKey = (image: SlideshowImage) => String(image.portfolioAlbumId ?? image.albumTitle ?? "no-album")
const msToSecondsLabel = (value: number) => `${Number((value / 1000).toFixed(1))}`

function shuffleImages<T>(items: T[]) {
    const next = [...items]

    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
        const current = next[index]
        next[index] = next[swapIndex]
        next[swapIndex] = current
    }

    return next
}

function readSavedLayouts() {
    if (typeof window === "undefined") return [] as SavedLayout[]

    try {
        const raw = window.localStorage.getItem(SLIDESHOW_LAYOUTS_STORAGE_KEY)
        if (!raw) return [] as SavedLayout[]

        const parsed = JSON.parse(raw) as SavedLayout[]
        if (!Array.isArray(parsed)) return [] as SavedLayout[]

        return parsed.filter(
            (layout) =>
                typeof layout?.name === "string" &&
                Array.isArray(layout.imageIds) &&
                layout.imageIds.every((id) => Number.isFinite(Number(id)))
        )
    } catch {
        return [] as SavedLayout[]
    }
}

function writeSavedLayouts(layouts: SavedLayout[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(SLIDESHOW_LAYOUTS_STORAGE_KEY, JSON.stringify(layouts))
}

async function readErrorMessage(response: Response) {
    try {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const data = await response.json()
            return data?.message || data?.title || data?.error || "Грешка при заявката."
        }

        const text = await response.text()
        return text || "Грешка при заявката."
    } catch {
        return "Грешка при заявката."
    }
}

export default function SlideshowAdmin() {
    const [selected, setSelected] = useState<SlideshowImage[]>([])
    const [available, setAvailable] = useState<SlideshowImage[]>([])
    const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [selectedAlbumKeys, setSelectedAlbumKeys] = useState<string[]>([])
    const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>(() => readSavedLayouts())
    const [layoutName, setLayoutName] = useState("")
    const [useDefaultInterval, setUseDefaultInterval] = useState(true)
    const [intervalSeconds, setIntervalSeconds] = useState(msToSecondsLabel(FALLBACK_DEFAULT_INTERVAL_MS))
    const [defaultIntervalMs, setDefaultIntervalMs] = useState(FALLBACK_DEFAULT_INTERVAL_MS)
    const [minIntervalMs, setMinIntervalMs] = useState(FALLBACK_MIN_INTERVAL_MS)
    const [maxIntervalMs, setMaxIntervalMs] = useState(FALLBACK_MAX_INTERVAL_MS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [draggedId, setDraggedId] = useState<number | null>(null)

    const load = async () => {
        setLoading(true)
        setError("")
        setMessage("")

        try {
            const data = await apiFetchJson<SlideshowResponse>("/admin/slideshow", {
                method: "GET",
                skipJsonContentType: true,
            })

            const nextDefaultIntervalMs = Number(data.defaultIntervalMs) || FALLBACK_DEFAULT_INTERVAL_MS
            const nextMinIntervalMs = Number(data.minIntervalMs) || FALLBACK_MIN_INTERVAL_MS
            const nextMaxIntervalMs = Number(data.maxIntervalMs) || FALLBACK_MAX_INTERVAL_MS
            const nextIntervalMs = Number(data.intervalMs) || nextDefaultIntervalMs

            setSelected(Array.isArray(data.selectedImages) ? data.selectedImages : [])
            setAvailable(Array.isArray(data.availableImages) ? data.availableImages : [])
            setIntroVideoUrl(data.introVideoUrl?.trim() || null)
            setUseDefaultInterval(data.useDefaultInterval ?? true)
            setDefaultIntervalMs(nextDefaultIntervalMs)
            setMinIntervalMs(nextMinIntervalMs)
            setMaxIntervalMs(nextMaxIntervalMs)
            setIntervalSeconds(msToSecondsLabel(nextIntervalMs))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при зареждане.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const selectedIds = useMemo(() => new Set(selected.map((image) => image.id)), [selected])

    const albumOptions = useMemo<AlbumOption[]>(() => {
        const map = new Map<string, AlbumOption>()

        available.forEach((image) => {
            const key = albumKey(image)
            const existing = map.get(key)

            if (existing) {
                existing.count += 1
                return
            }

            map.set(key, {
                key,
                title: image.albumTitle || "Без албум",
                category: image.categoryName,
                count: 1,
            })
        })

        return [...map.values()].sort((a, b) =>
            a.title.localeCompare(b.title, "bg") || a.key.localeCompare(b.key)
        )
    }, [available])

    const filteredAvailable = useMemo(() => {
        const term = search.trim().toLowerCase()
        const albumFilter = new Set(selectedAlbumKeys)

        return available.filter((image) => {
            if (albumFilter.size > 0 && !albumFilter.has(albumKey(image))) return false

            if (!term) return true

            return (
                String(image.id).includes(term) ||
                image.caption?.toLowerCase().includes(term) ||
                image.altText?.toLowerCase().includes(term) ||
                image.albumTitle?.toLowerCase().includes(term) ||
                image.categoryName?.toLowerCase().includes(term)
            )
        })
    }, [available, search, selectedAlbumKeys])

    const toggleAlbum = (key: string) => {
        setSelectedAlbumKeys((current) =>
            current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key]
        )
    }

    const toggleSelected = (image: SlideshowImage) => {
        setSelected((current) => {
            const isSelected = current.some((item) => item.id === image.id)
            if (isSelected) return current.filter((item) => item.id !== image.id)
            return [...current, image]
        })
    }

    const addAllFiltered = () => {
        setSelected((current) => {
            const currentIds = new Set(current.map((image) => image.id))
            const toAdd = filteredAvailable.filter((image) => !currentIds.has(image.id))
            return [...current, ...toAdd]
        })
        setMessage("Снимките от избраните филтри са добавени. Натисни Запази, за да се публикува редът.")
        setError("")
    }

    const addAllFilteredShuffled = () => {
        setSelected((current) => {
            const currentIds = new Set(current.map((image) => image.id))
            const toAdd = shuffleImages(filteredAvailable.filter((image) => !currentIds.has(image.id)))
            return [...current, ...toAdd]
        })
        setMessage("Снимките от избраните албуми са добавени разбъркано. Натисни Запази, за да се публикува редът.")
        setError("")
    }

    const shuffleSelected = () => {
        setSelected((current) => shuffleImages(current))
        setMessage("Текущият ред е разбъркан. Натисни Запази, за да се публикува.")
        setError("")
    }

    const saveLayout = () => {
        if (selected.length === 0) {
            setError("Няма снимки за записване като layout.")
            setMessage("")
            return
        }

        const name = layoutName.trim() || `Layout ${savedLayouts.length + 1}`
        const nextLayout: SavedLayout = {
            name,
            imageIds: selected.map((image) => image.id),
            createdAt: new Date().toISOString(),
        }

        const nextLayouts = [
            nextLayout,
            ...savedLayouts.filter((layout) => layout.name.toLowerCase() !== name.toLowerCase()),
        ].slice(0, 12)

        setSavedLayouts(nextLayouts)
        writeSavedLayouts(nextLayouts)
        setLayoutName("")
        setMessage(`Layout "${name}" е запазен локално в браузъра.`)
        setError("")
    }

    const applyLayout = (layout: SavedLayout) => {
        const source = new Map<number, SlideshowImage>()

        available.forEach((image) => source.set(image.id, image))
        selected.forEach((image) => source.set(image.id, image))

        const nextSelected = layout.imageIds
            .map((id) => source.get(id))
            .filter((image): image is SlideshowImage => Boolean(image))

        setSelected(nextSelected)
        setMessage(`Layout "${layout.name}" е приложен. Натисни Запази, за да се публикува.`)
        setError("")
    }

    const deleteLayout = (layoutNameToDelete: string) => {
        const nextLayouts = savedLayouts.filter((layout) => layout.name !== layoutNameToDelete)
        setSavedLayouts(nextLayouts)
        writeSavedLayouts(nextLayouts)
        setMessage(`Layout "${layoutNameToDelete}" е изтрит.`)
        setError("")
    }

    const remove = (id: number) => {
        setSelected((current) => current.filter((image) => image.id !== id))
    }

    const removeAll = () => {
        setSelected([])
        setMessage("")
        setError("")
    }

    const moveToPosition = (id: number, rawPosition: string) => {
        const position = Number.parseInt(rawPosition, 10)
        if (Number.isNaN(position)) return

        setSelected((current) => {
            const oldIndex = current.findIndex((image) => image.id === id)
            if (oldIndex < 0) return current

            const next = [...current]
            const [item] = next.splice(oldIndex, 1)
            const newIndex = Math.max(0, Math.min(position - 1, next.length))
            next.splice(newIndex, 0, item)

            return next
        })
    }

    const moveByDrag = (sourceId: number, targetId: number) => {
        if (sourceId === targetId) return

        setSelected((current) => {
            const sourceIndex = current.findIndex((image) => image.id === sourceId)
            const targetIndex = current.findIndex((image) => image.id === targetId)

            if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return current

            const next = [...current]
            const [item] = next.splice(sourceIndex, 1)
            next.splice(targetIndex, 0, item)

            return next
        })
    }

    const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: number) => {
        setDraggedId(id)
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(id))
    }

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: number) => {
        event.preventDefault()

        const sourceId = Number(event.dataTransfer.getData("text/plain") || draggedId)
        if (!Number.isFinite(sourceId)) return

        moveByDrag(sourceId, targetId)
        setDraggedId(null)
    }

    const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        setUploadingVideo(true)
        setError("")
        setMessage("")

        try {
            const response = await apiFetch("/admin/slideshow/video", {
                method: "POST",
                body: formData,
                skipJsonContentType: true,
            })

            if (!response.ok) throw new Error(await readErrorMessage(response))

            setMessage("Intro видеото е качено. Ще се пусне веднъж преди слайдшоуто.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при качване на видео.")
        } finally {
            setUploadingVideo(false)
        }
    }

    const removeVideo = async () => {
        const confirmed = window.confirm("Да премахна ли intro видеото?")
        if (!confirmed) return

        setUploadingVideo(true)
        setError("")
        setMessage("")

        try {
            const response = await apiFetch("/admin/slideshow/video", {
                method: "DELETE",
                skipJsonContentType: true,
            })

            if (!response.ok) throw new Error(await readErrorMessage(response))

            setIntroVideoUrl(null)
            setMessage("Intro видеото е премахнато.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при премахване на видео.")
        } finally {
            setUploadingVideo(false)
        }
    }

    const save = async () => {
        setSaving(true)
        setError("")
        setMessage("")

        const rawSeconds = Number(intervalSeconds)
        const nextIntervalMs = Math.round(rawSeconds * 1000)

        if (!useDefaultInterval && (!Number.isFinite(rawSeconds) || nextIntervalMs < minIntervalMs || nextIntervalMs > maxIntervalMs)) {
            setSaving(false)
            setError(`Въведи време между ${msToSecondsLabel(minIntervalMs)} и ${msToSecondsLabel(maxIntervalMs)} секунди.`)
            return
        }

        try {
            await apiFetchJson<void>("/admin/slideshow", {
                method: "PUT",
                body: JSON.stringify({
                    imageIds: selected.map((image) => image.id),
                    useDefaultInterval,
                    intervalMs: useDefaultInterval ? null : nextIntervalMs,
                }),
            })

            setMessage("Слайдшоуто е запазено.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при запазване.")
        } finally {
            setSaving(false)
        }
    }

    const addAllDisabled = filteredAvailable.every((image) => selectedIds.has(image.id))
    const videoBusy = loading || saving || uploadingVideo

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Управление на слайдшоу</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Качи intro видео или избери снимките, реда и скоростта за началната страница.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={load} disabled={loading || saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Презареди</button>
                    <button type="button" onClick={shuffleSelected} disabled={loading || saving || selected.length < 2} className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-black text-white disabled:opacity-60">Разбъркай</button>
                    <button type="button" onClick={removeAll} disabled={loading || saving || selected.length === 0} className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-black text-white disabled:opacity-60">Премахни всички</button>
                    <button type="button" onClick={save} disabled={loading || saving} className="rounded-2xl bg-slate-950 px-5 py-2 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">{saving ? "Запазване..." : "Запази"}</button>
                </div>
            </div>

            {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {message && <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">Intro видео</h2>
                        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/60">Ако има качено видео, то се пуска веднъж и после започва слайдшоуто. Ако няма видео, слайдшоуто тръгва директно.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-5 py-2 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                            {uploadingVideo ? "Качване..." : introVideoUrl ? "Смени видео" : "Качи видео"}
                            <input type="file" accept="video/*,.mp4,.mov,.webm" disabled={videoBusy} onChange={handleVideoUpload} className="hidden" />
                        </label>

                        {introVideoUrl ? (
                            <button type="button" onClick={removeVideo} disabled={videoBusy} className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-black text-white disabled:opacity-60">Премахни видео</button>
                        ) : null}
                    </div>
                </div>

                {introVideoUrl ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-white/10">
                        <video src={resolveAssetUrl(introVideoUrl)} controls playsInline className="max-h-[420px] w-full bg-black object-contain" />
                    </div>
                ) : (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 dark:bg-black/30 dark:text-white/60">Няма качено intro видео.</div>
                )}
            </section>

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">Смяна на снимките</h2>
                        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/60">Default таймерът е {msToSecondsLabel(defaultIntervalMs)} секунди. Промяната се прилага след Запази.</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                            <input
                                type="checkbox"
                                checked={useDefaultInterval}
                                onChange={(event) => {
                                    setUseDefaultInterval(event.target.checked)
                                    if (event.target.checked) setIntervalSeconds(msToSecondsLabel(defaultIntervalMs))
                                }}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            Default
                        </label>

                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-white/80">
                            Секунди
                            <input
                                type="number"
                                min={msToSecondsLabel(minIntervalMs)}
                                max={msToSecondsLabel(maxIntervalMs)}
                                step="0.5"
                                value={intervalSeconds}
                                disabled={useDefaultInterval}
                                onChange={(event) => setIntervalSeconds(event.target.value)}
                                className="h-11 w-28 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none disabled:bg-slate-100 disabled:text-slate-400 dark:border-white/10 dark:bg-black dark:text-white dark:disabled:bg-black/30"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="rounded-3xl bg-white p-8 text-sm font-bold text-slate-500 dark:bg-zinc-900">Зареждане...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-black text-slate-950 dark:text-white">Текущ ред ({selected.length})</h2>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={shuffleSelected} disabled={selected.length < 2} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60">Разбъркай реда</button>
                                <button type="button" onClick={removeAll} disabled={selected.length === 0} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60">Премахни всички</button>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    value={layoutName}
                                    onChange={(event) => setLayoutName(event.target.value)}
                                    placeholder="Име на layout"
                                    className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none dark:border-white/10 dark:bg-black dark:text-white"
                                />
                                <button type="button" onClick={saveLayout} disabled={selected.length === 0} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">Запази layout</button>
                            </div>

                            {savedLayouts.length > 0 ? (
                                <div className="mt-3 flex flex-col gap-2">
                                    {savedLayouts.map((layout) => (
                                        <div key={layout.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-black text-slate-900 dark:text-white">{layout.name}</p>
                                                <p className="text-[11px] font-bold text-slate-400">{layout.imageIds.length} снимки</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => applyLayout(layout)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white">Приложи</button>
                                                <button type="button" onClick={() => deleteLayout(layout.name)} className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-black text-white">Изтрий</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-4 flex max-h-[70vh] flex-col gap-3 overflow-auto">
                            {selected.map((image, index) => (
                                <div
                                    key={image.id}
                                    onDragOver={handleDragOver}
                                    onDrop={(event) => handleDrop(event, image.id)}
                                    className={`flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition dark:border-white/10 dark:bg-black/30 ${draggedId === image.id ? "opacity-45 ring-2 ring-slate-400" : ""}`}
                                >
                                    <button
                                        type="button"
                                        draggable
                                        onDragStart={(event) => handleDragStart(event, image.id)}
                                        onDragEnd={() => setDraggedId(null)}
                                        className="flex h-24 w-8 shrink-0 cursor-grab items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-400 active:cursor-grabbing dark:border-white/10 dark:bg-black dark:text-white/50"
                                        title="Влачи за промяна на реда"
                                    >
                                        ⋮⋮
                                    </button>
                                    <img src={imageSrc(image)} alt={imageTitle(image)} className="h-24 w-20 rounded-xl object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-slate-400">#{index + 1}</p>
                                        <p className="truncate text-sm font-black text-slate-950 dark:text-white">{imageTitle(image)}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-white/60">{image.categoryName || "Без категория"} · {image.albumTitle || "Без албум"}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-white/70">
                                                Позиция
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={selected.length}
                                                    value={index + 1}
                                                    onChange={(event) => moveToPosition(image.id, event.target.value)}
                                                    className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white"
                                                />
                                            </label>
                                            <button type="button" onClick={() => remove(image.id)} className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-black text-white">Премахни</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-950 dark:text-white">Всички снимки</h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-white/60">Филтрирани: {filteredAvailable.length}</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Търси" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:bg-black dark:text-white" />
                                <button type="button" onClick={addAllFilteredShuffled} disabled={addAllDisabled || filteredAvailable.length === 0} className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60">Добави разбъркано</button>
                                <button type="button" onClick={addAllFiltered} disabled={addAllDisabled || filteredAvailable.length === 0} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">Добави всички</button>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-white/60">Албуми</p>
                                {selectedAlbumKeys.length > 0 && (
                                    <button type="button" onClick={() => setSelectedAlbumKeys([])} className="text-xs font-black text-slate-500 underline dark:text-white/60">Изчисти филтъра</button>
                                )}
                            </div>
                            <div className="flex max-h-40 flex-col gap-2 overflow-auto pr-1">
                                {albumOptions.map((album) => (
                                    <label key={album.key} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:bg-zinc-900 dark:text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={selectedAlbumKeys.includes(album.key)}
                                            onChange={() => toggleAlbum(album.key)}
                                            className="h-4 w-4 rounded border-slate-300"
                                        />
                                        <span className="min-w-0 flex-1 truncate">{album.title}</span>
                                        <span className="shrink-0 text-slate-400">{album.count}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-auto sm:grid-cols-2 2xl:grid-cols-3">
                            {filteredAvailable.map((image) => {
                                const isSelected = selectedIds.has(image.id)

                                return (
                                    <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-black/30">
                                        <img src={imageSrc(image)} alt={imageTitle(image)} className="aspect-[4/3] w-full object-cover" />
                                        <div className="p-3">
                                            <p className="truncate text-sm font-black text-slate-950 dark:text-white">{imageTitle(image)}</p>
                                            <p className="truncate text-xs text-slate-500 dark:text-white/60">ID {image.id} · {image.albumTitle || "Без албум"}</p>
                                            <button type="button" onClick={() => toggleSelected(image)} className={`mt-3 w-full rounded-xl px-3 py-2 text-xs font-black ${isSelected ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-black"}`}>{isSelected ? "Добавена" : "+ Добави"}</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
