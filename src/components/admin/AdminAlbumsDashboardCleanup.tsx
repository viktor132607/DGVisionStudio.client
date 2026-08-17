import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const normalizeText = (value?: string | null) => (value || "").replace(/\s+/g, " ").trim()

function hideElement(element: HTMLElement | null, hiddenElements: HTMLElement[]) {
  if (!element || hiddenElements.includes(element)) return
  element.style.display = "none"
  hiddenElements.push(element)
}

function ensureNativePlatformClass() {
  const root = document.documentElement
  const userAgent = navigator.userAgent || ""
  const platform = navigator.platform || ""
  const touchPoints = navigator.maxTouchPoints || 0

  const isAndroid = /Android/i.test(`${platform} ${userAgent}`)
  const isIPhoneOrIPad = /iPhone|iPad|iPod/i.test(userAgent)
  const isIPadDesktopMode = /Mac/i.test(platform) && touchPoints > 1
  const isMac = /Mac/i.test(platform) && !isAndroid

  if (isAndroid) {
    root.classList.add("android-device")
    root.classList.remove("apple-device")
    return "android" as const
  }

  if (isIPhoneOrIPad || isIPadDesktopMode || isMac) {
    root.classList.add("apple-device")
    root.classList.remove("android-device")
    return "apple" as const
  }

  return "other" as const
}

function hideAlbumDashboardExtras(hiddenElements: HTMLElement[]) {
  const albumsSection = document.querySelector<HTMLElement>("#albums")
  if (!albumsSection) return

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
}

function markAppleDashboardMetrics(platform: "apple" | "android" | "other") {
  if (platform !== "apple") return

  const users = document.querySelector<HTMLAnchorElement>('a[href="/admin/users"]')
  const contacts = document.querySelector<HTMLAnchorElement>('a[href="/admin/contact-requests"]')
  const printRequests = document.querySelector<HTMLAnchorElement>('a[href="/admin/print-requests"]')
  const parent = users?.parentElement

  if (parent && contacts?.parentElement === parent && printRequests?.parentElement === parent) {
    parent.dataset.appleDashboardMetrics = "true"
  }
}

function markPlatformAlbumActions(platform: "apple" | "android" | "other") {
  if (platform === "other") return

  const albumsSection = document.querySelector<HTMLElement>("#albums")
  if (!albumsSection) return

  const editLinks = albumsSection.querySelectorAll<HTMLAnchorElement>('a[href*="/admin/client-galleries/edit?id="]')

  for (const editLink of editLinks) {
    const actionBar = editLink.parentElement
    if (!actionBar) continue

    const accessLink = actionBar.querySelector<HTMLAnchorElement>('a[href*="/admin/client-galleries/access?id="]')
    const deleteButton = Array.from(actionBar.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => {
        const text = normalizeText(button.textContent)
        return text === "Изтрий" || text === "Зареждане..."
      })

    if (!accessLink || !deleteButton) continue

    actionBar.dataset.appleAlbumActions = "true"
    actionBar.dataset.nativePlatform = platform

    editLink.dataset.appleAlbumAction = "edit"
    editLink.setAttribute("aria-label", "Редакция")
    editLink.setAttribute("title", "Редакция")

    accessLink.dataset.appleAlbumAction = "access"
    accessLink.setAttribute("aria-label", "Достъп")
    accessLink.setAttribute("title", "Достъп")

    deleteButton.dataset.appleAlbumAction = "delete"
    deleteButton.setAttribute("aria-label", "Изтрий")
    deleteButton.setAttribute("title", "Изтрий")
  }
}

function applyPlatformDashboardMarkers() {
  const platform = ensureNativePlatformClass()
  markAppleDashboardMetrics(platform)
  markPlatformAlbumActions(platform)
}

export default function AdminAlbumsDashboardCleanup() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== "/admin") return

    const hiddenElements: HTMLElement[] = []
    let animationFrame = 0

    const apply = () => {
      hideAlbumDashboardExtras(hiddenElements)
      applyPlatformDashboardMarkers()
    }

    const scheduleApply = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(apply)
    }

    apply()

    const observer = new MutationObserver(scheduleApply)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener("pageshow", scheduleApply)
    window.addEventListener("orientationchange", scheduleApply)

    return () => {
      observer.disconnect()
      window.removeEventListener("pageshow", scheduleApply)
      window.removeEventListener("orientationchange", scheduleApply)
      window.cancelAnimationFrame(animationFrame)
      for (const element of hiddenElements) element.style.removeProperty("display")
    }
  }, [location.pathname])

  return null
}
