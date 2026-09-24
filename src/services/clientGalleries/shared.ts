import { resolveAssetUrl } from "../../utils/resolveAssetUrl"
import type {
    ClientGalleryDetailsDto,
    ClientPhotoDto,
    CreateAdminClientGalleryRequest,
    UpdateAdminClientGalleryRequest,
} from "../../types/clientGallery"
import type { PortfolioAlbumDto } from "./types"

export const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "")
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || `${API_ROOT}/api`).replace(/\/+$/, "")

const MAX_PHOTO_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024

export function validatePhotoFile(file: File): void {
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed.")
    }

    if (file.size > MAX_PHOTO_UPLOAD_SIZE_BYTES) {
        throw new Error("Photo is too large. Maximum size is 20MB.")
    }
}

function normalizeApiUrl(url?: string | null): string | null | undefined {
    if (!url) return url

    if (url.startsWith("/api/")) {
        return `${API_ROOT}${url}`
    }

    return resolveAssetUrl(url)
}

export function toStoredImagePath(url?: string | null): string {
    if (!url) return ""

    const trimmed = url.trim().replaceAll("\\", "/")

    try {
        const parsed = new URL(trimmed)
        return parsed.pathname.replace(/^\/+/, "")
    } catch {
        return trimmed.replace(/^\/+/, "")
    }
}

function toGalleryTypeValue(value: unknown): number {
    if (value === "Photoshoot") return 1
    if (value === "ClientPrintUpload") return 2

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 1
}

function toUserGalleryStatusValue(value: unknown): number {
    if (value === "Pending") return 1
    if (value === "Processed") return 2
    if (value === "Expired") return 3
    if (value === "PhotoshootUploaded") return 4
    if (value === "PhotoshootInProgress") return 5
    if (value === "PhotoshootReadyForPickup") return 6
    if (value === "PhotoshootCancelled") return 7

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 1
}

export function normalizeAdminGalleryPayload<
    T extends CreateAdminClientGalleryRequest | UpdateAdminClientGalleryRequest
>(payload: T): T {
    return {
        ...payload,
        galleryType: toGalleryTypeValue(payload.galleryType) as T["galleryType"],
        userGalleryStatus: toUserGalleryStatusValue(payload.userGalleryStatus) as T["userGalleryStatus"],
    }
}

export function normalizePhoto(photo: ClientPhotoDto): ClientPhotoDto {
    return {
        ...photo,
        previewUrl: normalizeApiUrl(photo.previewUrl) || "",
        originalUrl: normalizeApiUrl(photo.originalUrl),
        downloadUrl: photo.downloadUrl?.startsWith("/api/")
            ? `${API_ROOT}${photo.downloadUrl}`
            : photo.downloadUrl,
    }
}

export function normalizeGallery<T extends { coverImageUrl?: string | null }>(gallery: T): T {
    return {
        ...gallery,
        coverImageUrl: gallery.coverImageUrl ? resolveAssetUrl(gallery.coverImageUrl) : gallery.coverImageUrl,
    }
}

export function normalizePortfolioAlbum(album: PortfolioAlbumDto): PortfolioAlbumDto {
    return {
        ...album,
        coverImageUrl: album.coverImageUrl ? resolveAssetUrl(album.coverImageUrl) : album.coverImageUrl,
        isPublic:
            typeof album.isPublic === "boolean"
                ? album.isPublic
                : Boolean(album.portfolioCategoryId || album.isPublished),
        isActive:
            typeof album.isActive === "boolean"
                ? album.isActive
                : typeof album.allowClientAccess === "boolean"
                  ? album.allowClientAccess
                  : true,
    }
}

type GalleryVisibility = ClientGalleryDetailsDto & {
    isPublic?: boolean
    portfolioCategoryId?: number
    isPublished?: boolean
    isActive?: boolean
    allowClientAccess?: boolean
}

export function normalizeGalleryDetails(gallery: ClientGalleryDetailsDto): ClientGalleryDetailsDto {
    const normalized = normalizeGallery(gallery)
    const visibility = gallery as GalleryVisibility

    return {
        ...normalized,
        photos: Array.isArray(gallery.photos) ? gallery.photos.map(normalizePhoto) : [],
        isPublic:
            typeof visibility.isPublic === "boolean"
                ? visibility.isPublic
                : Boolean(visibility.portfolioCategoryId || visibility.isPublished),
        isActive:
            typeof visibility.isActive === "boolean"
                ? visibility.isActive
                : typeof visibility.allowClientAccess === "boolean"
                  ? visibility.allowClientAccess
                  : true,
    } as ClientGalleryDetailsDto
}

export async function parseJsonSafe<T>(response: Response): Promise<T | null> {
    return (await response.json().catch(() => null)) as T | null
}

export function getErrorMessage(
    data: { message?: string; details?: string } | null,
    fallback: string
): string {
    return data?.details || data?.message || fallback
}
