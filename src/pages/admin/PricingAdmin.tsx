import { useEffect, useMemo, useState, type FormEvent } from "react"
import { apiFetchJson } from "../../services/api"

type PricingMode = "Fixed" | "Negotiable"

type PricingItem = {
    id: number
    title: string
    description: string
    pricingMode: PricingMode
    priceText?: string | null
    displayOrder: number
    isActive: boolean
    createdAtUtc?: string
}

type PricingForm = {
    title: string
    description: string
    pricingMode: PricingMode
    priceText: string
    isActive: boolean
}

const emptyForm: PricingForm = {
    title: "",
    description: "",
    pricingMode: "Fixed",
    priceText: "",
    isActive: true,
}

function normalizePricingMode(value?: string | null): PricingMode {
    return value === "Negotiable" ? "Negotiable" : "Fixed"
}

function displayPrice(item: PricingItem) {
    return item.pricingMode === "Negotiable" ? "По договаряне" : item.priceText || "-"
}

export default function PricingAdmin() {
    const [items, setItems] = useState<PricingItem[]>([])
    const [form, setForm] = useState<PricingForm>(emptyForm)
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
            const data = await apiFetchJson<PricingItem[]>("/admin/pricing", {
                method: "GET",
                skipJsonContentType: true,
            })

            setItems(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при зареждане.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const sortedItems = useMemo(() => {
        return [...items].sort(
            (a, b) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                (a.id ?? 0) - (b.id ?? 0)
        )
    }, [items])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const startEdit = (item: PricingItem) => {
        setEditingId(item.id)
        setForm({
            title: item.title || "",
            description: item.description || "",
            pricingMode: normalizePricingMode(item.pricingMode),
            priceText: item.priceText || "",
            isActive: item.isActive,
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
            description: form.description.trim(),
            pricingMode: form.pricingMode,
            priceText: form.pricingMode === "Negotiable" ? null : form.priceText.trim(),
            isActive: form.isActive,
        }

        try {
            if (editingId) {
                await apiFetchJson<PricingItem>(`/admin/pricing/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
                setMessage("Цената е обновена.")
            } else {
                await apiFetchJson<PricingItem>("/admin/pricing", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })
                setMessage("Цената е добавена.")
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
        const confirmed = window.confirm("Да изтрия ли тази цена?")
        if (!confirmed) return

        setSaving(true)
        setError("")
        setMessage("")

        try {
            await apiFetchJson<void>(`/admin/pricing/${id}`, {
                method: "DELETE",
            })

            if (editingId === id) resetForm()
            setMessage("Цената е изтрита.")
            await load()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Грешка при изтриване.")
        } finally {
            setSaving(false)
        }
    }

    const reorder = async (sourceIndex: number, targetIndex: number) => {
        if (sourceIndex === targetIndex) return

        const next = [...sortedItems]
        const [item] = next.splice(sourceIndex, 1)
        next.splice(targetIndex, 0, item)

        setItems(next.map((pricingItem, index) => ({ ...pricingItem, displayOrder: index + 1 })))
        setError("")
        setMessage("")

        try {
            const saved = await apiFetchJson<PricingItem[]>("/admin/pricing/reorder", {
                method: "PUT",
                body: JSON.stringify({ ids: next.map((pricingItem) => pricingItem.id) }),
            })

            setItems(Array.isArray(saved) ? saved : next)
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
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Ценоразпис</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Добавяне, редакция, триене и подреждане на цените.</p>
                </div>

                <button type="button" onClick={load} disabled={loading || saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
                    Презареди
                </button>
            </div>

            {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {message && <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
                <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">{editingId ? "Редакция" : "Нова цена"}</h2>
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
                            Описание
                            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                        </label>

                        <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                            Тип цена
                            <select value={form.pricingMode} onChange={(event) => setForm((current) => ({ ...current, pricingMode: normalizePricingMode(event.target.value) }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white">
                                <option value="Fixed">Фиксирана цена</option>
                                <option value="Negotiable">По договаряне</option>
                            </select>
                        </label>

                        {form.pricingMode === "Fixed" ? (
                            <label className="block text-sm font-black text-slate-700 dark:text-white/80">
                                Цена
                                <input value={form.priceText} onChange={(event) => setForm((current) => ({ ...current, priceText: event.target.value }))} placeholder="От 60 € / час" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500 dark:border-white/10 dark:bg-black dark:text-white" />
                            </label>
                        ) : null}

                        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 dark:bg-black/30 dark:text-white/80">
                            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-5 w-5" />
                            Видима на сайта
                        </label>

                        <button type="submit" disabled={saving} className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-black">
                            {saving ? "Запазване..." : editingId ? "Запази промените" : "Добави цена"}
                        </button>
                    </div>
                </form>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">Текущи цени ({sortedItems.length})</h2>
                        <p className="text-xs font-bold text-slate-500 dark:text-white/60">Редът се пази автоматично при местене.</p>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500 dark:bg-black/30">Зареждане...</div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sortedItems.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-white/70">#{index + 1}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-black ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{item.isActive ? "Видима" : "Скрита"}</span>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 dark:bg-zinc-900 dark:text-white/70">{displayPrice(item)}</span>
                                        </div>
                                        <h3 className="mt-2 truncate text-base font-black text-slate-950 dark:text-white">{item.title}</h3>
                                        <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-slate-600 dark:text-white/65">{item.description}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                                        <button type="button" onClick={() => reorder(index, Math.max(0, index - 1))} disabled={index === 0 || saving} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Нагоре</button>
                                        <button type="button" onClick={() => reorder(index, Math.min(sortedItems.length - 1, index + 1))} disabled={index === sortedItems.length - 1 || saving} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Надолу</button>
                                        <button type="button" onClick={() => startEdit(item)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-black">Редакция</button>
                                        <button type="button" onClick={() => remove(item.id)} disabled={saving} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-45">Изтрий</button>
                                    </div>
                                </div>
                            ))}

                            {sortedItems.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500 dark:bg-black/30">Няма добавени цени.</div>
                            ) : null}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
