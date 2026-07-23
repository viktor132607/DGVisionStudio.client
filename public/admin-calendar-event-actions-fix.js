(() => {
  const EVENT_OPEN_CLASS = "dg-calendar-event-modal-open"
  const TYPES_OPEN_CLASS = "dg-calendar-types-modal-open"
  const EVENT_MODAL_SELECTOR = "section[data-dg-calendar-event-modal]"

  const isCalendarPage = () => /^\/admin\/calendar\/?$/.test(window.location.pathname)
  const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim()

  const getReactOnClick = (element) => {
    for (const key of Object.getOwnPropertyNames(element)) {
      if (key.startsWith("__reactProps$")) {
        const handler = element[key]?.onClick
        if (typeof handler === "function") return handler
      }
    }

    for (const key of Object.getOwnPropertyNames(element)) {
      if (!key.startsWith("__reactFiber$")) continue

      let fiber = element[key]
      while (fiber) {
        const handler = fiber.memoizedProps?.onClick || fiber.pendingProps?.onClick
        if (typeof handler === "function") return handler
        fiber = fiber.return
      }
    }

    return null
  }

  const openEditModal = () => {
    if (!document.querySelector(EVENT_MODAL_SELECTOR)) return
    document.documentElement.classList.remove(TYPES_OPEN_CLASS)
    document.documentElement.classList.add(EVENT_OPEN_CLASS)
  }

  const createReactEvent = (button, nativeEvent) => ({
    target: button,
    currentTarget: button,
    nativeEvent,
    defaultPrevented: false,
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => nativeEvent.stopPropagation(),
    isDefaultPrevented: () => nativeEvent.defaultPrevented,
    isPropagationStopped: () => true,
    persist: () => undefined,
  })

  const handleClickCapture = (event) => {
    if (!isCalendarPage()) return

    const target = event.target instanceof Element ? event.target : null
    const button = target?.closest("button")
    if (!button) return

    const text = normalizeText(button.textContent)
    const isEdit = text === "Редактирай"
    const isDelete = text === "Изтрий"
    if (!isEdit && !isDelete) return

    const reactOnClick = getReactOnClick(button)
    if (typeof reactOnClick !== "function") {
      if (isEdit) window.setTimeout(openEditModal, 0)
      return
    }

    event.preventDefault()
    event.stopImmediatePropagation()

    try {
      reactOnClick(createReactEvent(button, event))
    } finally {
      if (isEdit) window.setTimeout(openEditModal, 0)
    }
  }

  document.addEventListener("click", handleClickCapture, true)
})()
