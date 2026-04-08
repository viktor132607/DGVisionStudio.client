import { useEffect, useRef, useState } from "react"
import type { MouseEvent as ReactMouseEvent, TouchEvent, WheelEvent } from "react"
import type { PortfolioItem } from "../../types/portfolio"

type PortfolioLightboxProps = {
    isBg: boolean
    item: PortfolioItem
    selectedIndex: number | null
    totalItems: number
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    showNavigation: boolean
}

const ZOOM_LEVELS = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4]

type Point = {
    x: number
    y: number
}

export default function PortfolioLightbox({
    isBg,
    item,
    selectedIndex,
    totalItems,
    onClose,
    onPrev,
    onNext,
    showNavigation,
}: PortfolioLightboxProps) {
    const [zoomIndex, setZoomIndex] = useState(0)
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)

    const viewportRef = useRef<HTMLDivElement | null>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const imageBoundsRef = useRef<DOMRect | null>(null)
    const dragStartRef = useRef<Point>({ x: 0, y: 0 })
    const dragPanStartRef = useRef<Point>({ x: 0, y: 0 })
    const mouseDownStartedInsideImageRef = useRef(false)

    const touchStartX = useRef<number | null>(null)
    const touchStartY = useRef<number | null>(null)
    const lastTapRef = useRef(0)

    const zoom = ZOOM_LEVELS[zoomIndex]

    useEffect(() => {
        setZoomIndex(0)
        setPan({ x: 0, y: 0 })
        setIsDragging(false)
        mouseDownStartedInsideImageRef.current = false
    }, [item.id])

    const getPanLimits = () => {
        const viewport = viewportRef.current
        const image = imageRef.current

        if (!viewport || !image) return { x: 0, y: 0 }

        const viewportWidth = viewport.clientWidth
        const viewportHeight = viewport.clientHeight
        const imageWidth = image.clientWidth
        const imageHeight = image.clientHeight

        return {
            x: Math.max(0, (imageWidth * zoom - viewportWidth) / 2),
            y: Math.max(0, (imageHeight * zoom - viewportHeight) / 2),
        }
    }

    const clampPan = (nextPan: Point): Point => {
        const limits = getPanLimits()

        return {
            x: Math.max(-limits.x, Math.min(limits.x, nextPan.x)),
            y: Math.max(-limits.y, Math.min(limits.y, nextPan.y)),
        }
    }

    const applyZoom = (nextZoomIndex: number) => {
        setZoomIndex(nextZoomIndex)
        setPan((prev) => clampPan(prev))
    }

    const zoomIn = () => {
        const nextZoomIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1)
        applyZoom(nextZoomIndex)
    }

    const zoomOut = () => {
        const nextZoomIndex = Math.max(zoomIndex - 1, 0)
        applyZoom(nextZoomIndex)
    }

    const zoomTo110 = () => {
        const nextZoomIndex = ZOOM_LEVELS.findIndex((value) => value === 1.1)
        applyZoom(nextZoomIndex === -1 ? 1 : nextZoomIndex)
    }

    const toggleZoom = () => {
        if (zoom === 1) {
            zoomTo110()
            return
        }

        applyZoom(0)
    }

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.deltaY < 0) {
            const nextZoomIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1)
            if (nextZoomIndex !== zoomIndex) {
                applyZoom(nextZoomIndex)
            }
        } else if (e.deltaY > 0) {
            const nextZoomIndex = Math.max(zoomIndex - 1, 0)
            if (nextZoomIndex !== zoomIndex) {
                applyZoom(nextZoomIndex)
            }
        }
    }

    const startDrag = (clientX: number, clientY: number) => {
        if (zoom <= 1) return

        setIsDragging(true)
        dragStartRef.current = { x: clientX, y: clientY }
        dragPanStartRef.current = pan
    }

    const moveDrag = (clientX: number, clientY: number) => {
        if (!isDragging || zoom <= 1) return

        const dx = clientX - dragStartRef.current.x
        const dy = clientY - dragStartRef.current.y

        setPan(
            clampPan({
                x: dragPanStartRef.current.x + dx,
                y: dragPanStartRef.current.y + dy,
            })
        )
    }

    const endDrag = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            moveDrag(e.clientX, e.clientY)
        }

        const handleMouseUp = () => {
            endDrag()
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, zoom, pan])

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0]
        touchStartX.current = touch.clientX
        touchStartY.current = touch.clientY

        const now = Date.now()
        if (now - lastTapRef.current < 300) {
            e.preventDefault()
            toggleZoom()
        }
        lastTapRef.current = now

        if (zoom > 1) {
            startDrag(touch.clientX, touch.clientY)
        }
    }

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (zoom > 1) {
            const touch = e.touches[0]
            moveDrag(touch.clientX, touch.clientY)
        }
    }

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (zoom > 1) {
            endDrag()
            return
        }

        if (!showNavigation) return
        if (touchStartX.current === null || touchStartY.current === null) return

        const touch = e.changedTouches[0]
        const diffX = touch.clientX - touchStartX.current
        const diffY = touch.clientY - touchStartY.current

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) onNext()
            else onPrev()
        }

        touchStartX.current = null
        touchStartY.current = null
    }

    const handleViewportClick = (e: ReactMouseEvent<HTMLDivElement>) => {
        e.stopPropagation()

        if (mouseDownStartedInsideImageRef.current) {
            mouseDownStartedInsideImageRef.current = false
            return
        }

        const bounds = imageBoundsRef.current
        if (!bounds) {
            onClose()
            return
        }

        const x = e.clientX - bounds.left
        const y = e.clientY - bounds.top
        const width = bounds.width
        const height = bounds.height

        if (x < 0 || x > width || y < 0 || y > height) {
            onClose()
            return
        }

        const leftZone = width * 0.2
        const rightZoneStart = width * 0.8

        if (showNavigation && x <= leftZone) {
            onPrev()
            return
        }

        if (showNavigation && x >= rightZoneStart) {
            onNext()
            return
        }

        zoomTo110()
    }

    return (
        <div
            className="fixed inset-0 z-[9999] bg-zinc-950/95"
            onMouseDown={() => {
                mouseDownStartedInsideImageRef.current = false
            }}
            onClick={onClose}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
                className="absolute right-2 top-2 z-[10001] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-900/75 text-white transition hover:bg-zinc-800 sm:right-4 sm:top-4 sm:h-11 sm:w-11 lg:right-6 lg:top-6"
                aria-label={isBg ? "Затвори" : "Close"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>

            <div className="absolute right-14 top-2 z-[10001] flex items-center gap-2 sm:right-20 sm:top-4 lg:right-24 lg:top-6">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        zoomOut()
                    }}
                    className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-900/75 text-white transition hover:bg-zinc-800 sm:h-11 sm:w-11"
                    aria-label={isBg ? "Намали" : "Zoom out"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                    >
                        <path d="M5 12h14" />
                    </svg>
                </button>

                <div className="hidden min-w-[64px] justify-center rounded-full border border-white/20 bg-zinc-900/75 px-3 py-2 text-xs font-bold text-white sm:flex">
                    {Math.round(zoom * 100)}%
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        zoomIn()
                    }}
                    className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-900/75 text-white transition hover:bg-zinc-800 sm:h-11 sm:w-11"
                    aria-label={isBg ? "Увеличи" : "Zoom in"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                    >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                    </svg>
                </button>
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-0 py-14 sm:px-20 sm:py-20 lg:px-24 lg:py-24">
                <div className="flex w-full max-w-full flex-col items-center">
                    <div
                        ref={viewportRef}
                        className="relative h-[calc(100vh-180px)] w-full overflow-hidden sm:h-[calc(100vh-220px)] sm:max-w-full"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={handleViewportClick}
                        onWheel={handleWheel}
                    >
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <div
                                className={`absolute left-1/2 top-1/2 ${
                                    zoom > 1
                                        ? isDragging
                                            ? "cursor-grabbing"
                                            : "cursor-grab"
                                        : "cursor-zoom-in"
                                }`}
                                style={{
                                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                                    transformOrigin: "center center",
                                }}
                                onMouseDown={(e) => {
                                    mouseDownStartedInsideImageRef.current = true
                                    e.preventDefault()
                                    e.stopPropagation()
                                    startDrag(e.clientX, e.clientY)
                                }}
                            >
                                <img
                                    ref={imageRef}
                                    src={item.src}
                                    alt={item.title}
                                    className="block max-h-[calc(100vh-180px)] max-w-[98vw] select-none object-contain sm:max-h-[calc(100vh-220px)] sm:max-w-[96vw]"
                                    draggable={false}
                                    onLoad={(e) => {
                                        imageBoundsRef.current = e.currentTarget.getBoundingClientRect()
                                    }}
                                />
                            </div>

                            {showNavigation && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onPrev()
                                        }}
                                        className="absolute left-2 top-1/2 z-[10001] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-900/75 text-white transition hover:bg-zinc-800 sm:inline-flex sm:left-4 sm:h-11 sm:w-11 lg:left-6 lg:h-12 lg:w-12"
                                        aria-label={isBg ? "Предишна" : "Previous"}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-5 w-5 sm:h-6 sm:w-6"
                                        >
                                            <path d="m15 18-6-6 6-6" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onNext()
                                        }}
                                        className="absolute right-2 top-1/2 z-[10001] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-900/75 text-white transition hover:bg-zinc-800 sm:inline-flex sm:right-4 sm:h-11 sm:w-11 lg:right-6 lg:h-12 lg:w-12"
                                        aria-label={isBg ? "Следваща" : "Next"}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-5 w-5 sm:h-6 sm:w-6"
                                        >
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div
                        className="mt-4 px-4 text-center sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/65 sm:text-[11px] sm:tracking-[0.3em]">
                            {item.categoryLabel}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white sm:text-base lg:text-lg">
                            {item.albumLabel}
                        </p>

                        <p className="mt-1 text-xs text-white/70 sm:text-sm">
                            {selectedIndex !== null ? `${selectedIndex + 1} / ${totalItems}` : ""}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}