import { useCallback, useEffect, useMemo, useState } from "react"
import { apiFetch } from "../services/api"
import type { HomeSlideshowImage } from "../types/home"

type SlideshowIntroVideoResponse = {
    videoUrl?: string | null
}

type SlideshowSettingsResponse = {
    intervalMs?: number | null
}

const normalizeIntervalMs = (value: unknown, fallback: number) => {
    const next = Number(value)
    if (!Number.isFinite(next)) return fallback
    return Math.max(1000, Math.min(30000, Math.round(next)))
}

export function useHomePortfolioSlideshow(intervalMs = 4000, transitionMs = 700) {
    const [images, setImages] = useState<HomeSlideshowImage[]>([])
    const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(null)
    const [activeIntervalMs, setActiveIntervalMs] = useState(intervalMs)
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

        const preloadImage = (src: string) => {
            if (!src) return

            const img = new Image()
            img.decoding = "async"
            img.src = src
        }

        const loadIntroVideo = async () => {
            try {
                const response = await apiFetch("/portfolio/slideshow/intro-video", {
                    method: "GET",
                    skipJsonContentType: true,
                    skipCsrfToken: true,
                })

                if (!response.ok) throw new Error()

                const data = (await response.json().catch(() => null)) as SlideshowIntroVideoResponse | null
                setIntroVideoUrl(data?.videoUrl?.trim() || null)
            } catch {
                setIntroVideoUrl(null)
            }
        }

        const loadSettings = async () => {
            try {
                const response = await apiFetch("/portfolio/slideshow/settings", {
                    method: "GET",
                    skipJsonContentType: true,
                    skipCsrfToken: true,
                })

                if (!response.ok) throw new Error()

                const data = (await response.json().catch(() => null)) as SlideshowSettingsResponse | null
                setActiveIntervalMs(normalizeIntervalMs(data?.intervalMs, intervalMs))
            } catch {
                setActiveIntervalMs(intervalMs)
            }
        }

        const load = async () => {
            void loadIntroVideo()
            void loadSettings()

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
                                  (a.slideshowOrder ?? a.displayOrder ?? 0) - (b.slideshowOrder ?? b.displayOrder ?? 0) ||
                                  (a.id ?? 0) - (b.id ?? 0)
                          )
                    : []

                if (sortedImages.length > 0) {
                    setImages(sortedImages)
                    setCurrentIndex(0)
                    setPreviousIndex(null)
                    setIsTransitioning(false)
                    preloadImage(sortedImages[0].thumbnailUrl || sortedImages[0].imageUrl || "")
                }

                const portraitChecks = await Promise.all(
                    sortedImages.map(async (item) => {
                        const src = item.thumbnailUrl || item.imageUrl || ""
                        const isPortrait = src ? await isPortraitImage(src) : false
                        return isPortrait ? item : null
                    })
                )

                const portraitImages = portraitChecks.filter(
                    (item): item is HomeSlideshowImage => item !== null
                )

                const nextImages = portraitImages.length > 0 ? portraitImages : sortedImages

                setImages(nextImages)
                setCurrentIndex(0)
                setPreviousIndex(null)
                setIsTransitioning(false)
                preloadImage(nextImages[0]?.thumbnailUrl || nextImages[0]?.imageUrl || "")
            } catch {
                setImages([])
                setCurrentIndex(0)
                setPreviousIndex(null)
                setIsTransitioning(false)
            }
        }

        void load()
    }, [intervalMs])

    const goToIndex = useCallback(
        (nextIndex: number, nextDirection: 1 | -1) => {
            if (images.length <= 1) return

            setDirection(nextDirection)

            if (isMobile) {
                setPreviousIndex(null)
                setCurrentIndex(nextIndex)
                setIsTransitioning(false)
                return
            }

            setPreviousIndex(currentIndex)
            setCurrentIndex(nextIndex)
            setIsTransitioning(true)
        },
        [currentIndex, images.length, isMobile]
    )

    const goNext = useCallback(() => {
        if (images.length <= 1) return
        goToIndex((currentIndex + 1) % images.length, 1)
    }, [currentIndex, goToIndex, images.length])

    const goPrevious = useCallback(() => {
        if (images.length <= 1) return
        goToIndex((currentIndex - 1 + images.length) % images.length, -1)
    }, [currentIndex, goToIndex, images.length])

    useEffect(() => {
        if (images.length <= 1) return

        const timer = window.setInterval(() => {
            goNext()
        }, activeIntervalMs)

        return () => window.clearInterval(timer)
    }, [goNext, images.length, activeIntervalMs])

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
        introVideoUrl,
        currentImage,
        previousImage,
        currentIndex,
        isTransitioning,
        direction,
        isMobile,
        goNext,
        goPrevious,
    }
}
