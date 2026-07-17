import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import PortfolioLightbox from "./portfolio/PortfolioLightbox"
import { apiFetch } from "../services/api"
import type { HomeSlideshowImage } from "../types/home"
import type { PortfolioItem } from "../types/portfolio"

function normalizeMediaPath(value?: string | null) {
    if (!value) return ""

    try {
        const url = new URL(value, window.location.origin)
        return decodeURIComponent(url.pathname).replace(/\/+$/, "").toLowerCase()
    } catch {
        return value.trim().toLowerCase()
    }
}

function isPortraitImage(src: string) {
    return new Promise<boolean>((resolve) => {
        const image = new Image()
        image.onload = () => resolve(image.naturalHeight > image.naturalWidth)
        image.onerror = () => resolve(false)
        image.src = src
    })
}

export default function HomeSlideshowAlbumLightbox() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [slideshowImages, setSlideshowImages] = useState<HomeSlideshowImage[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const items: PortfolioItem[] = slideshowImages.map((image, index) => {
        const albumLabel = image.albumTitle?.trim() || "DG Vision Studio"
        const categoryLabel =
            (isBg ? image.categoryName?.trim() : image.categoryNameEn?.trim()) ||
            image.categoryName?.trim() ||
            "DG Vision Studio"

        return {
            id: image.id,
            src: image.imageUrl,
            originalSrc: image.imageUrl,
            category: "slideshow",
            categoryLabel,
            albumKey: "home-slideshow",
            albumLabel,
            title:
                image.altText?.trim() ||
                image.caption?.trim() ||
                `${albumLabel} ${index + 1}`,
            mediaType: "Image",
        }
    })

    const selectedItem = selectedIndex !== null ? items[selectedIndex] ?? null : null
    const canGoPrev = selectedIndex !== null && selectedIndex > 0
    const canGoNext = selectedIndex !== null && selectedIndex < items.length - 1

    useEffect(() => {
        let isMounted = true

        const load = async () => {
            try {
                const response = await apiFetch("/portfolio/slideshow", {
                    method: "GET",
                    skipJsonContentType: true,
                    skipCsrfToken: true,
                })

                if (!response.ok) throw new Error()

                const data = await response.json().catch(() => [])
                const sortedImages: HomeSlideshowImage[] = Array.isArray(data)
                    ? data
                          .filter((item) => item?.isPublished && (item?.thumbnailUrl || item?.imageUrl))
                          .sort(
                              (a, b) =>
                                  (a.slideshowOrder ?? a.displayOrder ?? 0) -
                                      (b.slideshowOrder ?? b.displayOrder ?? 0) ||
                                  (a.id ?? 0) - (b.id ?? 0)
                          )
                    : []

                const portraitChecks = await Promise.all(
                    sortedImages.map(async (item) => {
                        const src = item.thumbnailUrl || item.imageUrl || ""
                        return src && (await isPortraitImage(src)) ? item : null
                    })
                )

                const portraitImages = portraitChecks.filter(
                    (item): item is HomeSlideshowImage => item !== null
                )
                const nextImages = portraitImages.length > 0 ? portraitImages : sortedImages

                if (isMounted) setSlideshowImages(nextImages)
            } catch {
                if (isMounted) setSlideshowImages([])
            }
        }

        void load()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        const isHomePage = location.pathname === "/" || location.pathname === "/services"

        if (!isHomePage) {
            setSelectedIndex(null)
            return
        }

        const handleDocumentClick = (event: MouseEvent) => {
            if (event.button !== 0) return

            const target = event.target
            if (!(target instanceof Element)) return

            const slideshow = target.closest<HTMLElement>(".home-slideshow-media")
            if (!slideshow || target.closest("button")) return

            const visibleImages = Array.from(
                slideshow.querySelectorAll<HTMLImageElement>("img.object-cover.object-top")
            )
            const visibleImage = visibleImages[visibleImages.length - 1]
            if (!visibleImage) return

            const visiblePath = normalizeMediaPath(visibleImage.currentSrc || visibleImage.src)
            const visibleAlt = visibleImage.alt.trim()
            const nextIndex = slideshowImages.findIndex(
                (image) =>
                    [image.thumbnailUrl, image.imageUrl].some(
                        (candidate) => normalizeMediaPath(candidate) === visiblePath
                    ) ||
                    [image.altText, image.caption, image.albumTitle].some(
                        (candidate) => candidate?.trim() === visibleAlt
                    )
            )

            if (nextIndex < 0) return

            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            setSelectedIndex(nextIndex)
        }

        document.addEventListener("click", handleDocumentClick, true)
        return () => document.removeEventListener("click", handleDocumentClick, true)
    }, [location.pathname, slideshowImages])

    useEffect(() => {
        if (selectedIndex === null) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedIndex(null)
                return
            }

            if (event.key === "ArrowLeft" && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1)
            }

            if (event.key === "ArrowRight" && selectedIndex < items.length - 1) {
                setSelectedIndex(selectedIndex + 1)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [items.length, selectedIndex])

    if (!selectedItem || selectedIndex === null) return null

    return (
        <div data-home-slideshow-album-lightbox="true">
            {!canGoPrev ? (
                <style>{`
                    [data-home-slideshow-album-lightbox="true"] button[aria-label="Предишна"],
                    [data-home-slideshow-album-lightbox="true"] button[aria-label="Previous"] {
                        display: none !important;
                    }
                `}</style>
            ) : null}

            {!canGoNext ? (
                <style>{`
                    [data-home-slideshow-album-lightbox="true"] button[aria-label="Следваща"],
                    [data-home-slideshow-album-lightbox="true"] button[aria-label="Next"] {
                        display: none !important;
                    }
                `}</style>
            ) : null}

            <PortfolioLightbox
                isBg={isBg}
                item={selectedItem}
                selectedIndex={selectedIndex}
                totalItems={items.length}
                onClose={() => setSelectedIndex(null)}
                onPrev={() => {
                    if (canGoPrev) setSelectedIndex(selectedIndex - 1)
                }}
                onNext={() => {
                    if (canGoNext) setSelectedIndex(selectedIndex + 1)
                }}
                showNavigation={items.length > 1}
            />
        </div>
    )
}
