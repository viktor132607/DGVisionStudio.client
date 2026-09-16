export const SITE_URL = "https://dgvisionstudio.com"
export const SITE_NAME = "DG Vision Studio"
export const DEFAULT_IMAGE = "/images/og-cover.jpg"
export type Language = "bg" | "en"
type ServiceCopy = { title: string; description: string; paragraphs: string[]; preparation: string[] }
export type PhotographyService = { slug: string; category?: string; bg: ServiceCopy; en: ServiceCopy }

export const hubPath = "/fotograf-ruse"
export const servicePath = (service: { slug: string }) => service.slug ? `/fotograf-ruse/${service.slug}` : hubPath
export const homeMetadata = {
  bg: { title: "Фотограф в Русе — фотосесии и събития", description: "DG Vision Studio — фотограф в Русе за сватби, балове, кръщенета, портретни, семейни и продуктови фотосесии. Портфолио, цени и запитвания." },
  en: { title: "Photographer in Ruse — photoshoots and events", description: "DG Vision Studio — photographer in Ruse for weddings, proms, baptisms, portraits, family and product photoshoots. View our portfolio, pricing and contact details." },
}

export function businessSchema(language: Language) {
  return {
    "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, name: SITE_NAME,
    url: `${SITE_URL}/`, image: `${SITE_URL}${DEFAULT_IMAGE}`, logo: `${SITE_URL}/images/mainlogo.png`,
    description: homeMetadata[language].description,
    telephone: "+359988758434", email: "dgvisionstudio@gmail.com",
    address: { "@type": "PostalAddress", streetAddress: language === "bg" ? "Търговски комплекс Ялта" : "Yalta Shopping Complex", addressLocality: language === "bg" ? "Русе" : "Ruse", addressCountry: "BG" },
    areaServed: { "@type": "City", name: "Русе", alternateName: "Ruse" },
    hasMap: "https://www.google.com/maps/search/?api=1&query=Yalta%20Shopping%20Complex%2C%20Ruse",
    sameAs: ["https://www.facebook.com/profile.php?id=61588317548349", "https://www.tiktok.com/@dgvisionstudio1"],
  }
}

export function photographySchema(language: Language, service?: PhotographyService, overviewTitle?: string) {
  const path = service ? servicePath(service) : hubPath
  const name = service ? service[language].title : overviewTitle ?? homeMetadata[language].title
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessSchema(language),
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: ["bg", "en"], publisher: { "@id": `${SITE_URL}/#business` } },
      { "@type": service ? "WebPage" : "CollectionPage", "@id": `${SITE_URL}${path}#page`, url: `${SITE_URL}${path}`, name, inLanguage: language, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#business` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: language === "bg" ? "Начало" : "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: language === "bg" ? "Фотограф в Русе" : "Photographer in Ruse", item: `${SITE_URL}${hubPath}` },
        ...(service ? [{ "@type": "ListItem", position: 3, name, item: `${SITE_URL}${path}` }] : []),
      ] },
      ...(service ? [{ "@type": "Service", "@id": `${SITE_URL}${path}#service`, name, serviceType: name, description: service[language].description, url: `${SITE_URL}${path}`, areaServed: { "@type": "City", name: "Ruse" }, provider: { "@id": `${SITE_URL}/#business` } }] : []),
    ],
  }
}
