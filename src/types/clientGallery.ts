export type UserClientGalleryStatus = "Pending" | "Processed" | "Expired" | 1 | 2 | 3

export type AdminGalleryUserOptionDto = {
    id: string
    email: string
}

export type GalleryUserAccessDto = {
    userId: string
    email: string
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
}

export type MyClientGalleryDto = {
    id: number
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    isActive: boolean
    isPublic?: boolean
    isPublished?: boolean
    portfolioCategoryId?: number | null
    portfolioCategoryName?: string | null
    portfolioCategoryNameEn?: string | null
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
    remainingDownloadDays?: number | null
    isExpired: boolean
    isUserUploaded: boolean
    ownerUserId?: string | null
    ownerEmail?: string | null
    expiresAtUtc?: string | null
    remainingLifetimeDays?: number | null
    userGalleryStatus: UserClientGalleryStatus
}

export type ClientPhotoDto = {
    id: number
    previewUrl: string
    originalUrl?: string | null
    downloadUrl?: string | null
    altText?: string | null
    caption?: string | null
    canDownload: boolean
    displayOrder: number
    description?: string | null
    isPublished: boolean
    showInPublicGallery: boolean
    visibleToAllAuthorizedUsers: boolean
    allowedUserIds: string[]
}

export type ClientGalleryDetailsDto = {
    id: number
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    isActive: boolean
    isPublic?: boolean
    isPublished?: boolean
    portfolioCategoryId?: number | null
    previewEnabled: boolean
    downloadEnabled: boolean
    downloadExpiresAtUtc?: string | null
    remainingDownloadDays?: number | null
    isExpired: boolean
    isUserUploaded: boolean
    ownerUserId?: string | null
    ownerEmail?: string | null
    expiresAtUtc?: string | null
    remainingLifetimeDays?: number | null
    userGalleryStatus: UserClientGalleryStatus
    availableUsers: AdminGalleryUserOptionDto[]
    userAccesses?: GalleryUserAccessDto[]
    photos: ClientPhotoDto[]
}

export type CreateUserClientGalleryRequest = {
    title: string
    description?: string | null
}

export type AdminUpdateClientPhotoRequest = {
    altText?: string | null
    caption?: string | null
    description?: string | null
    displayOrder?: number
    isCover?: boolean | null
    isPublished?: boolean | null
    showInPublicGallery?: boolean | null
    visibleToAllAuthorizedUsers?: boolean | null
    allowedUserIds?: string[]
}

export type CreateAdminClientGalleryRequest = {
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    isActive: boolean
    isPublic?: boolean
    isPublished?: boolean
    portfolioCategoryId?: number | null
    userAccesses?: GalleryUserAccessDto[]
}

export type UpdateAdminClientGalleryRequest = {
    title: string
    titleEn?: string | null
    description?: string | null
    coverImageUrl?: string | null
    isActive: boolean
    isPublic?: boolean
    isPublished?: boolean
    portfolioCategoryId?: number | null
    userAccesses?: GalleryUserAccessDto[]
}