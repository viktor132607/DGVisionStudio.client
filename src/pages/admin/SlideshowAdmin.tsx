import { useEffect, useMemo, useState, type DragEvent } from "react"
import { apiFetchJson } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"

type SlideshowImage = {
    id: number
    imageUrl: string
    thumbnailUrl?: string | null
    caption?: string | null
    altText?: string | null
    albumTitle?: string | null
    categoryName?: string | null
}

type SlideshowResponse = {
    selectedImages?: SlideshowImage[]
    availableImages?: SlideshowImage[]
}

const imageSrc = (image: SlideshowImage) => resolveAssetUrl(image.thumbnailUrl || image.imageUrl || "")
const imageTitle = (image: SlideshowImage) => image.caption || image.altText || image.albumTitle || `Снимка #${image.id}`

export default function SlideshowAdmin() {
    const [selected, setSelected] = useState<SlideshowImage[]>([])
    const [available, setAvailable] = useState<SlideshowImage[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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

            setSelected(Array.isArray(data.selectedImages) ? data.selectedImages : [])
            setAvailable(Array.isArray(data.availableImages) ? data.availableImages : [])
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

    const filteredAvailable = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return available

        return available.filter((image) =>
            String(image.id).includes(term) ||
            image.caption?.toLowerCase().includes(term) ||
            image.altText?.toLowerCase().includes(term) ||
            image.albumTitle?.toLowerCase().includes(term) ||
            image.categoryName?.toLowerCase().includes(term)
        )
    }, [available, search])

    const add = (image: SlideshowImage) => {
        setSelected((current) => current.some((item) => item.id === image.id) ? current : [...current, image])
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

    const save = async () => {
        setSaving(true)
        setError("")
        setMessage("")

        try {
            await apiFetchJson<void>("/admin/slideshow", {
                method: "PUT",
                body: JSON.stringify({ imageIds: selected.map((image) => image.id) }),
            })

            setMessage("Слайдшоуто е запазено.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при запазване.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Управление на слайдшоу</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Избери снимките и реда за началната страница.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={load} disabled={loading || saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Презареди</button>
                    <button type="button" onClick={removeAll} disabled={loading || saving || selected.length === 0} className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-black text-white disabled:opacity-60">Премахни всички</button>
                    <button type="button" onClick={save} disabled={loading || saving} className="rounded-2xl bg-slate-950 px-5 py-2 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">{saving ? "Запазване..." : "Запази"}</button>
                </div>
            </div>

            {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {message && <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

            {loading ? (
                <div className="rounded-3xl bg-white p-8 text-sm font-bold text-slate-500 dark:bg-zinc-900">Зареждане...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-black text-slate-950 dark:text-white">Текущ ред ({selected.length})</h2>
                            <button type="button" onClick={removeAll} disabled={selected.length === 0} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60">Премахни всички</button>
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
                            <h2 className="text-lg font-black text-slate-950 dark:text-white">Всички снимки</h2>
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Търси" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:bg-black dark:text-white" />
                        </div>

                        <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-auto sm:grid-cols-2 2xl:grid-cols-3">
                            {filteredAvailable.map((image) => {
                                const isSelected = selectedIds.has(image.id)

                                return (
                                    <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-black/30">
                                        <img src={imageSrc(image)} alt={imageTitle(image)} className="aspect-[4/3] w-full object-cover" />
                                        <div className="p-3">
                                            <p className="truncate text-sm font-black text-slate-950 dark:text-white">{imageTitle(image)}</p>
                                            <p className="truncate text-xs text-slate-500 dark:text-white/60">ID {image.id} · {image.albumTitle || "Без албум"}</p>
                                            <button type="button" onClick={() => add(image)} disabled={isSelected} className="mt-3 w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white disabled:bg-emerald-100 disabled:text-emerald-700 dark:bg-white dark:text-black">{isSelected ? "Добавена" : "+ Добави"}</button>
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
