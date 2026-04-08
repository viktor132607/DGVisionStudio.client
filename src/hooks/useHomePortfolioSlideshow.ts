import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../services/api"
import type { HomeSlideshowImage } from "../types/home"

export function useHomePortfolioSlideshow(intervalMs = 4000, transitionMs = 700) {
    const [images, setImages] = useState<HomeSlideshowImage[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [previousIndex, setPreviousIndex] = useState<number | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [direction, setDirection] = useState<1 | -1>(1)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const media = window.matchMedia("(max-width: 1023px)")

        const updateMobileState = () => {
            setIsMobile(media.matches)
        }

        updateMobileState()

        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", updateMobileState)
            return () => media.removeEventListener("change", updateMobileState)
        }

        media.addListener(updateMobileState)
        return () => media.removeListener(updateMobileState)
    }, [])

    useEffect(() => {
        const isPortraitImage = (src: string) =>
            new Promise<boolean>((resolve) => {
                const img = new Image()

                img.onload = () => resolve(img.naturalHeight > img.naturalWidth)
                img.onerror = () => resolve(false)

                img.src = src
            })

        const load = async () => {
            try {
                const response = await apiFetch("/portfolio/images", {
                    method: "GET",
                    skipJsonContentType: true,
                })

                if (!response.ok) throw new Error()

                const data = await response.json().catch(() => [])

                const sortedImages: HomeSlideshowImage[] = Array.isArray(data)
                    ? data
                          .filter((item) => item?.isPublished && (item?.thumbnailUrl || item?.imageUrl))
                          .sort(
                              (a, b) =>
                                  (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                                  (a.id ?? 0) - (b.id ?? 0)
                          )
                    : []

                const portraitChecks = await Promise.all(
                    sortedImages.map(async (item) => {
                        const src = item.thumbnailUrl || item.imageUrl || ""
                        const isPortrait = src ? await isPortraitImage(src) : false
                        return isPortrait ? item : null
                    })
                )

                const nextImages = portraitChecks.filter(
                    (item): item is HomeSlideshowImage => item !== null
                )

                setImages(nextImages)
                setCurrentIndex(0)
                setPreviousIndex(null)
                setIsTransitioning(false)
            } catch {
                setImages([])
                setCurrentIndex(0)
                setPreviousIndex(null)
                setIsTransitioning(false)
            }
        }

        void load()
    }, [])

    useEffect(() => {
        if (images.length <= 1) return

        const timer = window.setInterval(() => {
            setDirection(1)

            if (isMobile) {
                setPreviousIndex(null)
                setCurrentIndex((prev) => (prev + 1) % images.length)
                setIsTransitioning(false)
                return
            }

            setPreviousIndex(currentIndex)
            setCurrentIndex((prev) => (prev + 1) % images.length)
            setIsTransitioning(true)
        }, intervalMs)

        return () => window.clearInterval(timer)
    }, [currentIndex, images.length, intervalMs, isMobile])

    useEffect(() => {
        if (!isTransitioning) return

        const timer = window.setTimeout(() => {
            setPreviousIndex(null)
            setIsTransitioning(false)
        }, transitionMs)

        return () => window.clearTimeout(timer)
    }, [isTransitioning, transitionMs])

    const currentImage = useMemo(() => {
        if (!images.length) return null
        return images[currentIndex]
    }, [images, currentIndex])

    const previousImage = useMemo(() => {
        if (previousIndex === null || !images.length) return null
        return images[previousIndex] ?? null
    }, [images, previousIndex])

    return {
        images,
        currentImage,
        previousImage,
        currentIndex,
        isTransitioning,
        direction,
        isMobile,
    }
}