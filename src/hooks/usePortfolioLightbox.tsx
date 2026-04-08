import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

export function usePortfolioLightbox(
    selectedIndex: number | null,
    totalItems: number,
    setSelectedIndex: Dispatch<SetStateAction<number | null>>
) {
    useEffect(() => {
        if (selectedIndex === null) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedIndex(null)
            }

            if (e.key === "ArrowRight") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === totalItems - 1 ? 0 : prev + 1
                })
            }

            if (e.key === "ArrowLeft") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === 0 ? totalItems - 1 : prev - 1
                })
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedIndex, totalItems, setSelectedIndex])
}