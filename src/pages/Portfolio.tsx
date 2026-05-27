import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"
import PortfolioAlbumTabs from "../components/portfolio/PortfolioAlbumTabs"
import PortfolioCategoryTabs from "../components/portfolio/PortfolioCategoryTabs"
import PortfolioEmptyState from "../components/portfolio/PortfolioEmptyState"
import PortfolioGrid from "../components/portfolio/PortfolioGrid"
import PortfolioLightbox from "../components/portfolio/PortfolioLightbox"
import PortfolioAlbumGrid from "../components/portfolio/PortfolioAlbumGrid"
import { usePortfolioData } from "../hooks/usePortfolioData"
import { usePortfolioLightbox } from "../hooks/usePortfolioLightbox"
import type {
    AlbumTab,
    CategoryTab,
    PortfolioAlbumCard,
    PortfolioItem,
} from "../types/portfolio"

function normalizeHash(value: string) {
    return value.replace("#", "").trim().toLowerCase()
}

export default function Portfolio() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const { categoriesData, albumsData, imagesData } = usePortfolioData()

    const [activeCategory, setActiveCategory] = useState<string>("all")
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const portfolioJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: isBg ? "Портфолио" : "Portfolio",
        url: "https://dgvisionstudio.com/portfolio",
        description: isBg
            ? "Разгледайте портфолиото на DG Vision Studio."
            : "Explore the DG Vision Studio portfolio.",
        isPartOf: {
            "@type": "WebSite",
            name: "DG Vision Studio",
            url: "https://dgvisionstudio.com",
        },
    }

    const activeCategories = useMemo(() => {
        return categoriesData
            .filter((category) => category.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
    }, [categoriesData])

    useEffect(() => {
        const hash = normalizeHash(location.hash)

        if (!hash || hash === "all") {
            setActiveCategory("all")
            return
        }

        const exists = activeCategories.some((category) => category.key.toLowerCase() === hash)
        setActiveCategory(exists ? hash : "all")
    }, [location.hash, activeCategories])

    const categories = useMemo<CategoryTab[]>(() => {
        return [
            {
                id: 0,
                key: "all",
                label: isBg ? "Всички" : "All",
                labelEn: "All",
                displayOrder: -1,
                isActive: true,
            },
            ...activeCategories.map((category) => ({
                id: category.id,
                key: category.key,
                label: isBg ? category.name : category.nameEn?.trim() || category.name,
                labelEn: category.nameEn?.trim() || category.name,
                displayOrder: category.displayOrder,
                isActive: category.isActive,
            })),
        ]
    }, [activeCategories, isBg])

    const publishedImagesByAlbum = useMemo(() => {
        const map = new Map<number, typeof imagesData>()

        imagesData
            .filter((image) => image.isPublished)
            .forEach((image) => {
                const current = map.get(image.portfolioAlbumId) ?? []
                current.push(image)
                map.set(image.portfolioAlbumId, current)
            })

        for (const [, items] of map) {
            items.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
        }

        return map
    }, [imagesData])

    const albumCards = useMemo<PortfolioAlbumCard[]>(() => {
        const categoriesById = new Map(activeCategories.map((category) => [category.id, category]))

        return albumsData
            .filter((album) => album.isPublished)
            .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
            .map((album) => {
                const category = categoriesById.get(album.portfolioCategoryId)
                if (!category) return null

                const albumImages = publishedImagesByAlbum.get(album.id) ?? []
                const firstImage = albumImages[0]

                return {
                    id: album.id,
                    slug: album.slug,
                    title: album.title,
                    category: category.key,
                    categoryLabel: isBg ? category.name : category.nameEn?.trim() || category.name,
                    coverSrc:
                        album.coverImageUrl?.trim() ||
                        firstImage?.thumbnailUrl?.trim() ||
                        firstImage?.imageUrl ||
                        "",
                    imageCount: albumImages.length,
                }
            })
            .filter(
                (item): item is PortfolioAlbumCard =>
                    item !== null && item.coverSrc.trim().length > 0 && item.imageCount > 0
            )
    }, [activeCategories, albumsData, publishedImagesByAlbum, isBg])

    const filteredAlbumCards = useMemo(() => {
        return albumCards.filter((album) => {
            return activeCategory === "all" || album.category === activeCategory
        })
    }, [albumCards, activeCategory])

    const selectedAlbum = useMemo(() => {
        if (selectedAlbumId === null) return null
        return albumsData.find((album) => album.id === selectedAlbumId) ?? null
    }, [albumsData, selectedAlbumId])

    const albumTabs = useMemo<AlbumTab[]>(() => {
        const sourceAlbums =
            activeCategory === "all"
                ? filteredAlbumCards
                : filteredAlbumCards.filter((album) => album.category === activeCategory)

        return sourceAlbums.map((album) => ({
            key: String(album.id),
            label: album.title,
        }))
    }, [activeCategory, filteredAlbumCards])

    const selectedAlbumImages = useMemo<PortfolioItem[]>(() => {
        if (!selectedAlbum) return []

        const category = activeCategories.find((item) => item.id === selectedAlbum.portfolioCategoryId)
        if (!category) return []

        const albumImages = publishedImagesByAlbum.get(selectedAlbum.id) ?? []

        return albumImages.map((image, index) => ({
            id: image.id,
            src: image.thumbnailUrl?.trim() || image.imageUrl,
            category: category.key,
            categoryLabel: isBg ? category.name : category.nameEn?.trim() || category.name,
            albumKey: selectedAlbum.slug,
            albumLabel: selectedAlbum.title,
            title:
                image.altText?.trim() ||
                image.caption?.trim() ||
                `${selectedAlbum.title} ${index + 1}`,
        }))
    }, [activeCategories, publishedImagesByAlbum, selectedAlbum, isBg])

    const selectedItem = selectedIndex !== null ? selectedAlbumImages[selectedIndex] : null

    useEffect(() => {
        setSelectedAlbumId(null)
        setSelectedIndex(null)
    }, [activeCategory])

    useEffect(() => {
        setSelectedIndex(null)
    }, [selectedAlbumId])

    usePortfolioLightbox(selectedIndex, selectedAlbumImages.length, setSelectedIndex)

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        setSelectedAlbumId(null)
        setSelectedIndex(null)

        const nextHash = category === "all" ? "" : `#${category}`
        const nextUrl = `${window.location.pathname}${nextHash}`
        window.history.replaceState(null, "", nextUrl)
    }

    return (
        <>
            <Seo
                title={isBg ? "Портфолио" : "Portfolio"}
                description={
                    isBg
                        ? "Разгледайте портфолиото на DG Vision Studio."
                        : "Explore the DG Vision Studio portfolio."
                }
                canonical="/portfolio"
                image="/og-cover.jpg"
                type="website"
                jsonLd={portfolioJsonLd}
            />

            <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100 dark:bg-zinc-900">
                <div className="border-b border-neutral-300 bg-neutral-50 px-[5mm] py-8 dark:border-zinc-700 dark:bg-zinc-800 sm:py-10 lg:py-12">
                    <div className="w-full">
                        <h1 className="text-center text-[28px] font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-white sm:text-[36px] sm:tracking-[0.14em] lg:text-[44px] xl:text-[52px]">
                            {isBg ? "Портфолио" : "Portfolio"}
                        </h1>
                    </div>
                </div>

                <PortfolioCategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onChange={handleCategoryChange}
                />

                {selectedAlbum ? (
                    <>
                        <div className="border-b border-neutral-300 bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAlbumId(null)}
                                    className="inline-flex items-center rounded-full border border-neutral-400 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-900 transition hover:border-neutral-950 hover:bg-neutral-200 dark:border-zinc-600 dark:text-white dark:hover:border-white dark:hover:bg-zinc-800 sm:text-xs"
                                >
                                    {isBg ? "Назад към албумите" : "Back to albums"}
                                </button>

                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-zinc-400 sm:text-xs">
                                        {selectedAlbum.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <PortfolioAlbumTabs
                            albums={albumTabs}
                            activeAlbum={String(selectedAlbumId)}
                            onChange={(value) => setSelectedAlbumId(Number(value))}
                        />

                        {selectedAlbumImages.length > 0 ? (
                            <PortfolioGrid items={selectedAlbumImages} onSelect={setSelectedIndex} />
                        ) : (
                            <PortfolioEmptyState isBg={isBg} />
                        )}
                    </>
                ) : filteredAlbumCards.length > 0 ? (
                    <PortfolioAlbumGrid
                        items={filteredAlbumCards}
                        onSelect={setSelectedAlbumId}
                    />
                ) : (
                    <PortfolioEmptyState isBg={isBg} />
                )}

                {selectedItem && (
                    <PortfolioLightbox
                        isBg={isBg}
                        item={selectedItem}
                        selectedIndex={selectedIndex}
                        totalItems={selectedAlbumImages.length}
                        onClose={() => setSelectedIndex(null)}
                        onPrev={() =>
                            setSelectedIndex((prev) =>
                                prev === null ? prev : prev === 0 ? selectedAlbumImages.length - 1 : prev - 1
                            )
                        }
                        onNext={() =>
                            setSelectedIndex((prev) =>
                                prev === null ? prev : prev === selectedAlbumImages.length - 1 ? 0 : prev + 1
                            )
                        }
                        showNavigation={selectedAlbumImages.length > 1}
                    />
                )}
            </div>
        </>
    )
}