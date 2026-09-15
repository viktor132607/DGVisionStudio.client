import { Helmet } from "react-helmet-async"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SITE_NAME, SITE_URL, DEFAULT_IMAGE } from "../seo/photography"

type SeoProps = {
  title: string
  description: string
  canonical?: string
  image?: string
  type?: "website" | "article"
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  language?: "bg" | "en"
  children?: ReactNode
}


function toAbsoluteUrl(value?: string) {
  if (!value) return undefined
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`
}

export default function Seo({
  title,
  description,
  canonical = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
  children,
  language,
}: SeoProps) {
  const { i18n } = useTranslation()
  const lang = language ?? (i18n.language?.startsWith("en") ? "en" : "bg")
  const canonicalUrl = toAbsoluteUrl(canonical) ?? SITE_URL
  const imageUrl = toAbsoluteUrl(image) ?? toAbsoluteUrl(DEFAULT_IMAGE)
  const fullTitle = title.endsWith(` | ${SITE_NAME}`) ? title : `${title} | ${SITE_NAME}`

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, follow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === "bg" ? "bg_BG" : "en_GB"} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      )}

      {children}
    </Helmet>
  )
}
