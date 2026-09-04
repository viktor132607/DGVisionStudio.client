(() => {
  let adminApiRoot = ""
  let scheduled = 0

  const previousFetch = window.fetch.bind(window)

  const captureApiRoot = (input) => {
    try {
      const rawUrl = input instanceof Request ? input.url : String(input || "")
      const url = new URL(rawUrl, window.location.origin)
      if (!url.pathname.includes("/api/admin/")) return

      const apiIndex = url.pathname.indexOf("/api/")
      const pathPrefix = apiIndex >= 0 ? url.pathname.slice(0, apiIndex) : ""
      adminApiRoot = `${url.origin}${pathPrefix}`
    } catch {
      // Same-origin fallback is used until an admin API request is observed.
    }
  }

  window.fetch = async (...args) => {
    captureApiRoot(args[0])
    return previousFetch(...args)
  }

  const isAdminDashboard = () => /^\/admin\/?$/.test(window.location.pathname)

  const apiUrl = (path) => {
    const root = adminApiRoot || window.location.origin
    return `${root}/api${path.startsWith("/") ? path : `/${path}`}`
  }

  const safeFileName = (value, fallback) => {
    const cleaned = String(value || fallback || "album")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
    return cleaned || fallback || "album"
  }

  // Do not fetch ZIP files into JavaScript. Large archives can fail because of
  // CORS/network buffering and turn into "Failed to fetch". The normal profile
  // gallery download already works as a direct browser download, so admin uses
  // the same mechanism and lets the browser stream the response to disk.
  const downloadArchive = (path, fallbackFileName) => {
    const separator = path.includes("?") ? "&" : "?"
    const link = document.createElement("a")
    link.href = apiUrl(`${path}${separator}_=${Date.now()}`)
    link.download = fallbackFileName
    link.rel = "noopener"
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const makeDownloadButton = (text, className) => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = className
    button.textContent = text
    return button
  }

  const ensureDownloadAllButton = (section) => {
    if (section.querySelector('[data-dg-download-all-albums="true"]')) return

    const createLink = section.querySelector('a[href="/admin/client-galleries/new"]')
    const actions = createLink?.parentElement
    if (!createLink || !actions) return

    const button = makeDownloadButton(
      "Изтегли всички",
      "inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
    )
    button.dataset.dgDownloadAllAlbums = "true"
    button.title = "Изтегли всички актуални албуми"

    button.addEventListener("click", () => {
      downloadArchive(
        "/admin/client-galleries/download-all",
        "dgvisionstudio-all-albums.zip"
      )
    })

    actions.insertBefore(button, createLink)
  }

  const getAlbumId = (editLink) => {
    try {
      const url = new URL(editLink.getAttribute("href") || "", window.location.origin)
      const id = Number(url.searchParams.get("id"))
      return Number.isFinite(id) && id > 0 ? id : 0
    } catch {
      return 0
    }
  }

  const ensureAlbumDownloadButtons = (section) => {
    const editLinks = section.querySelectorAll('a[href*="/admin/client-galleries/edit?id="]')

    for (const editLink of editLinks) {
      const actions = editLink.parentElement
      if (!actions || actions.querySelector('[data-dg-download-album="true"]')) continue

      const accessLink = actions.querySelector('a[href*="/admin/client-galleries/access?id="]')
      if (!accessLink) continue

      const albumId = getAlbumId(editLink)
      if (!albumId) continue

      const card = editLink.closest("[class*='overflow-hidden']") || editLink.closest("div")
      const title = card?.querySelector("h3")?.textContent?.trim() || `album-${albumId}`
      const button = makeDownloadButton("Изтегли архив", accessLink.className)
      button.dataset.dgDownloadAlbum = "true"
      button.dataset.albumId = String(albumId)
      button.title = "Изтегли архива на албума като ZIP"
      button.setAttribute("aria-label", `Изтегли архив ${title}`)

      button.addEventListener("click", () => {
        downloadArchive(
          `/admin/portfolio/albums/${albumId}/download`,
          `${safeFileName(title, `album-${albumId}`)}.zip`
        )
      })

      accessLink.insertAdjacentElement("afterend", button)
    }
  }

  const enhance = () => {
    scheduled = 0
    if (!isAdminDashboard()) return

    const section = document.querySelector("#albums")
    if (!section) return

    ensureDownloadAllButton(section)
    ensureAlbumDownloadButtons(section)
  }

  const scheduleEnhance = () => {
    window.clearTimeout(scheduled)
    scheduled = window.setTimeout(enhance, 50)
  }

  const observer = new MutationObserver(scheduleEnhance)

  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true })
    scheduleEnhance()
  }

  window.addEventListener("popstate", scheduleEnhance)
  window.addEventListener("pageshow", scheduleEnhance)

  if (document.body) start()
  else window.addEventListener("DOMContentLoaded", start, { once: true })
})()