(() => {
  const ACTIVITY_KEY = "dgvisionstudio.admin.albumActivity"
  const SORT_KEY = "dgvisionstudio.admin.albumSort"
  const DEFAULT_SORT = "activity_desc"

  const serverMetadata = new Map()
  let scheduled = 0
  let metadataRefreshScheduled = 0

  const readJson = (key, fallback) => {
    try {
      const value = window.localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  }

  const readActivity = () => readJson(ACTIVITY_KEY, {})

  const writeActivity = (value) => {
    try {
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(value))
    } catch {
      // Sorting still works with the server metadata and album id fallback.
    }
  }

  const markAlbumActivity = (albumId, timestamp = Date.now()) => {
    const id = Number(albumId)
    if (!Number.isFinite(id) || id <= 0) return

    const activity = readActivity()
    activity[String(id)] = Math.max(Number(activity[String(id)]) || 0, Number(timestamp) || Date.now())
    writeActivity(activity)
    scheduleEnhance()
  }

  const parseDate = (...values) => {
    for (const value of values) {
      if (!value) continue
      const parsed = Date.parse(String(value))
      if (Number.isFinite(parsed)) return parsed
    }
    return 0
  }

  const cacheMetadataItems = (payload) => {
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : []

    for (const item of items) {
      const id = Number(item?.id)
      if (!Number.isFinite(id) || id <= 0) continue

      const createdAt = parseDate(
        item.createdAtUtc,
        item.createdAt,
        item.createdOnUtc,
        item.createdOn,
        item.dateCreated
      )
      const updatedAt = parseDate(
        item.updatedAtUtc,
        item.updatedAt,
        item.modifiedAtUtc,
        item.modifiedAt,
        item.lastModifiedAtUtc,
        item.lastModifiedAt,
        item.dateModified
      )

      const previous = serverMetadata.get(id) || {}
      serverMetadata.set(id, {
        createdAt: createdAt || previous.createdAt || 0,
        updatedAt: updatedAt || previous.updatedAt || 0,
      })
    }

    scheduleEnhance()
  }

  const getRequestDetails = (input, init) => {
    const request = input instanceof Request ? input : null
    const rawUrl = request ? request.url : String(input || "")
    const method = String(init?.method || request?.method || "GET").toUpperCase()

    try {
      return { url: new URL(rawUrl, window.location.origin), method }
    } catch {
      return { url: null, method }
    }
  }

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (...args) => {
    const details = getRequestDetails(args[0], args[1])
    const response = await originalFetch(...args)

    if (!details.url) return response

    const path = details.url.pathname
    const isAdminAlbumList =
      details.method === "GET" &&
      (path.includes("/api/admin/client-galleries") || path.includes("/api/admin/portfolio/albums"))

    if (response.ok && isAdminAlbumList) {
      response
        .clone()
        .json()
        .then(cacheMetadataItems)
        .catch(() => undefined)
    }

    if (response.ok && details.method === "POST" && /\/api\/admin\/client-galleries\/?$/.test(path)) {
      response
        .clone()
        .json()
        .then((data) => markAlbumActivity(data?.id))
        .catch(() => undefined)
    }

    if (response.ok && ["POST", "PUT", "PATCH"].includes(details.method)) {
      const clientGalleryMatch = path.match(/\/api\/admin\/client-galleries\/(\d+)/)
      const portfolioAlbumMatch = path.match(/\/api\/admin\/portfolio\/albums\/(\d+)/)
      const match = clientGalleryMatch || portfolioAlbumMatch

      if (match) markAlbumActivity(match[1])
    }

    return response
  }

  const isAdminDashboard = () => /^\/admin\/?$/.test(window.location.pathname)

  const findAlbumsSection = () => {
    const direct = document.querySelector("#albums")
    if (direct) return direct

    return Array.from(document.querySelectorAll("section")).find((section) => {
      const title = section.querySelector("h2")?.textContent?.trim().toLowerCase()
      return title === "албуми" || title === "albums"
    }) || null
  }

  const getAlbumIdFromLink = (link) => {
    try {
      const url = new URL(link.getAttribute("href") || "", window.location.origin)
      const id = Number(url.searchParams.get("id"))
      return Number.isFinite(id) && id > 0 ? id : 0
    } catch {
      return 0
    }
  }

  const findAlbumGrid = (section) => {
    const selector = 'a[href*="/admin/client-galleries/edit?id="]'
    const candidates = Array.from(section.querySelectorAll("div.grid"))
      .map((grid) => {
        const children = Array.from(grid.children)
        const cards = children.filter((child) => {
          const link = child.matches?.(selector) ? child : child.querySelector?.(selector)
          return Boolean(link && child.querySelector?.("h3"))
        })

        return { grid, cards }
      })
      .filter((candidate) => candidate.cards.length > 0)
      .sort((a, b) => b.cards.length - a.cards.length)

    return candidates[0] || null
  }

  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("bg-BG")

  const extractCategory = (card) => {
    const text = card.textContent || ""
    const match = text.match(/(?:Категория|Category)\s*:\s*([^\n]+)/i)
    return normalize(match?.[1] || "")
  }

  const extractStatus = (card) => {
    const text = normalize(card.textContent)
    if (text.includes("неактивен") || text.includes("inactive")) return 0
    if (text.includes("активен") || text.includes("active")) return 1
    return 0
  }

  const getEntries = (candidate) => {
    const activity = readActivity()
    const selector = 'a[href*="/admin/client-galleries/edit?id="]'

    return candidate.cards
      .map((card, index) => {
        const link = card.matches?.(selector) ? card : card.querySelector(selector)
        const id = getAlbumIdFromLink(link)
        if (!id) return null

        if (!card.dataset.dgAlbumOriginalIndex) {
          card.dataset.dgAlbumOriginalIndex = String(index)
        }

        const metadata = serverMetadata.get(id) || {}
        const localActivity = Number(activity[String(id)]) || 0
        const createdAt = Number(metadata.createdAt) || id
        const updatedAt = Number(metadata.updatedAt) || 0

        return {
          card,
          id,
          title: normalize(card.querySelector("h3")?.textContent),
          category: extractCategory(card),
          status: extractStatus(card),
          createdAt,
          activityAt: Math.max(localActivity, updatedAt, createdAt, id),
          originalIndex: Number(card.dataset.dgAlbumOriginalIndex) || 0,
        }
      })
      .filter(Boolean)
  }

  const compareText = (a, b) => a.localeCompare(b, "bg-BG", { sensitivity: "base" })

  const sortEntries = (entries, mode) => {
    const sorted = [...entries]

    sorted.sort((a, b) => {
      switch (mode) {
        case "created_desc":
          return b.createdAt - a.createdAt || b.id - a.id
        case "created_asc":
          return a.createdAt - b.createdAt || a.id - b.id
        case "title_asc":
          return compareText(a.title, b.title) || b.id - a.id
        case "title_desc":
          return compareText(b.title, a.title) || b.id - a.id
        case "category_asc":
          return compareText(a.category, b.category) || compareText(a.title, b.title)
        case "active_first":
          return b.status - a.status || b.activityAt - a.activityAt || b.id - a.id
        case "manual":
          return a.originalIndex - b.originalIndex
        case "activity_desc":
        default:
          return b.activityAt - a.activityAt || b.id - a.id
      }
    })

    return sorted
  }

  const ensureStyles = () => {
    if (document.getElementById("dg-admin-album-sort-style")) return

    const style = document.createElement("style")
    style.id = "dg-admin-album-sort-style"
    style.textContent = `
      #dg-album-sort-wrap label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 600;
        color: rgb(55 65 81);
      }
      #dg-album-sort-select {
        width: 100%;
        height: 3rem;
        border: 1px solid rgb(209 213 219);
        border-radius: 0.75rem;
        background: white;
        padding: 0 1rem;
        color: rgb(17 24 39);
        font-size: 0.875rem;
        outline: none;
      }
      #dg-album-sort-select:focus {
        border-color: rgb(14 165 233);
        box-shadow: 0 0 0 4px rgb(224 242 254);
      }
      @media (min-width: 1280px) {
        [data-dg-album-filter-panel="true"] {
          grid-template-columns: minmax(0, 2fr) minmax(180px, 1fr) minmax(240px, 1fr) !important;
        }
      }
      @media (prefers-color-scheme: dark) {
        #dg-album-sort-wrap label { color: rgb(212 212 216); }
        #dg-album-sort-select {
          border-color: rgb(63 63 70);
          background: rgb(9 9 11);
          color: white;
        }
        #dg-album-sort-select:focus {
          box-shadow: 0 0 0 4px rgb(12 74 110 / 0.4);
        }
      }
    `
    document.head.appendChild(style)
  }

  const ensureSortControl = (section) => {
    let select = document.getElementById("dg-album-sort-select")
    if (select) return select

    const searchInput = Array.from(section.querySelectorAll('input[type="text"]')).find((input) =>
      normalize(input.placeholder).includes("търси") || normalize(input.placeholder).includes("search")
    )
    if (!searchInput) return null

    let panel = searchInput.parentElement
    while (panel && panel !== section) {
      if (panel.classList.contains("grid") && panel.querySelector("select")) break
      panel = panel.parentElement
    }
    if (!panel || panel === section) return null

    panel.dataset.dgAlbumFilterPanel = "true"

    const wrapper = document.createElement("div")
    wrapper.id = "dg-album-sort-wrap"

    const label = document.createElement("label")
    label.setAttribute("for", "dg-album-sort-select")
    label.textContent = "Подреждане"

    select = document.createElement("select")
    select.id = "dg-album-sort-select"
    select.innerHTML = `
      <option value="activity_desc">Последно добавени / редактирани</option>
      <option value="created_desc">Най-ново създадени</option>
      <option value="created_asc">Най-старо създадени</option>
      <option value="title_asc">Име: А–Я</option>
      <option value="title_desc">Име: Я–А</option>
      <option value="category_asc">Категория</option>
      <option value="active_first">Активни първо</option>
      <option value="manual">Ръчен ред</option>
    `

    const storedSort = window.localStorage.getItem(SORT_KEY)
    select.value = storedSort || DEFAULT_SORT
    if (!select.value) select.value = DEFAULT_SORT

    select.addEventListener("change", () => {
      try {
        window.localStorage.setItem(SORT_KEY, select.value)
      } catch {
        // Keep the selected value for the current page even if storage is unavailable.
      }
      scheduleEnhance()
    })

    wrapper.append(label, select)
    panel.appendChild(wrapper)
    return select
  }

  const applySort = (section, select) => {
    const candidate = findAlbumGrid(section)
    if (!candidate) return

    const entries = getEntries(candidate)
    if (!entries.length) return

    const sorted = sortEntries(entries, select?.value || DEFAULT_SORT)
    const currentCards = entries.map((entry) => entry.card)
    const sortedCards = sorted.map((entry) => entry.card)
    const alreadySorted = currentCards.every((card, index) => card === sortedCards[index])

    if (alreadySorted) return

    const fragment = document.createDocumentFragment()
    sortedCards.forEach((card) => fragment.appendChild(card))
    candidate.grid.appendChild(fragment)
  }

  const enhance = () => {
    scheduled = 0
    if (!isAdminDashboard()) return

    const section = findAlbumsSection()
    if (!section) return

    ensureStyles()
    const select = ensureSortControl(section)
    applySort(section, select)
  }

  function scheduleEnhance() {
    window.clearTimeout(scheduled)
    scheduled = window.setTimeout(enhance, 40)
  }

  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)

  history.pushState = (...args) => {
    const result = originalPushState(...args)
    scheduleEnhance()
    return result
  }

  history.replaceState = (...args) => {
    const result = originalReplaceState(...args)
    scheduleEnhance()
    return result
  }

  window.addEventListener("popstate", scheduleEnhance)
  window.addEventListener("DOMContentLoaded", scheduleEnhance)

  const observer = new MutationObserver(() => {
    if (!isAdminDashboard()) return
    scheduleEnhance()
  })

  const startObserver = () => {
    observer.observe(document.body, { childList: true, subtree: true })
    scheduleEnhance()
  }

  if (document.body) startObserver()
  else window.addEventListener("DOMContentLoaded", startObserver, { once: true })
})()
