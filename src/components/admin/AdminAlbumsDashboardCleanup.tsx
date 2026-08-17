import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const normalizeText = (value?: string | null) => (value || "").replace(/\s+/g, " ").trim()

function hideElement(element: HTMLElement | null, hiddenElements: HTMLElement[]) {
  if (!element || hiddenElements.includes(element)) return
  element.style.display = "none"
  hiddenElements.push(element)
}

function hideAlbumDashboardExtras() {
  const albumsSection = document.querySelector<HTMLElement>("#albums")
  if (!albumsSection) return [] as HTMLElement[]

  const hiddenElements: HTMLElement[] = []

  const refreshButton = Array.from(albumsSection.querySelectorAll<HTMLButtonElement>("button"))
    .find((button) => normalizeText(button.textContent) === "Обнови албумите")
  hideElement(refreshButton || null, hiddenElements)

  for (const child of Array.from(albumsSection.children)) {
    if (!(child instanceof HTMLElement)) continue

    const text = normalizeText(child.textContent)
    const isStatsGrid =
      text.includes("Общо албуми") &&
      text.includes("Активни") &&
      text.includes("Неактивни") &&
      text.includes("Изтекли")

    const labels = Array.from(child.querySelectorAll("label")).map((label) => normalizeText(label.textContent))
    const isFilterPanel = labels.includes("Търсене") && labels.includes("Статус")

    if (isStatsGrid || isFilterPanel) hideElement(child, hiddenElements)
  }

  return hiddenElements
}

export default function AdminAlbumsDashboardCleanup() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== "/admin") return

    let hiddenElements: HTMLElement[] = []
    let attempts = 0
    let timeoutId = 0

    const apply = () => {
      hiddenElements = hideAlbumDashboardExtras()
      attempts += 1
      if (!hiddenElements.length && attempts < 10) {
        timeoutId = window.setTimeout(apply, 100)
      }
    }

    apply()

    return () => {
      window.clearTimeout(timeoutId)
      for (const element of hiddenElements) element.style.removeProperty("display")
    }
  }, [location.pathname])

  return null
}
