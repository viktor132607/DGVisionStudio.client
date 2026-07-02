import { useEffect, useMemo, useState, type FormEvent } from "react"
import { apiFetchJson } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"

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
}

type SlideshowResponse = {
    availableImages?: SlideshowImage[]
}

const emptyForm: ServiceForm = {
    title: "",
    shortDescription: "",
    description: "",
    coverImageUrl: "",
    isActive: true,
}

const imageTitle = (image: SlideshowImage) => image.caption || image.altText || image.albumTitle || `Снимка #${image.id}`
const imagePath = (image: SlideshowImage) => image.thumbnailUrl || image.imageUrl || ""

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceItem[]>([])
    const [availableImages, setAvailableImages] = useState<SlideshowImage[]>([])
    const [form, setForm] = useState<ServiceForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
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

    const imageOptions = useMemo(() => {
        const map = new Map<string, SlideshowImage>()

        availableImages.forEach((image) => {
            const path = imagePath(image)
            if (path && !map.has(path)) map.set(path, image)
        })

        return [...map.values()].sort((a, b) => imageTitle(a).localeCompare(imageTitle(b), "bg"))
    }, [availableImages])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const startEdit = (service: ServiceItem) => {
        setEditingId(service.id)
        setForm({
            title: service.title || "",
            shortDescription: service.shortDescription || "",
            description: service.description || "",
            coverImageUrl: service.coverImageUrl || "",
            isActive: service.isActive,
        })
        setMessage("")
        setError("")
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

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Снимка от портфолиото
                            <select value={form.coverImageUrl} onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white">
                                <option value="">Без избрана снимка</option>
                                {imageOptions.map((image) => {
                                    const path = imagePath(image)
                                    return <option key={`${image.id}-${path}`} value={path}>{imageTitle(image)}</option>
                                })}
                            </select>
                        </label>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Или ръчен URL/път към снимка
                            <input value={form.coverImageUrl} onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="/images/... или /uploads/..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        {form.coverImageUrl ? (
                            <img src={resolveAssetUrl(form.coverImageUrl)} alt="Преглед" className="aspect-[4/3] w-full rounded-2xl object-cover" />
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
                                    <img src={resolveAssetUrl(service.coverImageUrl || "/og-cover.jpg")} alt={service.title} className="aspect-[4/5] w-24 rounded-xl object-cover" />

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
