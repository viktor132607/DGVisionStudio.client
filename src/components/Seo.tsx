import { Helmet } from "react-helmet-async"
import type { ReactNode } from "react"

type SeoProps = {
  title: string
  description: string
  canonical?: string
  image?: string
  type?: "website" | "article"
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  children?: ReactNode
}

const SITE_NAME = "DG Vision Studio"
const SITE_URL = "https://dgvisionstudio.com"
const DEFAULT_IMAGE = "/og-cover.jpg"

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
}: SeoProps) {
  const canonicalUrl = toAbsoluteUrl(canonical) ?? SITE_URL
  const imageUrl = toAbsoluteUrl(image) ?? toAbsoluteUrl(DEFAULT_IMAGE)
  const fullTitle = `${title} | ${SITE_NAME}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bg_BG" />
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
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {children}
    </Helmet>
  )
}