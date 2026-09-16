import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { hubPath, servicePath, type Language } from "../seo/photography"
import { pageCopy, type PhotographyPage } from "../hooks/usePhotographyPages"
import { apiFetchJson } from "../services/api"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"

type AlbumPreview = { id: number; slug: string; title: string; titleEn?: string; coverImageUrl?: string }

function AlbumPreviews({ page, language }: { page: PhotographyPage; language: Language }) {
  const [albums, setAlbums] = useState<AlbumPreview[]>([])
  const [status, setStatus] = useState("loading")
  const [attempt, setAttempt] = useState(0)
  const bg = language === "bg"
  useEffect(() => {
    const controller = new AbortController()
    apiFetchJson<AlbumPreview[]>(`/photography-pages/${encodeURIComponent(page.slug)}/albums`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setAlbums(data); setStatus("ready") } })
      .catch(() => { if (!controller.signal.aborted) setStatus("error") })
    return () => controller.abort()
  }, [page.slug, page.portfolioCategoryId, attempt])
  if (status === "ready" && !albums.length) return null
  return <section className="my-12">
    <h2 className="mb-6 text-2xl font-semibold">{bg ? "От нашето портфолио" : "From our portfolio"}</h2>
    {status === "loading" && <p role="status">{bg ? "Зареждане на албумите…" : "Loading albums…"}</p>}
    {status === "error" && <p role="alert">{bg ? "Албумите не могат да се заредят. " : "Could not load albums. "}
      <button className="underline" onClick={() => { setStatus("loading"); setAttempt(x => x + 1) }}>{bg ? "Опитай отново" : "Retry"}</button></p>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{albums.map(album => <Link key={album.id} to={`/portfolio/${encodeURIComponent(album.slug)}`} className="group overflow-hidden rounded-2xl border border-neutral-200 dark:border-zinc-800">
      {album.coverImageUrl && <img src={resolveAssetUrl(album.coverImageUrl)} alt={bg ? album.title : album.titleEn || album.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />}
      <h3 className="p-4 font-semibold">{bg ? album.title : album.titleEn || album.title}</h3>
    </Link>)}</div>
  </section>
}

export default function PhotographyContent({ language, page, pages }: { language: Language; page: PhotographyPage; pages: PhotographyPage[] }) {
  const bg = language === "bg"
  const copy = pageCopy(page, language)
  const services = pages.filter(item => item.slug && item.id !== page.id && item.isActive)
  return <article className="mx-auto max-w-6xl px-4 py-12 text-slate-900 dark:text-white sm:px-6 sm:py-16">
    {page.slug && <nav className="mb-8 flex gap-3 text-sm" aria-label={bg ? "Път до страницата" : "Breadcrumb"}>
      <Link to="/" className="underline">{bg ? "Начало" : "Home"}</Link><span>/</span>
      <Link to={hubPath} className="underline">{bg ? "Услуги" : "Services"}</Link>
    </nav>}
    <h1 className="max-w-4xl text-3xl font-bold sm:text-4xl">{copy.title}</h1>
    {copy.description && <p className="my-6 max-w-3xl leading-8 text-slate-600 dark:text-zinc-300">{copy.description}</p>}
    <div className="my-6 max-w-3xl space-y-5 leading-8 text-slate-600 dark:text-zinc-300">
      {copy.paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
    </div>
    {copy.preparation.length > 0 && <section className="my-8 rounded-2xl border border-neutral-200 p-6 dark:border-zinc-800">
      <h2 className="text-xl font-semibold">{bg ? "Какво да включите в запитването" : "What to include in your enquiry"}</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5">{copy.preparation.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </section>}
    {page.slug && page.portfolioCategoryId != null && <AlbumPreviews key={`${page.slug}:${page.portfolioCategoryId}`} page={page} language={language} />}
    {services.length > 0 && <section className="mt-8">
      {page.slug && <h2 className="mb-6 text-2xl font-semibold">{bg ? "Други услуги" : "Other services"}</h2>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(service => <li key={service.id}>
        <Link to={servicePath(service)} className="block h-full rounded-2xl border border-slate-200 p-5 transition hover:border-slate-600 dark:border-zinc-700 dark:hover:border-white">
          <h3 className="text-lg font-semibold">{pageCopy(service, language).title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-300">{pageCopy(service, language).description}</p>
        </Link>
      </li>)}</ul>
    </section>}
    <div className="mt-8 flex flex-wrap gap-6 font-semibold underline underline-offset-4">
      <Link to="/portfolio">{bg ? "Разгледайте портфолиото" : "Explore our portfolio"}</Link>
      <Link to="/pricing">{bg ? "Цени за фотография" : "Photography pricing"}</Link>
      <Link to="/contact">{bg ? "Запитване за фотосесия" : "Photoshoot enquiry"}</Link>
    </div>
  </article>
}
