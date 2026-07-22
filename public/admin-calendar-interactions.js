(() => {
  const STYLE_ID = "dg-calendar-interactions-styles"
  const EVENT_OPEN_CLASS = "dg-calendar-event-modal-open"
  const TYPES_OPEN_CLASS = "dg-calendar-types-modal-open"
  const EVENT_TYPES_BUTTON_ID = "dg-calendar-event-types-button"
  const TYPES_RAIL_BUTTON_ID = "dg-calendar-rail-types"
  const EVENT_RAIL_BUTTON_ID = "dg-calendar-rail-add"
  const BACKDROP_ID = "dg-calendar-modal-backdrop"
  const TYPES_CLOSE_CLASS = "dg-calendar-types-modal-close"

  let typesOpenedFromEvent = false
  let autoOpenKey = ""
  let prepareScheduled = false

  const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim()
  const isDashboardPage = () => /^\/admin\/?$/.test(window.location.pathname)
  const isCalendarPage = () => /^\/admin\/calendar\/?$/.test(window.location.pathname)

  const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      #admin-dashboard-calendar-preview-root > section {
        margin-top: 0.85rem !important;
      }

      #${EVENT_TYPES_BUTTON_ID} {
        display: inline-flex;
        width: 100%;
        min-height: 2.5rem;
        margin-top: 0.6rem;
        align-items: center;
        justify-content: center;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        background: #fff;
        padding: 0.55rem 0.8rem;
        color: #111827;
        font-size: 0.8rem;
        font-weight: 800;
        cursor: pointer;
      }

      #${EVENT_TYPES_BUTTON_ID}:hover {
        background: #f9fafb;
      }

      .dark #${EVENT_TYPES_BUTTON_ID} {
        border-color: #3f3f46;
        background: #18181b;
        color: #fff;
      }

      .dark #${EVENT_TYPES_BUTTON_ID}:hover {
        background: #27272a;
      }
    `
    document.head.appendChild(style)
  }

  const addAutoOpenParameter = (anchor) => {
    const text = normalizeText(anchor.textContent)
    if (text !== "+ Добави събитие" && text !== "+ Добави") return

    let url
    try {
      url = new URL(anchor.href, window.location.origin)
    } catch {
      return
    }

    if (!/^\/admin\/calendar\/?$/.test(url.pathname) || !url.searchParams.has("date")) return
    if (url.searchParams.get("openEvent") === "1") return

    url.searchParams.set("openEvent", "1")
    anchor.setAttribute("href", `${url.pathname}${url.search}${url.hash}`)
  }

  const prepareDashboardLinks = () => {
    if (!isDashboardPage()) return
    document.querySelectorAll('a[href*="/admin/calendar"]').forEach(addAutoOpenParameter)
  }

  const findEventModal = () => {
    const prepared = document.querySelector('section[data-dg-calendar-event-modal]')
    if (prepared) return prepared

    return Array.from(document.querySelectorAll("section")).find((section) => {
      const heading = section.querySelector("h2")
      const text = normalizeText(heading?.textContent)
      return text === "Ново събитие" || text === "Редакция"
    }) || null
  }

  const ensureEventTypesButton = () => {
    if (!isCalendarPage() || document.getElementById(EVENT_TYPES_BUTTON_ID)) return

    const eventModal = findEventModal()
    if (!eventModal) return

    const typeLabel = Array.from(eventModal.querySelectorAll("label")).find((label) => {
      const hasTypeHeading = Array.from(label.querySelectorAll("span")).some((span) => normalizeText(span.textContent) === "Тип")
      return hasTypeHeading && Boolean(label.querySelector("select"))
    })
    if (!typeLabel) return

    const select = typeLabel.querySelector("select")
    if (!select) return

    const button = document.createElement("button")
    button.id = EVENT_TYPES_BUTTON_ID
    button.type = "button"
    button.textContent = "Управление на типове събития"
    select.insertAdjacentElement("afterend", button)
  }

  const openEventFromQuery = () => {
    if (!isCalendarPage()) return

    const url = new URL(window.location.href)
    if (url.searchParams.get("openEvent") !== "1") return

    const key = `${url.pathname}?${url.searchParams.toString()}`
    if (autoOpenKey === key) return

    const addButton = document.getElementById(EVENT_RAIL_BUTTON_ID) || Array.from(document.querySelectorAll("button")).find((button) => normalizeText(button.textContent) === "+ Добави")
    if (!addButton || !findEventModal()) return

    autoOpenKey = key
    url.searchParams.delete("openEvent")
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
    addButton.click()
  }

  const restoreEventModal = () => {
    if (!typesOpenedFromEvent || !isCalendarPage()) return
    typesOpenedFromEvent = false
    document.documentElement.classList.remove(TYPES_OPEN_CLASS)
    document.documentElement.classList.add(EVENT_OPEN_CLASS)
  }

  const handleClickCapture = (event) => {
    const target = event.target instanceof Element ? event.target : null
    if (!target) return

    const eventTypesButton = target.closest(`#${EVENT_TYPES_BUTTON_ID}`)
    if (eventTypesButton) {
      typesOpenedFromEvent = true
      window.setTimeout(() => {
        const typesButton = document.getElementById(TYPES_RAIL_BUTTON_ID)
        if (typesButton) {
          typesButton.click()
          return
        }

        document.documentElement.classList.remove(EVENT_OPEN_CLASS)
        document.documentElement.classList.add(TYPES_OPEN_CLASS)
      }, 0)
      return
    }

    if (typesOpenedFromEvent && target.closest(`#${BACKDROP_ID}, .${TYPES_CLOSE_CLASS}`)) {
      window.setTimeout(restoreEventModal, 0)
    }
  }

  const prepare = () => {
    ensureStyles()
    prepareDashboardLinks()
    ensureEventTypesButton()
    openEventFromQuery()
  }

  const schedulePrepare = () => {
    if (prepareScheduled) return
    prepareScheduled = true
    window.requestAnimationFrame(() => {
      prepareScheduled = false
      prepare()
    })
  }

  const observer = new MutationObserver(schedulePrepare)

  const start = () => {
    prepare()
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener("click", handleClickCapture, true)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && typesOpenedFromEvent && document.documentElement.classList.contains(TYPES_OPEN_CLASS)) {
        window.setTimeout(restoreEventModal, 0)
      }
    }, true)
    window.addEventListener("popstate", schedulePrepare)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()