export type GalleryAccessDto = {
    userId: string
    userEmail: string
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
    isExpired: boolean
}

export type GrantGalleryAccessRequest = {
    userEmail: string
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
}

export type UpdateGalleryAccessRequest = {
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
}

export type SetGalleryCoverRequest = {
    coverImageUrl: string
}

export type ReorderGalleryPhotosRequest = {
    orderedPhotoIds: number[]
}

export type PortfolioCategoryDto = {
    id: number
    key: string
    name: string
    nameEn?: string | null
    description?: string | null
    displayOrder: number
    isActive: boolean
}

export type PortfolioAlbumDto = {
    id: number
    portfolioCategoryId: number
    slug: string
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    displayOrder: number
    columnNumber?: number | null
    isPublished: boolean
    allowClientAccess?: boolean
    isActive?: boolean
    isPublic?: boolean
    portfolioCategory?: PortfolioCategoryDto | null
}

export type PagedResultDto<T> = {
    page: number
    pageSize: number
    total: number
    items: T[]
}
