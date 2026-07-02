import { useEffect, useMemo, useState, type FormEvent } from "react"
import { apiFetchJson } from "../../services/api"

type ServiceItem = {
    id: number
    title: string
    shortDescription?: string | null
    description?: string | null
    coverImageUrl?: string | null
    displayOrder: number
    isActive: boolean
    createdAtUtc?: string
}

type ServiceForm = {
    title: string
    shortDescription: string
    description: string
    coverImageUrl: string
    isActive: boolean
}

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
    availableImages?: SlideshowImage[]
}

type AlbumOption = {
    key: string
    title: string
    category?: string | null
    count: number
}

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "")

const emptyForm: ServiceForm = {
    title: "",
    shortDescription: "",
    description: "",
    coverImageUrl: "",
    isActive: true,
}

const imageTitle = (image: SlideshowImage) => image.caption || image.altText || image.albumTitle || `Снимка #${image.id}`
const imagePath = (image: SlideshowImage) => image.thumbnailUrl || image.imageUrl || ""
const albumKey = (image: SlideshowImage) => String(image.portfolioAlbumId ?? image.albumTitle ?? "no-album")

function resolveServiceAssetUrl(url?: string | null): string {
    const trimmed = (url || "").trim()
    if (!trimmed) return ""
    if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed
    if (trimmed.startsWith("/images/") || trimmed.startsWith("/uploads/")) return `${API_ROOT}${trimmed}`
    if (trimmed.startsWith("images/") || trimmed.startsWith("uploads/")) return `${API_ROOT}/${trimmed}`
    if (trimmed.startsWith("/")) return `${API_ROOT}${trimmed}`
    return `${API_ROOT}/${trimmed}`
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceItem[]>([])
    const [availableImages, setAvailableImages] = useState<SlideshowImage[]>([])
    const [form, setForm] = useState<ServiceForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [selectedAlbumKey, setSelectedAlbumKey] = useState("")
    const [imageSearch, setImageSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const load = async () => {
        setLoading(true)
        setError("")
        setMessage("")

        try {
            const [serviceData, slideshowData] = await Promise.all([
                apiFetchJson<ServiceItem[]>("/admin/services", {
                    method: "GET",
                    skipJsonContentType: true,
                }),
                apiFetchJson<SlideshowResponse>("/admin/slideshow", {
                    method: "GET",
                    skipJsonContentType: true,
                }).catch(() => ({ availableImages: [] })),
            ])

            setServices(Array.isArray(serviceData) ? serviceData : [])
            setAvailableImages(Array.isArray(slideshowData.availableImages) ? slideshowData.availableImages : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при зареждане.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const sortedServices = useMemo(() => {
        return [...services].sort(
            (a, b) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                (a.id ?? 0) - (b.id ?? 0)
        )
    }, [services])

    const albumOptions = useMemo<AlbumOption[]>(() => {
        const map = new Map<string, AlbumOption>()

        availableImages.forEach((image) => {
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

        return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, "bg") || a.key.localeCompare(b.key))
    }, [availableImages])

    const filteredImages = useMemo(() => {
        const term = imageSearch.trim().toLowerCase()
        const map = new Map<string, SlideshowImage>()

        availableImages.forEach((image) => {
            const path = imagePath(image)
            if (!path || map.has(path)) return
            if (selectedAlbumKey && albumKey(image) !== selectedAlbumKey) return

            if (term) {
                const matches =
                    String(image.id).includes(term) ||
                    imageTitle(image).toLowerCase().includes(term) ||
                    image.albumTitle?.toLowerCase().includes(term) ||
                    image.categoryName?.toLowerCase().includes(term)

                if (!matches) return
            }

            map.set(path, image)
        })

        return [...map.values()]
    }, [availableImages, selectedAlbumKey, imageSearch])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setSelectedAlbumKey("")
        setImageSearch("")
    }

    const startEdit = (service: ServiceItem) => {
        const coverImageUrl = service.coverImageUrl || ""
        const currentImage = availableImages.find((image) => imagePath(image) === coverImageUrl)

        setEditingId(service.id)
        setForm({
            title: service.title || "",
            shortDescription: service.shortDescription || "",
            description: service.description || "",
            coverImageUrl,
            isActive: service.isActive,
        })
        setSelectedAlbumKey(currentImage ? albumKey(currentImage) : "")
        setImageSearch("")
        setMessage("")
        setError("")
    }

    const selectImage = (image: SlideshowImage) => {
        const path = imagePath(image)
        setForm((current) => ({ ...current, coverImageUrl: path }))
    }

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)
        setError("")
        setMessage("")

        const payload = {
            title: form.title.trim(),
            shortDescription: form.shortDescription.trim() || null,
            description: form.description.trim(),
            coverImageUrl: form.coverImageUrl.trim() || null,
            isActive: form.isActive,
        }

        try {
            if (editingId) {
                await apiFetchJson<ServiceItem>(`/admin/services/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
                setMessage("Услугата е обновена.")
            } else {
                await apiFetchJson<ServiceItem>("/admin/services", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })
                setMessage("Услугата е добавена.")
            }

            resetForm()
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при запазване.")
        } finally {
            setSaving(false)
        }
    }

    const remove = async (id: number) => {
        const confirmed = window.confirm("Да изтрия ли тази услуга?")
        if (!confirmed) return

        setSaving(true)
        setError("")
        setMessage("")

        try {
            await apiFetchJson<void>(`/admin/services/${id}`, {
                method: "DELETE",
            })

            if (editingId === id) resetForm()
            setMessage("Услугата е изтрита.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при изтриване.")
        } finally {
            setSaving(false)
        }
    }

    const reorder = async (sourceIndex: number, targetIndex: number) => {
        if (sourceIndex === targetIndex) return

        const next = [...sortedServices]
        const [item] = next.splice(sourceIndex, 1)
        next.splice(targetIndex, 0, item)

        setServices(next.map((service, index) => ({ ...service, displayOrder: index + 1 })))
        setError("")
        setMessage("")

        try {
            const saved = await apiFetchJson<ServiceItem[]>("/admin/services/reorder", {
                method: "PUT",
                body: JSON.stringify({ ids: next.map((service) => service.id) }),
            })

            setServices(Array.isArray(saved) ? saved : next)
            setMessage("Редът е запазен.")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при пренареждане.")
            await load()
        }
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Услуги за началния екран</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Добавяне, редакция, триене и подреждане на картите в секцията „Услуги“.</p>
                </div>

                <button type="button" onClick={load} disabled={loading || saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
                    Презареди
                </button>
            </div>

            {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {message && <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
                <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">{editingId ? "Редакция" : "Нова услуга"}</h2>
                        {editingId ? (
                            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 dark:border-white/10 dark:text-white/70">Откажи</button>
                        ) : null}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Заглавие
                            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Кратък текст
                            <textarea value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Описание
                            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/30">
                            <div className="mb-3">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white">Избор на снимка от албум</h3>
                                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-white/55">Избери албум, после натисни една снимка за картата.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <label className="block text-xs font-black text-slate-600 dark:text-white/70">
                                    Албум
                                    <select value={selectedAlbumKey} onChange={(event) => setSelectedAlbumKey(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white">
                                        <option value="">Всички албуми</option>
                                        {albumOptions.map((album) => (
                                            <option key={album.key} value={album.key}>
                                                {album.category ? `${album.category} · ` : ""}{album.title} ({album.count})
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-xs font-black text-slate-600 dark:text-white/70">
                                    Търсене
                                    <input value={imageSearch} onChange={(event) => setImageSearch(event.target.value)} placeholder="Търси снимка/албум" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                                </label>
                            </div>

                            <div className="mt-4 grid max-h-96 grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 2xl:grid-cols-4">
                                {filteredImages.map((image) => {
                                    const path = imagePath(image)
                                    const isSelected = form.coverImageUrl === path

                                    return (
                                        <button
                                            key={`${image.id}-${path}`}
                                            type="button"
                                            onClick={() => selectImage(image)}
                                            className={`overflow-hidden rounded-2xl border bg-white text-left transition dark:bg-zinc-900 ${isSelected ? "border-slate-950 ring-2 ring-slate-950 dark:border-white dark:ring-white" : "border-slate-200 hover:border-slate-500 dark:border-white/10 dark:hover:border-white/60"}`}
                                        >
                                            <img src={resolveServiceAssetUrl(path)} alt={imageTitle(image)} className="aspect-[4/3] w-full object-cover" />
                                            <span className="block truncate px-3 py-2 text-xs font-black text-slate-700 dark:text-white/75">
                                                {imageTitle(image)}
                                            </span>
                                        </button>
                                    )
                                })}

                                {filteredImages.length === 0 ? (
                                    <div className="col-span-full rounded-2xl bg-white p-5 text-center text-sm font-bold text-slate-500 dark:bg-zinc-900 dark:text-white/60">Няма снимки за този филтър.</div>
                                ) : null}
                            </div>
                        </div>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Ръчен URL/път към снимка
                            <input value={form.coverImageUrl} onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="/images/... или /uploads/..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        {form.coverImageUrl ? (
                            <img src={resolveServiceAssetUrl(form.coverImageUrl)} alt="Преглед" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                        ) : null}

                        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 dark:bg-black/30 dark:text-white/80">
                            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-5 w-5" />
                            Видима на сайта
                        </label>

                        <button type="submit" disabled={saving} className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">
                            {saving ? "Запазване..." : editingId ? "Запази промените" : "Добави услуга"}
                        </button>
                    </div>
                </form>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">Текущи карти ({sortedServices.length})</h2>
                        <p className="text-xs font-bold text-slate-500 dark:text-white/60">Редът се пази автоматично при местене.</p>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500 dark:bg-black/30">Зареждане...</div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sortedServices.map((service, index) => (
                                <div key={service.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30 md:grid-cols-[96px_minmax(0,1fr)_auto]">
                                    <img src={resolveServiceAssetUrl(service.coverImageUrl || "/og-cover.jpg")} alt={service.title} className="aspect-[4/5] w-24 rounded-xl object-cover" />

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-white/70">#{index + 1}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-black ${service.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{service.isActive ? "Видима" : "Скрита"}</span>
                                        </div>
                                        <h3 className="mt-2 truncate text-base font-black text-slate-950 dark:text-white">{service.title}</h3>
                                        <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-slate-600 dark:text-white/65">{service.shortDescription || service.description || "Без описание"}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                                        <button type="button" onClick={() => reorder(index, Math.max(0, index - 1))} disabled={index === 0 || saving} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Нагоре</button>
                                        <button type="button" onClick={() => reorder(index, Math.min(sortedServices.length - 1, index + 1))} disabled={index === sortedServices.length - 1 || saving} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Надолу</button>
                                        <button type="button" onClick={() => startEdit(service)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-black">Редакция</button>
                                        <button type="button" onClick={() => remove(service.id)} disabled={saving} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-45">Изтрий</button>
                                    </div>
                                </div>
                            ))}

                            {sortedServices.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500 dark:bg-black/30">Няма добавени услуги.</div>
                            ) : null}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
