export type PortfolioCategory = {
    id: number
    key: string
    name: string
    nameEn?: string
    description?: string
    displayOrder: number
    isActive: boolean
}

export type PortfolioAlbum = {
    id: number
    portfolioCategoryId: number
    slug: string
    title: string
    description?: string
    coverImageUrl?: string
    displayOrder: number
    isPublished: boolean
    createdAtUtc?: string
}

export type PortfolioImage = {
    id: number
    portfolioAlbumId: number
    imageUrl: string
    thumbnailUrl?: string
    altText?: string
    caption?: string
    name?: string
    mediaType?: string
    contentType?: string | null
    width?: number
    height?: number
    displayOrder: number
    isCover: boolean
    isPublished: boolean
    createdAtUtc?: string
}

export type CategoryTab = {
    id?: number
    key: string
    label: string
    labelEn?: string
    displayOrder?: number
    isActive?: boolean
}

export type AlbumTab = {
    key: string
    label: string
}

export type PortfolioItem = {
    id: number
    src: string
    originalSrc?: string
    category: string
    categoryLabel: string
    albumKey: string
    albumLabel: string
    title: string
    mediaType?: string
    contentType?: string | null
}

export type PortfolioAlbumCard = {
    id: number
    slug: string
    title: string
    category: string
    categoryLabel: string
    coverSrc: string
    imageCount: number
}
