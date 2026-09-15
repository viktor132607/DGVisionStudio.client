import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import PhotographyContent from "../components/PhotographyContent"
import Seo from "../components/Seo"
import { homeMetadata, hubPath, photographySchema, photographyServices, servicePath } from "../seo/photography"
import NotFound from "./NotFound"

export default function Photography() {
  const { i18n } = useTranslation()
  const language = i18n.language?.startsWith("en") ? "en" : "bg"
  const { serviceSlug } = useParams()
  const service = photographyServices.find((item) => item.slug === serviceSlug)
  if (serviceSlug && !service) return <NotFound />
  const metadata = service ? service[language] : { ...homeMetadata[language], title: language === "bg" ? "Фотографски услуги в Русе" : "Photography services in Ruse" }
  return <>
    <Seo title={metadata.title} description={metadata.description} canonical={service ? servicePath(service) : hubPath} jsonLd={photographySchema(language, service)} />
    <PhotographyContent language={language} service={service} />
  </>
}
