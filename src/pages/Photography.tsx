import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import PhotographyContent from "../components/PhotographyContent"
import Seo from "../components/Seo"
import { hubPath, photographySchema, servicePath } from "../seo/photography"
import { pageCopy, usePhotographyPages } from "../hooks/usePhotographyPages"
import NotFound from "./NotFound"

export default function Photography() {
  const { i18n } = useTranslation()
  const language = i18n.language?.startsWith("en") ? "en" : "bg"
  const { serviceSlug } = useParams()
  const { pages, loading, error, refresh } = usePhotographyPages()
  if (loading) return <div role="status" className="mx-auto max-w-6xl p-10">{language === "bg" ? "Зареждане…" : "Loading…"}</div>
  if (error) return <div role="alert" className="mx-auto max-w-6xl p-10">
    <p>{language === "bg" ? "Услугите не могат да се заредят в момента." : "Services could not be loaded."}</p>
    <button className="mt-4 underline" onClick={() => void refresh()}>{language === "bg" ? "Опитай отново" : "Retry"}</button>
  </div>
  const page = pages.find(item => item.slug === (serviceSlug ?? "") && item.isActive)
  if (!page) return <NotFound />
  const copy = pageCopy(page, language)
  const schemaService = page.slug ? { slug: page.slug, bg: pageCopy(page, "bg"), en: pageCopy(page, "en") } : undefined
  return <>
    <Seo title={copy.title} description={copy.description} canonical={page.slug ? servicePath(page) : hubPath}
      jsonLd={photographySchema(language, schemaService, copy.title)} />
    <PhotographyContent key={page.id} language={language} page={page} pages={pages} />
  </>
}
