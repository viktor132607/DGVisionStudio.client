import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import PortfolioLightbox from "./portfolio/PortfolioLightbox"
import { usePortfolioData } from "../hooks/usePortfolioData"
import type { PortfolioItem } from "../types/portfolio"

function isVideoPath(value?: string | null) {
    return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value || "")
}

function normalizeMediaPath(value?: string | null) {
    if (!value) return ""

    try {
        const url = new URL(value, window.location.origin)
        return decodeURIComponent(url.pathname).replace(/\/+$/, "").toLowerCase()
    } catch {
        return value.trim().toLowerCase()
    }
}

export default function HomeSlideshowAlbumLightbox() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const { categoriesData, albumsData, imagesData } = usePortfolioData()
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const selectedItem = selectedIndex !== null ? items[selectedIndex] ?? null : null
    const canGoPrev = selectedIndex !== null && selectedIndex > 0
    const canGoNext = selectedIndex !== null && selectedIndex < items.length - 1

    useEffect(() => {
        const isHomePage = location.pathname === "/" || location.pathname === "/services"
        if (!isHomePage) return

        const handleDocumentClick = (event: MouseEvent) => {
            if (event.button !== 0) return

            const target = event.target
            if (!(target instanceof Element)) return

            const slideshow = target.closest<HTMLElement>(".home-slideshow-media")
            if (!slideshow || target.closest("button")) return

            const visibleImages = Array.from(
                slideshow.querySelectorAll<HTMLImageElement>("img.object-cover.object-top")
            )
            const visibleImage = visibleImages.at(-1)
            if (!visibleImage) return

            const visiblePath = normalizeMediaPath(visibleImage.currentSrc || visibleImage.src)
            const visibleAlt = visibleImage.alt.trim()

            const currentImage =
                imagesData.find((image) =>
                    [image.thumbnailUrl, image.imageUrl].some(
                        (candidate) => normalizeMediaPath(candidate) === visiblePath
                    )
                ) ??
                imagesData.find((image) =>
                    [image.name, image.altText, image.caption, image.albumTitle].some(
                        (candidate) => candidate?.trim() === visibleAlt
                    )
                )

            if (!currentImage) return

            const album = albumsData.find((item) => item.id === currentImage.portfolioAlbumId)
            const category = categoriesData.find((item) => item.id === album?.portfolioCategoryId)
            const albumTitle = currentImage.albumTitle?.trim() || album?.title || "DG Vision Studio"
            const categoryLabel =
                (isBg ? currentImage.categoryName?.trim() : currentImage.categoryNameEn?.trim()) ||
                (isBg ? category?.name : category?.nameEn?.trim() || category?.name) ||
                currentImage.categoryName?.trim() ||
                "DG Vision Studio"

            const albumItems = imagesData
                .filter(
                    (image) =>
                        image.portfolioAlbumId === currentImage.portfolioAlbumId &&
                        image.isPublished
                )
                .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
                .map<PortfolioItem>((image, index) => {
                    const isVideo = image.mediaType === "Video" || isVideoPath(image.imageUrl)

                    return {
                        id: image.id,
                        src: image.imageUrl,
                        originalSrc: image.imageUrl,
                        category: category?.key || "slideshow",
                        categoryLabel:
                            (isBg ? image.categoryName?.trim() : image.categoryNameEn?.trim()) ||
                            categoryLabel,
                        albumKey: album?.slug || String(image.portfolioAlbumId || image.id),
                        albumLabel: image.albumTitle?.trim() || albumTitle,
                        title:
                            image.name?.trim() ||
                            image.altText?.trim() ||
                            image.caption?.trim() ||
                            `${albumTitle} ${index + 1}`,
                        mediaType: isVideo ? "Video" : image.mediaType || "Image",
                        contentType: image.contentType,
                    }
                })

            const nextIndex = albumItems.findIndex((image) => image.id === currentImage.id)
            if (nextIndex < 0 || albumItems.length === 0) return

            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()

            setItems(albumItems)
            setSelectedIndex(nextIndex)
        }

        document.addEventListener("click", handleDocumentClick, true)
        return () => document.removeEventListener("click", handleDocumentClick, true)
    }, [albumsData, categoriesData, imagesData, isBg, location.pathname])

    useEffect(() => {
        if (selectedIndex === null) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedIndex(null)
                setItems([])
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

    const close = () => {
        setSelectedIndex(null)
        setItems([])
    }

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
                onClose={close}
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
