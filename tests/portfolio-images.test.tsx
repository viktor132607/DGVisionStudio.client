import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import PortfolioGrid from "../src/components/portfolio/PortfolioGrid"
import PortfolioLightbox from "../src/components/portfolio/PortfolioLightbox"
import type { PortfolioItem } from "../src/types/portfolio"

const item: PortfolioItem = {
    id: 1, src: "https://example.test/preview.jpg", originalSrc: "https://example.test/original.jpg",
    title: "Portrait", category: "portraits", categoryLabel: "Portraits", albumKey: "session", albumLabel: "Session",
}

afterEach(cleanup)

describe("portfolio image loading", () => {
    it("opens the original and falls back to the preview only once", () => {
        render(<PortfolioLightbox isBg={false} item={item} selectedIndex={0} totalItems={1}
            showNavigation={false} onClose={vi.fn()} onPrev={vi.fn()} onNext={vi.fn()} />)
        const image = screen.getByRole("img")
        expect(image.getAttribute("src")).toBe(item.originalSrc)
        fireEvent.error(image)
        expect(image.getAttribute("src")).toBe(item.src)
        fireEvent.error(image)
        expect(image.getAttribute("src")).toBe(item.src)
    })

    it("tries the original when a thumbnail fails and restores visibility after loading", () => {
        render(<PortfolioGrid items={[item]} onSelect={vi.fn()} />)
        const image = screen.getByRole("img")
        fireEvent.error(image)
        expect(image.getAttribute("src")).toBe(item.originalSrc)
        fireEvent.error(image)
        expect(image.classList.contains("opacity-0")).toBe(true)
        fireEvent.load(image)
        expect(image.classList.contains("opacity-0")).toBe(false)
        expect(image.getAttribute("alt")).toBe(item.title)
    })

    it("retries a replacement source after the previous thumbnail and original failed", () => {
        const { rerender } = render(<PortfolioGrid items={[item]} onSelect={vi.fn()} />)
        fireEvent.error(screen.getByRole("img"))
        fireEvent.error(screen.getByRole("img"))
        const replacement = { ...item, src: "https://example.test/new-preview.jpg", originalSrc: "https://example.test/new-original.jpg" }
        rerender(<PortfolioGrid items={[replacement]} onSelect={vi.fn()} />)
        const image = screen.getByRole("img")
        expect(image.classList.contains("opacity-0")).toBe(false)
        fireEvent.error(image)
        expect(image.getAttribute("src")).toBe(replacement.originalSrc)
    })
})
