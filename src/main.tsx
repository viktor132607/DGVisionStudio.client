import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import "./index.css"
import "./styles/homeSlideshowRatio.css"
import "./styles/homeSlideshowControls.css"
import "./styles/homeServicesGrid.css"
import "./styles/foldHomeLayout.css"
import "./styles/adminResponsive.css"
import "./styles/appleAdminDashboard.css"
import "./i18n/i18n"
import "./services/appleCalendarShareFix"
import App from "./App"
import EuroCurrencyGuard from "./components/EuroCurrencyGuard"
import HomeSlideshowAlbumLightbox from "./components/HomeSlideshowAlbumLightbox"
import HomeFoldRecentAlbums from "./components/HomeFoldRecentAlbums"
import AdminAlbumsDashboardCleanup from "./components/admin/AdminAlbumsDashboardCleanup"
import MobileAdminCalendar from "./components/admin/MobileAdminCalendar"
import { AuthProvider } from "./context/AuthContext"

const pendingRecentAlbumKey = "dgvisionstudio:pending-recent-album"

type PendingRecentAlbum = {
  title: string
  src: string
}

function readPendingRecentAlbum(): PendingRecentAlbum | null {
  try {
    const value = sessionStorage.getItem(pendingRecentAlbumKey)
    return value ? (JSON.parse(value) as PendingRecentAlbum) : null
  } catch {
    return null
  }
}

function savePendingRecentAlbum(album: PendingRecentAlbum) {
  try {
    sessionStorage.setItem(pendingRecentAlbumKey, JSON.stringify(album))
  } catch {
    // Navigation still works normally when storage is unavailable.
  }
}

function clearPendingRecentAlbum() {
  try {
    sessionStorage.removeItem(pendingRecentAlbumKey)
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}

function openPendingRecentAlbum() {
  if (window.location.pathname !== "/portfolio") return

  const pendingAlbum = readPendingRecentAlbum()
  if (!pendingAlbum) return

  const albumImages = Array.from(
    document.querySelectorAll<HTMLImageElement>("main button img[alt]"),
  )

  const matchingImage =
    albumImages.find((image) => image.alt.trim() === pendingAlbum.title) ??
    albumImages.find((image) => image.src === pendingAlbum.src)
  const albumButton = matchingImage?.closest<HTMLButtonElement>("button")

  if (!albumButton) return

  clearPendingRecentAlbum()
  albumButton.click()
}

function restoreFullHomeHeroTitle() {
  const title = document.querySelector<HTMLElement>(".home-hero-title")
  if (!title) return

  const isBulgarian =
    document.documentElement.lang.toLowerCase().startsWith("bg") ||
    title.textContent?.toLowerCase().includes("фотография")

  const fullTitle = isBulgarian
    ? "Фотография и визуално съдържание с характер и присъствие"
    : "Photography and visual content with character and presence"

  if (title.textContent?.trim() !== fullTitle) {
    title.textContent = fullTitle
  }
}

document.addEventListener(
  "click",
  (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    const target = event.target
    if (!(target instanceof Element)) return

    const recentAlbumLink = target.closest<HTMLAnchorElement>(
      'a.home-recent-card[href="/portfolio"]',
    )
    const recentAlbumImage =
      recentAlbumLink?.querySelector<HTMLImageElement>("img[alt]")

    if (!recentAlbumImage) return

    savePendingRecentAlbum({
      title: recentAlbumImage.alt.trim(),
      src: recentAlbumImage.currentSrc || recentAlbumImage.src,
    })
  },
  true,
)

new MutationObserver(() => {
  openPendingRecentAlbum()
  restoreFullHomeHeroTitle()
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["lang"],
})

window.addEventListener("popstate", () => queueMicrotask(openPendingRecentAlbum))

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <EuroCurrencyGuard />
          <AdminAlbumsDashboardCleanup />
          <MobileAdminCalendar />
          <HomeSlideshowAlbumLightbox />
          <HomeFoldRecentAlbums />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
