import { readFile, writeFile, mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { createServer } from "vite"

// Service content is loaded from the API at runtime, never frozen into deployment HTML.
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" })
try {
  const { staticPages } = await server.ssrLoadModule("/src/seo/staticPages.ts")
  const { SITE_URL, SITE_NAME, DEFAULT_IMAGE, businessSchema, photographySchema } = await server.ssrLoadModule("/src/seo/photography.ts")
  const template = await readFile(resolve("dist/index.html"), "utf8")
  const escape = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const stripManagedHead = (html) => html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*(?:name=["'](?:description|robots|keywords|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
  for (const page of staticPages) {
    const title = `${page.title} | ${SITE_NAME}`
    const canonical = `${SITE_URL}${page.path}`
    const graph = { "@context": "https://schema.org", ...businessSchema("bg") }
    const image = `${SITE_URL}${DEFAULT_IMAGE}`
    const head = [
      `<title>${escape(title)}</title>`,
      `<meta data-rh="true" name="description" content="${escape(page.description)}">`,
      '<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large">',
      `<link data-rh="true" rel="canonical" href="${canonical}">`,
      ...Object.entries({ "og:site_name": SITE_NAME, "og:locale": "bg_BG", "og:type": "website", "og:title": title, "og:description": page.description, "og:url": canonical, "og:image": image })
        .map(([property, content]) => `<meta data-rh="true" property="${property}" content="${escape(content)}">`),
      ...Object.entries({ "twitter:card": "summary_large_image", "twitter:title": title, "twitter:description": page.description, "twitter:image": image })
        .map(([name, content]) => `<meta data-rh="true" name="${name}" content="${escape(content)}">`),
      `<script data-rh="true" type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`,
    ].join("\n")
    const html = stripManagedHead(template).replace("</head>", `${head}\n</head>`)
    const directory = resolve("dist", `.${page.path}`)
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, "index.html"), html)
  }
  // Render static hosting cannot resolve dynamic React Router URLs unless a
  // rewrite rule exists. Materialize currently published service URLs so direct
  // links and page refreshes work even on a manually configured static site.
  // The API stays authoritative for actual page content at runtime.
  const fallbackServices = JSON.parse(
    await readFile(resolve("scripts/photography-service-fallback.json"), "utf8")
  )
  let publishedServices = fallbackServices
  try {
    const response = await fetch("https://api.dgvisionstudio.com/api/photography-pages", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    if (!Array.isArray(result)) throw new Error("Unexpected photography pages response")
    publishedServices = result.filter(page => page.isActive === true && page.slug)
  } catch (error) {
    console.warn(`Photography page API unavailable during build (${error.message}); using known routes.`)
  }

  const serviceSlugs = new Set()
  for (const service of publishedServices) {
    const slug = String(service.slug ?? "")
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || serviceSlugs.has(slug)) continue
    serviceSlugs.add(slug)
    const path = `/fotograf-ruse/${slug}`
    const titleBg = String(service.title || "Фотографски услуги в Русе")
    const titleEn = String(service.titleEn || titleBg)
    const descriptionBg = String(service.description || "Фотографски услуги от DG Vision Studio в Русе.")
    const descriptionEn = String(service.descriptionEn || descriptionBg)
    const title = `${titleBg} | ${SITE_NAME}`
    const canonical = `${SITE_URL}${path}`
    const image = `${SITE_URL}${DEFAULT_IMAGE}`
    const schema = photographySchema("bg", {
      slug,
      bg: { title: titleBg, description: descriptionBg },
      en: { title: titleEn, description: descriptionEn },
    })
    const head = [
      `<title>${escape(title)}</title>`,
      `<meta data-rh="true" name="description" content="${escape(descriptionBg)}">`,
      '<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large">',
      `<link data-rh="true" rel="canonical" href="${canonical}">`,
      ...Object.entries({
        "og:site_name": SITE_NAME, "og:locale": "bg_BG",
        "og:type": "website", "og:title": title, "og:description": descriptionBg,
        "og:url": canonical, "og:image": image,
      }).map(([property, content]) => `<meta data-rh="true" property="${property}" content="${escape(content)}">`),
      ...Object.entries({
        "twitter:card": "summary_large_image", "twitter:title": title,
        "twitter:description": descriptionBg, "twitter:image": image,
      }).map(([name, content]) => `<meta data-rh="true" name="${name}" content="${escape(content)}">`),
      `<script data-rh="true" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`,
    ].join("\n")
    const html = stripManagedHead(template).replace("</head>", `${head}\n</head>`)
    const directory = resolve("dist", `.${path}`)
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, "index.html"), html)
  }
  console.log(`Generated ${serviceSlugs.size} published service route entry points.`)

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPages.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join("\n")}\n</urlset>\n`
  await writeFile(resolve("dist/sitemap.xml"), sitemap)

  // Render serves files before React Router runs. Account/admin entry points
  // need HTML too; omitting them makes direct login links and reloads return 404.
  // These are empty application shells: authorization stays in React and the API.
  const appRoutes = await readFile(resolve("src/App.tsx"), "utf8")
  const adminRoutes = await readFile(resolve("src/pages/admin/AdminRoutes.tsx"), "utf8")
  const literalPaths = (source) => [...source.matchAll(/\bpath="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => !/[:*]/.test(path))
  const privatePaths = new Set([
    ...literalPaths(appRoutes).filter((path) => path.startsWith("/identity/")),
    "/admin",
    ...literalPaths(adminRoutes).map((path) => `/admin/${path}`),
  ])
  const privateHtml = stripManagedHead(template).replace("</head>",
    `<title>${escape(SITE_NAME)}</title>\n<meta data-rh="true" name="robots" content="noindex, nofollow">\n</head>`)
  for (const path of privatePaths) {
    const directory = resolve("dist", `.${path}`)
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, "index.html"), privateHtml)
  }
  console.log(`Generated ${staticPages.length} public HTML pages and sitemap. Service content is managed through the API.`)
  console.log(`Generated ${privatePaths.size} non-indexable account/admin entry points.`)
} finally {
  await server.close()
}
