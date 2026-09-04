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

  const getResponseFileName = (response, fallback) => {
    const disposition = response.headers.get("content-disposition") || ""
    const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utfMatch?.[1]) {
      try {
        return decodeURIComponent(utfMatch[1].replace(/^"|"$/g, ""))
      } catch {
        // Fall back to the regular filename or the supplied name.
      }
    }

    const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
    return plainMatch?.[1] || fallback
  }

  const triggerBlobDownload = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  const readErrorMessage = async (response) => {
    try {
      const type = response.headers.get("content-type") || ""
      if (type.includes("application/json")) {
        const data = await response.json()
        return data?.message || data?.title || data?.error || "Изтеглянето беше неуспешно."
      }
      const text = await response.text()
      return text || "Изтеглянето беше неуспешно."
    } catch {
      return "Изтеглянето беше неуспешно."
    }
  }

  const downloadArchive = async (path, fallbackFileName) => {
    const separator = path.includes("?") ? "&" : "?"
    const response = await previousFetch(
      apiUrl(`${path}${separator}_=${Date.now()}`),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/zip",
        },
      }
    )

    if (!response.ok) {
      throw new Error(await readErrorMessage(response))
    }

    const blob = await response.blob()
    if (!blob.size) throw new Error("Полученият архив е празен.")

    triggerBlobDownload(blob, getResponseFileName(response, fallbackFileName))
  }

  const setButtonBusy = (button, busy, idleText) => {
    button.disabled = busy
    button.textContent = busy ? "Изтегляне..." : idleText
    button.style.opacity = busy ? "0.65" : ""
    button.style.cursor = busy ? "wait" : ""
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
      "inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
    )
    button.dataset.dgDownloadAllAlbums = "true"
    button.title = "Изтегли всички актуални албуми"

    button.addEventListener("click", async () => {
      if (button.disabled) return
      setButtonBusy(button, true, "Изтегли всички")

      try {
        await downloadArchive(
          "/admin/client-galleries/download-all",
          "dgvisionstudio-all-albums.zip"
        )
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Изтеглянето беше неуспешно.")
      } finally {
        setButtonBusy(button, false, "Изтегли всички")
      }
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
      const button = makeDownloadButton("Изтегли албум", accessLink.className)
      button.dataset.dgDownloadAlbum = "true"
      button.dataset.albumId = String(albumId)
      button.title = "Изтегли албума като ZIP"
      button.setAttribute("aria-label", `Изтегли албум ${title}`)

      button.addEventListener("click", async () => {
        if (button.disabled) return
        setButtonBusy(button, true, "Изтегли албум")

        try {
          await downloadArchive(
            `/admin/portfolio/albums/${albumId}/download`,
            `${safeFileName(title, `album-${albumId}`)}.zip`
          )
        } catch (error) {
          window.alert(error instanceof Error ? error.message : "Изтеглянето беше неуспешно.")
        } finally {
          setButtonBusy(button, false, "Изтегли албум")
        }
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
