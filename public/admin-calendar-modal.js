(() => {
  const EVENT_OPEN_CLASS = "dg-calendar-event-modal-open"
  const TYPES_OPEN_CLASS = "dg-calendar-types-modal-open"
  const EVENT_MODAL_ATTR = "data-dg-calendar-event-modal"
  const TYPES_MODAL_ATTR = "data-dg-calendar-types-modal"
  const EVENTS_RAIL_ATTR = "data-dg-calendar-events-rail"
  const PAGE_ATTR = "data-dg-calendar-page"
  const MAIN_GRID_ATTR = "data-dg-calendar-main-grid"
  const CALENDAR_ATTR = "data-dg-calendar-main"
  const HIDDEN_SELECTED_ATTR = "data-dg-calendar-hidden-selected"
  const BACKDROP_ID = "dg-calendar-modal-backdrop"
  const EVENT_CLOSE_CLASS = "dg-calendar-event-modal-close"
  const TYPES_CLOSE_CLASS = "dg-calendar-types-modal-close"
  const RAIL_CONTROLS_ID = "dg-calendar-rail-controls"
  const RAIL_ADD_ID = "dg-calendar-rail-add"
  const RAIL_TYPES_ID = "dg-calendar-rail-types"

  const isCalendarPage = () => /^\/admin\/calendar\/?$/.test(window.location.pathname)
  const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim()
  const allSections = () => Array.from(document.querySelectorAll("section"))

  const findSectionByHeading = (predicate) => allSections().find((section) => {
    const heading = section.querySelector("h2")
    return heading && predicate(normalizeText(heading.textContent))
  }) || null

  const findEventFormSection = () => findSectionByHeading((text) =>
    (text === "Ново събитие" || text === "Редакция")
  )

  const findTypesSection = () => findSectionByHeading((text) => text === "Типове събития")

  const findEventsSection = () => findSectionByHeading((text) => text.startsWith("Събития за "))

  const findCalendarSection = () => allSections().find((section) => {
    const sevenColumnGrids = section.querySelectorAll('[class*="grid-cols-7"]')
    return sevenColumnGrids.length >= 2 && Array.from(section.querySelectorAll("button")).some((button) => normalizeText(button.textContent) === "Назад")
  }) || null

  const findSelectedDaySection = () => allSections().find((section) => {
    const label = Array.from(section.querySelectorAll("p")).some((item) => normalizeText(item.textContent) === "Избран ден")
    const addButton = Array.from(section.querySelectorAll("button")).some((button) => normalizeText(button.textContent) === "+ Добави")
    return label && addButton
  }) || null

  const ensureStyles = () => {
    if (document.getElementById("dg-calendar-layout-styles")) return

    const style = document.createElement("style")
    style.id = "dg-calendar-layout-styles"
    style.textContent = `
      #${BACKDROP_ID} {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(4px);
      }

      html.${EVENT_OPEN_CLASS},
      html.${TYPES_OPEN_CLASS} {
        overflow: hidden;
      }

      html.${EVENT_OPEN_CLASS} #${BACKDROP_ID},
      html.${TYPES_OPEN_CLASS} #${BACKDROP_ID} {
        display: block;
      }

      [${HIDDEN_SELECTED_ATTR}] {
        display: none !important;
      }

      [${MAIN_GRID_ATTR}] {
        display: block !important;
      }

      [${CALENDAR_ATTR}] {
        width: 100% !important;
      }

      section[${EVENT_MODAL_ATTR}],
      section[${TYPES_MODAL_ATTR}] {
        display: none !important;
        position: fixed !important;
        left: 50% !important;
        top: max(1rem, env(safe-area-inset-top)) !important;
        z-index: 9999 !important;
        max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
        margin: 0 !important;
        overflow-y: auto !important;
        transform: translateX(-50%) !important;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35) !important;
      }

      section[${EVENT_MODAL_ATTR}] {
        width: min(1100px, calc(100vw - 2rem)) !important;
      }

      section[${TYPES_MODAL_ATTR}] {
        width: min(760px, calc(100vw - 2rem)) !important;
      }

      html.${EVENT_OPEN_CLASS} section[${EVENT_MODAL_ATTR}],
      html.${TYPES_OPEN_CLASS} section[${TYPES_MODAL_ATTR}] {
        display: block !important;
      }

      .${EVENT_CLOSE_CLASS},
      .${TYPES_CLOSE_CLASS} {
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

      .dark .${EVENT_CLOSE_CLASS},
      .dark .${TYPES_CLOSE_CLASS} {
        border-color: #3f3f46;
        background: #18181b;
        color: #fff;
      }

      #${RAIL_CONTROLS_ID} {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.6rem;
        margin-bottom: 1rem;
      }

      #${RAIL_CONTROLS_ID} button {
        min-height: 2.75rem;
        border-radius: 0.75rem;
        padding: 0.65rem 0.8rem;
        font-size: 0.8rem;
        font-weight: 800;
        cursor: pointer;
      }

      #${RAIL_ADD_ID} {
        border: 1px solid #111827;
        background: #111827;
        color: #fff;
      }

      #${RAIL_TYPES_ID} {
        border: 1px solid #d1d5db;
        background: #fff;
        color: #111827;
      }

      .dark #${RAIL_ADD_ID} {
        border-color: #fff;
        background: #fff;
        color: #000;
      }

      .dark #${RAIL_TYPES_ID} {
        border-color: #3f3f46;
        background: #18181b;
        color: #fff;
      }

      @media (min-width: 1024px) {
        [${PAGE_ATTR}] {
          padding-right: 19.5rem !important;
        }

        section[${EVENTS_RAIL_ATTR}] {
          position: fixed !important;
          top: 5rem !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 35 !important;
          width: 18rem !important;
          margin: 0 !important;
          overflow-y: auto !important;
          border-width: 0 0 0 1px !important;
          border-radius: 0 !important;
          padding: 1rem !important;
          background: #f9fafb !important;
          box-shadow: -10px 0 28px rgba(15, 23, 42, 0.06) !important;
        }

        .dark section[${EVENTS_RAIL_ATTR}] {
          border-color: rgba(255, 255, 255, 0.1) !important;
          background: #09090b !important;
        }

        section[${EVENTS_RAIL_ATTR}] > h2 {
          font-size: 1rem !important;
          line-height: 1.35 !important;
        }

        section[${EVENTS_RAIL_ATTR}] [class*="rounded-2xl"] {
          border-radius: 0.85rem !important;
        }
      }

      @media (max-width: 1023px) {
        [${PAGE_ATTR}] {
          padding-right: 1rem !important;
        }

        section[${EVENTS_RAIL_ATTR}] {
          position: static !important;
          width: auto !important;
          margin-top: 1.5rem !important;
        }
      }

      @media (max-width: 640px) {
        section[${EVENT_MODAL_ATTR}],
        section[${TYPES_MODAL_ATTR}] {
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

  const ensureCloseButton = (section, className) => {
    if (section.querySelector(`.${className}`)) return

    const closeButton = document.createElement("button")
    closeButton.type = "button"
    closeButton.className = className
    closeButton.setAttribute("aria-label", "Затвори")
    closeButton.textContent = "×"
    section.prepend(closeButton)
  }

  const prepareEventModal = () => {
    const section = findEventFormSection()
    if (!section) return null

    section.setAttribute(EVENT_MODAL_ATTR, "true")
    section.setAttribute("role", "dialog")
    section.setAttribute("aria-modal", "true")
    ensureCloseButton(section, EVENT_CLOSE_CLASS)
    return section
  }

  const prepareTypesModal = () => {
    const section = findTypesSection()
    if (!section) return null

    section.setAttribute(TYPES_MODAL_ATTR, "true")
    section.setAttribute("role", "dialog")
    section.setAttribute("aria-modal", "true")
    ensureCloseButton(section, TYPES_CLOSE_CLASS)
    return section
  }

  const ensureRailControls = (eventsSection) => {
    let controls = eventsSection.querySelector(`#${RAIL_CONTROLS_ID}`)
    if (controls) return controls

    controls = document.createElement("div")
    controls.id = RAIL_CONTROLS_ID

    const addButton = document.createElement("button")
    addButton.id = RAIL_ADD_ID
    addButton.type = "button"
    addButton.textContent = "+ Добави събитие"

    const typesButton = document.createElement("button")
    typesButton.id = RAIL_TYPES_ID
    typesButton.type = "button"
    typesButton.textContent = "Типове събития"

    controls.append(addButton, typesButton)
    eventsSection.prepend(controls)
    return controls
  }

  const hideSelectedDayUi = (calendarSection) => {
    const selectedDaySection = findSelectedDaySection()
    selectedDaySection?.setAttribute(HIDDEN_SELECTED_ATTR, "true")

    Array.from(calendarSection.querySelectorAll("div")).forEach((element) => {
      if (normalizeText(element.textContent).startsWith("Избран ден:")) {
        element.setAttribute(HIDDEN_SELECTED_ATTR, "true")
      }
    })
  }

  const prepareLayout = () => {
    if (!isCalendarPage()) return

    const calendarSection = findCalendarSection()
    if (!calendarSection) return

    const mainGrid = calendarSection.parentElement
    const page = mainGrid?.parentElement
    if (!mainGrid || !page) return

    page.setAttribute(PAGE_ATTR, "true")
    mainGrid.setAttribute(MAIN_GRID_ATTR, "true")
    calendarSection.setAttribute(CALENDAR_ATTR, "true")
    hideSelectedDayUi(calendarSection)

    const eventsSection = findEventsSection()
    if (eventsSection) {
      eventsSection.setAttribute(EVENTS_RAIL_ATTR, "true")
      ensureRailControls(eventsSection)
    }
  }

  const preparePage = () => {
    if (!isCalendarPage()) {
      document.documentElement.classList.remove(EVENT_OPEN_CLASS, TYPES_OPEN_CLASS)
      return
    }

    ensureStyles()
    ensureBackdrop()
    prepareEventModal()
    prepareTypesModal()
    prepareLayout()
  }

  const closeAllModals = () => {
    document.documentElement.classList.remove(EVENT_OPEN_CLASS, TYPES_OPEN_CLASS)
  }

  const openEventModal = () => {
    const section = prepareEventModal()
    if (!section) return

    document.documentElement.classList.remove(TYPES_OPEN_CLASS)
    document.documentElement.classList.add(EVENT_OPEN_CLASS)
    window.setTimeout(() => {
      const firstField = section.querySelector("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])")
      firstField?.focus({ preventScroll: true })
    }, 0)
  }

  const openTypesModal = () => {
    const section = prepareTypesModal()
    if (!section) return

    document.documentElement.classList.remove(EVENT_OPEN_CLASS)
    document.documentElement.classList.add(TYPES_OPEN_CLASS)
    window.setTimeout(() => {
      const firstField = section.querySelector("input:not([type='hidden']):not([disabled])")
      firstField?.focus({ preventScroll: true })
    }, 0)
  }

  const findSourceAddButton = () => {
    const selectedSection = findSelectedDaySection()
    const selectedButton = selectedSection && Array.from(selectedSection.querySelectorAll("button")).find((button) => normalizeText(button.textContent) === "+ Добави")
    if (selectedButton) return selectedButton

    return Array.from(document.querySelectorAll("button")).find((button) =>
      button.id !== RAIL_ADD_ID && normalizeText(button.textContent) === "+ Добави"
    ) || null
  }

  const isCalendarEventButton = (button) => {
    if (!button.title) return false
    return /^\d{1,2}:\d{2}\s/.test(normalizeText(button.textContent))
  }

  const handleClick = (event) => {
    if (!isCalendarPage()) return

    const target = event.target instanceof Element ? event.target : null
    if (!target) return

    if (target.closest(`#${BACKDROP_ID}, .${EVENT_CLOSE_CLASS}, .${TYPES_CLOSE_CLASS}`)) {
      closeAllModals()
      return
    }

    const button = target.closest("button")
    if (!button) return

    if (button.id === RAIL_TYPES_ID) {
      openTypesModal()
      return
    }

    if (button.id === RAIL_ADD_ID) {
      const sourceButton = findSourceAddButton()
      if (sourceButton) sourceButton.click()
      else openEventModal()
      return
    }

    const buttonText = normalizeText(button.textContent)
    if (buttonText === "+ Добави" || isCalendarEventButton(button)) {
      window.setTimeout(openEventModal, 0)
      return
    }

    if (buttonText === "Откажи" && button.closest(`section[${EVENT_MODAL_ATTR}]`)) {
      window.setTimeout(closeAllModals, 0)
    }
  }

  let prepareScheduled = false
  const schedulePrepare = () => {
    if (prepareScheduled) return
    prepareScheduled = true
    window.requestAnimationFrame(() => {
      prepareScheduled = false
      preparePage()
    })
  }

  const observer = new MutationObserver(schedulePrepare)

  const start = () => {
    preparePage()
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllModals()
    })
    window.addEventListener("popstate", schedulePrepare)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
