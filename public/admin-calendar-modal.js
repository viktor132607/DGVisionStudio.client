(() => {
  const ROOT_OPEN_CLASS = "dg-calendar-event-modal-open"
  const MODAL_ATTR = "data-dg-calendar-event-modal"
  const BACKDROP_ID = "dg-calendar-event-modal-backdrop"
  const CLOSE_BUTTON_CLASS = "dg-calendar-event-modal-close"

  const isCalendarPage = () => /^\/admin\/calendar\/?$/.test(window.location.pathname)

  const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim()

  const ensureStyles = () => {
    if (document.getElementById("dg-calendar-event-modal-styles")) return

    const style = document.createElement("style")
    style.id = "dg-calendar-event-modal-styles"
    style.textContent = `
      #${BACKDROP_ID} {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(4px);
      }

      html.${ROOT_OPEN_CLASS} {
        overflow: hidden;
      }

      html.${ROOT_OPEN_CLASS} #${BACKDROP_ID} {
        display: block;
      }

      section[${MODAL_ATTR}] {
        display: none !important;
        position: fixed !important;
        left: 50% !important;
        top: max(1rem, env(safe-area-inset-top)) !important;
        z-index: 9999 !important;
        width: min(1100px, calc(100vw - 2rem)) !important;
        max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
        margin: 0 !important;
        overflow-y: auto !important;
        transform: translateX(-50%) !important;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35) !important;
      }

      html.${ROOT_OPEN_CLASS} section[${MODAL_ATTR}] {
        display: block !important;
      }

      .${CLOSE_BUTTON_CLASS} {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        width: 2.5rem;
        height: 2.5rem;
        margin: -0.5rem 0 0.5rem auto;
        align-items: center;
        justify-content: center;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        background: #fff;
        color: #111827;
        font-size: 1.25rem;
        font-weight: 800;
        cursor: pointer;
      }

      .dark .${CLOSE_BUTTON_CLASS} {
        border-color: #3f3f46;
        background: #18181b;
        color: #fff;
      }

      @media (max-width: 640px) {
        section[${MODAL_ATTR}] {
          top: max(0.5rem, env(safe-area-inset-top)) !important;
          width: calc(100vw - 1rem) !important;
          max-height: calc(100dvh - 1rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  const ensureBackdrop = () => {
    let backdrop = document.getElementById(BACKDROP_ID)
    if (backdrop) return backdrop

    backdrop = document.createElement("div")
    backdrop.id = BACKDROP_ID
    backdrop.setAttribute("aria-hidden", "true")
    document.body.appendChild(backdrop)
    return backdrop
  }

  const findFormSection = () => {
    if (!isCalendarPage()) return null

    return Array.from(document.querySelectorAll("section")).find((section) => {
      const heading = section.querySelector("h2")
      const headingText = normalizeText(heading?.textContent)
      return (headingText === "Ново събитие" || headingText === "Редакция") && Boolean(section.querySelector("input, select, textarea"))
    }) || null
  }

  const prepareModal = () => {
    if (!isCalendarPage()) {
      document.documentElement.classList.remove(ROOT_OPEN_CLASS)
      return null
    }

    ensureStyles()
    ensureBackdrop()

    const section = findFormSection()
    if (!section) return null

    section.setAttribute(MODAL_ATTR, "true")
    section.setAttribute("role", "dialog")
    section.setAttribute("aria-modal", "true")

    if (!section.querySelector(`.${CLOSE_BUTTON_CLASS}`)) {
      const closeButton = document.createElement("button")
      closeButton.type = "button"
      closeButton.className = CLOSE_BUTTON_CLASS
      closeButton.setAttribute("aria-label", "Затвори")
      closeButton.textContent = "×"
      section.prepend(closeButton)
    }

    return section
  }

  const openModal = () => {
    const section = prepareModal()
    if (!section) return

    document.documentElement.classList.add(ROOT_OPEN_CLASS)
    window.setTimeout(() => {
      const firstField = section.querySelector("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])")
      firstField?.focus({ preventScroll: true })
    }, 0)
  }

  const closeModal = () => {
    document.documentElement.classList.remove(ROOT_OPEN_CLASS)
  }

  const isAddEventButton = (button) => normalizeText(button.textContent) === "+ Добави"

  const isCalendarEventButton = (button) => {
    if (!button.title) return false
    return /^\d{1,2}:\d{2}\s/.test(normalizeText(button.textContent))
  }

  const handleClick = (event) => {
    if (!isCalendarPage()) return

    const target = event.target instanceof Element ? event.target : null
    if (!target) return

    if (target.closest(`#${BACKDROP_ID}, .${CLOSE_BUTTON_CLASS}`)) {
      closeModal()
      return
    }

    const button = target.closest("button")
    if (!button) return

    if (isAddEventButton(button) || isCalendarEventButton(button)) {
      window.setTimeout(openModal, 0)
      return
    }

    if (normalizeText(button.textContent) === "Откажи" && button.closest(`section[${MODAL_ATTR}]`)) {
      window.setTimeout(closeModal, 0)
    }
  }

  const observer = new MutationObserver(() => {
    prepareModal()
  })

  const start = () => {
    ensureStyles()
    ensureBackdrop()
    prepareModal()
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal()
    })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
