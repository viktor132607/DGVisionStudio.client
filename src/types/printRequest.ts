export type CreatePrintRequestItemDto = {
    portfolioImageId: number
    quantity: number
    size: string
    paperType?: string | null
    notes?: string | null
}

export type CreatePrintRequestDto = {
    portfolioAlbumId: number
    fullName: string
    email: string
    phone?: string | null
    notes?: string | null
    items: CreatePrintRequestItemDto[]
}

export type PrintRequestItemDto = {
    id: number
    portfolioImageId: number
    imageUrl: string
    thumbnailUrl?: string | null
    quantity: number
    size: string
    paperType?: string | null
    notes?: string | null
}

export type PrintRequestDto = {
    id: number
    userId: string
    userEmail: string
    portfolioAlbumId: number
    albumTitle: string
    fullName: string
    email: string
    phone?: string | null
    notes?: string | null
    status: string
    isSeenByAdmin: boolean
    createdAtUtc: string
    updatedAtUtc?: string | null
    items: PrintRequestItemDto[]
}

export type UpdatePrintRequestStatusDto = {
    status: "New" | "InProgress" | "Completed" | "Cancelled" | string
}