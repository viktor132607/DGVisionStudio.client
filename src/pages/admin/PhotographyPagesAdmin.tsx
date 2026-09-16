import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { apiFetchJson } from "../../services/api"
import { invalidatePhotographyPages, type PhotographyPage } from "../../hooks/usePhotographyPages"
import { servicePath } from "../../seo/photography"

type Category = { id: number; name: string; isActive: boolean }
const blank: PhotographyPage = { id: 0, slug: "", title: "", titleEn: "", description: "", descriptionEn: "", body: "", bodyEn: "", preparation: "", preparationEn: "", portfolioCategoryId: null, displayOrder: 0, isActive: true }
const control = "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
const button = "rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-zinc-700"

export default function PhotographyPagesAdmin() {
  const [pages, setPages] = useState<PhotographyPage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [draft, setDraft] = useState<PhotographyPage | null>(null)
  const [language, setLanguage] = useState<"bg" | "en">("bg")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [deleting, setDeleting] = useState<PhotographyPage | null>(null)
  async function load() {
    const [items, categoryItems] = await Promise.all([
      apiFetchJson<PhotographyPage[]>("/admin/photography-pages"),
      apiFetchJson<Category[]>("/admin/portfolio/categories"),
    ])
    setPages(items); setCategories(categoryItems)
  }
  useEffect(() => {
    let active = true
    Promise.all([apiFetchJson<PhotographyPage[]>("/admin/photography-pages"), apiFetchJson<Category[]>("/admin/portfolio/categories")])
      .then(([items, categoryItems]) => { if (active) { setPages(items); setCategories(categoryItems) } })
      .catch(e => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  async function mutate(action: () => Promise<unknown>, message: string) {
    setBusy(true); setError(""); setNotice("")
    try {
      await action()
      setDraft(null); setDeleting(null); setNotice(message)
      await load()
      await invalidatePhotographyPages()
    } catch (e) { setError(e instanceof Error ? e.message : "Възникна грешка.") }
    finally { setBusy(false) }
  }
  function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    if (!draft.title.trim()) { setLanguage("bg"); setError("Въведи заглавие на български."); return }
    void mutate(() => apiFetchJson(`/admin/photography-pages${draft.id ? `/${draft.id}` : ""}`, {
      method: draft.id ? "PUT" : "POST", body: JSON.stringify(draft),
    }), "Страницата е запазена.")
  }
  function change<K extends keyof PhotographyPage>(key: K, value: PhotographyPage[K]) {
    setDraft(previous => previous ? { ...previous, [key]: value } : previous)
  }
  const overview = Boolean(draft?.id && pages.find(page => page.id === draft.id)?.slug === "")
  const fields = language === "bg"
    ? [{ key: "title", label: "Заглавие", max: 200 }, { key: "description", label: "Кратко описание", max: 2000 }, { key: "body", label: "Съдържание (отделяй абзаците с празен ред)", max: 30000 }, { key: "preparation", label: "Подготовка за запитване (по един елемент на ред)", max: 10000 }] as const
    : [{ key: "titleEn", label: "Заглавие EN", max: 200 }, { key: "descriptionEn", label: "Кратко описание EN", max: 2000 }, { key: "bodyEn", label: "Съдържание EN (отделяй абзаците с празен ред)", max: 30000 }, { key: "preparationEn", label: "Подготовка за запитване EN (по един елемент на ред)", max: 10000 }] as const
  return <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Страници услуги</h1>
      {!draft && <button className={`${button} bg-neutral-950 text-white dark:bg-white dark:text-black`} disabled={loading || busy} onClick={() => { setDraft({ ...blank, displayOrder: pages.length }); setLanguage("bg"); setNotice("") }}>Добави услуга</button>}
    </div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}
      {!draft && <button className="ml-3 underline" disabled={busy} onClick={() => { setError(""); void load().catch(e => setError(e.message)) }}>Опитай отново</button>}
    </div>}
    {notice && <p role="status" className="mb-4 text-green-700 dark:text-green-300">{notice}</p>}
    {loading ? <p role="status">Зареждане…</p> : draft ? <form onSubmit={save} className="space-y-6">
      <fieldset disabled={busy} className="space-y-6">
        <div className="flex gap-2" aria-label="Език на съдържанието">
          <button type="button" className={`${button} ${language === "bg" ? "bg-neutral-100 dark:bg-zinc-700" : ""}`} aria-pressed={language === "bg"} onClick={() => setLanguage("bg")}>Български</button>
          <button type="button" className={`${button} ${language === "en" ? "bg-neutral-100 dark:bg-zinc-700" : ""}`} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
        </div>
        {fields.map(field => <label key={field.key} className="block text-sm font-medium">{field.label}
          {field.key.startsWith("title") ? <input className={control} value={draft[field.key]} required={field.key === "title"} maxLength={field.max} onChange={e => change(field.key, e.target.value)} />
            : <textarea className={control} rows={field.key.startsWith("body") ? 9 : 3} maxLength={field.max} value={draft[field.key]} onChange={e => change(field.key, e.target.value)} />}
        </label>)}
        {language === "en" && <p className="text-sm text-neutral-500">При празно поле се показва българският текст.</p>}
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium">Адрес: /fotograf-ruse/{overview ? "" : "…"}
            <input className={control} value={draft.slug} disabled={overview} required={!overview} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={150} onChange={e => change("slug", e.target.value.toLowerCase())} />
          </label>
          {!overview && <label className="text-sm font-medium">Категория за портфолио албумите
            <select className={control} value={draft.portfolioCategoryId ?? ""} onChange={e => change("portfolioCategoryId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Без категория</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (неактивна)"}</option>)}
            </select>
          </label>}
          <label className="text-sm font-medium">Подредба
            <input type="number" className={control} min={0} max={10000} required value={draft.displayOrder} onChange={e => change("displayOrder", Number(e.target.value))} />
          </label>
          {!overview && <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={draft.isActive} onChange={e => change("isActive", e.target.checked)} />Активна страница</label>}
        </div>
        <div className="flex gap-3"><button type="submit" className={`${button} bg-neutral-950 text-white dark:bg-white dark:text-black`}>{busy ? "Запазване…" : "Запази"}</button>
          <button type="button" className={button} onClick={() => setDraft(null)}>Отказ</button></div>
      </fieldset>
    </form> : <div className="divide-y divide-neutral-200 dark:divide-zinc-800">{pages.map(page => <div key={page.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0"><h2 className="font-semibold">{page.title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{page.slug ? `${page.isActive ? "Активна" : "Неактивна"} · ${categories.find(c => c.id === page.portfolioCategoryId)?.name || "Без категория"}` : "Обща страница на услугите"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {page.isActive && <Link to={servicePath(page)} className={button} target="_blank" rel="noreferrer">Преглед</Link>}
        <button className={button} disabled={busy} onClick={() => { setDraft({ ...page }); setLanguage("bg"); setNotice("") }}>Редактирай</button>
        {page.slug && <><button className={button} disabled={busy} onClick={() => void mutate(() => apiFetchJson(`/admin/photography-pages/${page.id}`, { method: "PUT", body: JSON.stringify({ ...page, isActive: !page.isActive }) }), page.isActive ? "Услугата е деактивирана." : "Услугата е активирана.")}>{page.isActive ? "Деактивирай" : "Активирай"}</button>
          <button className={`${button} text-red-600`} disabled={busy} onClick={() => setDeleting(page)}>Изтрий</button></>}
      </div>
    </div>)}</div>}
    <ConfirmDialog open={Boolean(deleting)} title="Изтриване на услуга" description={`Да изтрия ли „${deleting?.title ?? ""}“? Албумите и категорията ще бъдат запазени.`} confirmText="Изтрий" busy={busy} onCancel={() => setDeleting(null)}
      onConfirm={() => { if (deleting) void mutate(() => apiFetchJson(`/admin/photography-pages/${deleting.id}`, { method: "DELETE" }), "Услугата е изтрита.") }} />
  </section>
}
