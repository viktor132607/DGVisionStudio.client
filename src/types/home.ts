export type QuickLink = {
    href: string
    bg: string
    en: string
}

export type HomeSlideshowImage = {
    id: number
    imageUrl: string
    thumbnailUrl?: string
    altText?: string
    caption?: string
    displayOrder: number
    isPublished: boolean
    isSelected?: boolean
    slideshowOrder?: number | null
    portfolioAlbumId?: number
    albumTitle?: string
    categoryName?: string
    categoryNameEn?: string
}

export type HomeDynamicCard = {
    id: number
    href: string
    image: string
    titleBg: string
    titleEn: string
    descBg: string
    descEn: string
}
