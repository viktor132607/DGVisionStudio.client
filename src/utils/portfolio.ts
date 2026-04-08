import type {
    AlbumTab,
    PortfolioAlbum,
    PortfolioCategory,
    PortfolioImage,
    PortfolioItem,
} from "../types/portfolio"

export function normalizeHash(value: string) {
    return value.replace("#", "").trim().toLowerCase()
}

export function buildPortfolioItems(
    activeCategories: PortfolioCategory[],
    albumsData: PortfolioAlbum[],
    imagesData: PortfolioImage[]
): PortfolioItem[] {
    const categoriesById = new Map(activeCategories.map((category) => [category.id, category]))
    const publishedAlbums = albumsData
        .filter((album) => album.isPublished)
        .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)

    const publishedImagesByAlbum = new Map<number, PortfolioImage[]>()

    imagesData
        .filter((image) => image.isPublished)
        .forEach((image) => {
            const current = publishedImagesByAlbum.get(image.portfolioAlbumId) ?? []
            current.push(image)
            publishedImagesByAlbum.set(image.portfolioAlbumId, current)
        })

    for (const [, items] of publishedImagesByAlbum) {
        items.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
    }

    const result: PortfolioItem[] = []

    for (const album of publishedAlbums) {
        const category = categoriesById.get(album.portfolioCategoryId)
        if (!category) continue

        const albumImages = publishedImagesByAlbum.get(album.id) ?? []

        albumImages.forEach((image, index) => {
            const title =
                image.altText?.trim() ||
                image.caption?.trim() ||
                `${album.title} ${index + 1}`

            result.push({
                id: image.id,
                src: image.thumbnailUrl?.trim() || image.imageUrl,
                category: category.key,
                categoryLabel: category.name,
                albumKey: album.slug,
                albumLabel: album.title,
                title,
            })
        })
    }

    return result
}

export function buildAlbumTabs(
    activeCategory: string,
    portfolioItems: PortfolioItem[],
    isBg: boolean
): AlbumTab[] {
    const sourceItems =
        activeCategory === "all"
            ? portfolioItems
            : portfolioItems.filter((item) => item.category === activeCategory)

    const uniqueAlbums = Array.from(
        new Map(
            sourceItems.map((item) => [
                item.albumKey,
                {
                    key: item.albumKey,
                    label: item.albumLabel,
                },
            ])
        ).values()
    )

    return [{ key: "all", label: isBg ? "Всички албуми" : "All Albums" }, ...uniqueAlbums]
}

export function filterPortfolioItems(
    portfolioItems: PortfolioItem[],
    activeCategory: string,
    activeAlbum: string
) {
    return portfolioItems.filter((item) => {
        const categoryMatch = activeCategory === "all" || item.category === activeCategory
        const albumMatch = activeAlbum === "all" || item.albumKey === activeAlbum
        return categoryMatch && albumMatch
    })
}