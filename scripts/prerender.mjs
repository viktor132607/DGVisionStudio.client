import { readFile, writeFile, mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { createServer } from "vite"

// Service content is loaded from the API at runtime, never frozen into deployment HTML.
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" })
try {
  const { staticPages } = await server.ssrLoadModule("/src/seo/staticPages.ts")
  const { SITE_URL, SITE_NAME, DEFAULT_IMAGE, businessSchema } = await server.ssrLoadModule("/src/seo/photography.ts")
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
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPages.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join("\n")}\n</urlset>\n`
  await writeFile(resolve("dist/sitemap.xml"), sitemap)
  console.log(`Generated ${staticPages.length} public HTML pages and sitemap. Service content is managed through the API.`)
} finally {
  await server.close()
}
