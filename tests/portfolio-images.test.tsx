import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import GalleryImage from "../src/components/GalleryImage"
import PortfolioGrid from "../src/components/portfolio/PortfolioGrid"
import PortfolioLightbox from "../src/components/portfolio/PortfolioLightbox"
import type { PortfolioItem } from "../src/types/portfolio"

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg" } }) }))
const item: PortfolioItem = {
    id: 1, src: "https://example.test/preview.jpg", originalSrc: "https://example.test/original.jpg",
    title: "Portrait", category: "portraits", categoryLabel: "Portraits", albumKey: "session", albumLabel: "Session",
}
const img = () => screen.getByRole("img")
afterEach(() => { cleanup(); vi.useRealTimers() })

describe("gallery image recovery", () => {
    it("opens the original in the lightbox and falls back to the preview", () => {
        render(<PortfolioLightbox isBg={false} item={item} selectedIndex={0} totalItems={1}
            showNavigation={false} onClose={vi.fn()} onPrev={vi.fn()} onNext={vi.fn()} />)
        expect(img().getAttribute("src")).toBe(item.originalSrc)
        fireEvent.error(img())
        expect(img().getAttribute("src")).toBe(item.src)
        fireEvent.load(img())
        expect(screen.queryByRole("status")).toBeNull()
    })

    it("loads the original when the thumbnail fails instead of hiding the photo", () => {
        render(<PortfolioGrid items={[item]} onSelect={vi.fn()} />)
        fireEvent.error(img())
        expect(img().getAttribute("src")).toBe(item.originalSrc)
        fireEvent.load(img())
        expect(img().classList.contains("opacity-0")).toBe(false)
        expect(screen.queryByRole("status")).toBeNull()
    })

    it("retries transient errors once, then displays a failure rather than a blank tile", () => {
        vi.useFakeTimers()
        render(<PortfolioGrid items={[item]} onSelect={vi.fn()} />)
        fireEvent.error(img())
        fireEvent.error(img())
        expect(screen.queryByRole("status")).toBeNull()
        act(() => vi.advanceTimersByTime(1500))
        expect(img().getAttribute("src")).toBe(item.src)
        fireEvent.error(img())
        fireEvent.error(img())
        expect(screen.getByRole("status").textContent).toBe("Снимката не може да се зареди")
        expect(vi.getTimerCount()).toBe(0)
    })

    it("deduplicates identical original and preview URLs and cancels a retry after success", () => {
        vi.useFakeTimers()
        render(<GalleryImage src={item.src} fallbackSrc={item.src} alt="Portrait" />)
        const first = img()
        fireEvent.error(first)
        expect(vi.getTimerCount()).toBe(1)
        fireEvent.load(first)
        act(() => vi.advanceTimersByTime(1500))
        expect(img()).toBe(first)
        expect(vi.getTimerCount()).toBe(0)
    })

    it("clears retries and error state when a failed upload is replaced", () => {
        vi.useFakeTimers()
        const { rerender, unmount } = render(<GalleryImage src={item.src} alt="Portrait" />)
        fireEvent.error(img())
        rerender(<GalleryImage src={item.originalSrc} alt="Portrait" />)
        expect(img().getAttribute("src")).toBe(item.originalSrc)
        expect(vi.getTimerCount()).toBe(0)
        fireEvent.error(img())
        unmount()
        expect(vi.getTimerCount()).toBe(0)
    })
})
