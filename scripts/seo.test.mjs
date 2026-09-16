import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const sitemap = readFileSync("dist/sitemap.xml", "utf8")
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
const htmlFor = (url) => readFileSync(`dist${new URL(url).pathname.replace(/\/$/, "")}/index.html`, "utf8")

test("sitemap covers the public navigation and excludes account/duplicate URLs", () => {
  assert.equal(new Set(urls).size, urls.length)
  for (const path of ["/", "/fotograf-ruse", "/portfolio", "/pricing", "/about", "/contact", "/blog", "/privacy", "/cookies", "/terms"]) {
    assert(urls.includes(`https://dgvisionstudio.com${path}`), path)
  }
  for (const url of urls) {
    assert.equal(new URL(url).origin, "https://dgvisionstudio.com")
    assert(!/\/(admin|identity|services)(\/|$)|[?#]/.test(url), url)
  }
})

test("every HTML page has one canonical, title, description and robots directive", () => {
  const titles = new Set()
  for (const url of urls) {
    const html = htmlFor(url)
    for (const pattern of [/<title\b/g, /rel="canonical"/g, /name="description"/g, /name="robots"/g]) {
      assert.equal([...html.matchAll(pattern)].length, 1, `${url}: ${pattern}`)
    }
    const title = html.match(/<title>(.*?)<\/title>/s)[1]
    assert(!titles.has(title), `Repeated title: ${title}`)
    titles.add(title)
    assert(html.includes(`rel="canonical" href="${url}"`), url)
    assert(html.includes('content="index, follow, max-image-preview:large"'), url)
    assert(html.includes('content="https://dgvisionstudio.com/images/og-cover.jpg"'), url)
    assert(!html.includes('content="https://dgvisionstudio.com/og-cover.jpg"'), url)
  }
})

test("service content is dynamic and the removed homepage block stays absent", () => {
  assert.equal(urls.filter(url => new URL(url).pathname.startsWith("/fotograf-ruse/")).length, 0)
  for (const path of ["/", "/fotograf-ruse"]) {
    assert(htmlFor(`https://dgvisionstudio.com${path}`).includes('<div id="root"></div>'))
  }
  assert(readFileSync("dist/robots.txt", "utf8").includes("https://api.dgvisionstudio.com/api/photography-pages/sitemap.xml"))
})

test("structured data parses and service pages identify the local provider", () => {
  for (const url of urls) {
    const scripts = [...htmlFor(url).matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    assert.equal(scripts.length, 1, url)
    const data = JSON.parse(scripts[0][1])
    assert.equal(data["@context"], "https://schema.org")
    if (new URL(url).pathname.startsWith("/fotograf-ruse/")) {
      const service = data["@graph"].find((item) => item["@type"] === "Service")
      assert.equal(service.url, url)
      assert.equal(service.provider["@id"], "https://dgvisionstudio.com/#business")
      const business = data["@graph"].find((item) => item["@type"] === "LocalBusiness")
      assert.equal(business.address.addressLocality, "Русе")
      assert.equal(business.telephone, "+359988758434")
    }
  }
})
