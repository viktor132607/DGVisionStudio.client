import { apiFetch } from "./api"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"
import type {
    AdminUpdateClientPhotoRequest,
    ClientGalleryDetailsDto,
    ClientPhotoDto,
    CreateAdminClientGalleryRequest,
    CreateUserClientGalleryRequest,
    MyClientGalleryDto,
    UpdateAdminClientGalleryRequest,
} from "../types/clientGallery"

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

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "")
const API_BASE = (import.meta.env.VITE_API_BASE_URL || `${API_ROOT}/api`).replace(/\/+$/, "")
const MAX_PHOTO_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024

function validatePhotoFile(file: File) {
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

function toStoredImagePath(url?: string | null): string {
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

function normalizeAdminGalleryPayload<
    T extends CreateAdminClientGalleryRequest | UpdateAdminClientGalleryRequest
>(payload: T): T {
    return {
        ...payload,
        galleryType: toGalleryTypeValue(payload.galleryType) as T["galleryType"],
        userGalleryStatus: toUserGalleryStatusValue(payload.userGalleryStatus) as T["userGalleryStatus"],
    }
}

function normalizePhoto(photo: ClientPhotoDto): ClientPhotoDto {
    return {
        ...photo,
        previewUrl: normalizeApiUrl(photo.previewUrl) || "",
        originalUrl: normalizeApiUrl(photo.originalUrl),
        downloadUrl: photo.downloadUrl?.startsWith("/api/")
            ? `${API_ROOT}${photo.downloadUrl}`
            : photo.downloadUrl,
    }
}

function normalizeGallery<T extends { coverImageUrl?: string | null }>(gallery: T): T {
    return {
        ...gallery,
        coverImageUrl: gallery.coverImageUrl ? resolveAssetUrl(gallery.coverImageUrl) : gallery.coverImageUrl,
    }
}

function normalizePortfolioAlbum(album: PortfolioAlbumDto): PortfolioAlbumDto {
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

function normalizeGalleryDetails(gallery: ClientGalleryDetailsDto): ClientGalleryDetailsDto {
    const normalized = normalizeGallery(gallery)

    return {
        ...normalized,
        photos: Array.isArray(gallery.photos) ? gallery.photos.map(normalizePhoto) : [],
        isPublic:
            typeof (gallery as any).isPublic === "boolean"
                ? (gallery as any).isPublic
                : Boolean((gallery as any).portfolioCategoryId || (gallery as any).isPublished),
        isActive:
            typeof (gallery as any).isActive === "boolean"
                ? (gallery as any).isActive
                : typeof (gallery as any).allowClientAccess === "boolean"
                  ? (gallery as any).allowClientAccess
                  : true,
    } as ClientGalleryDetailsDto
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
    return (await response.json().catch(() => null)) as T | null
}

function getErrorMessage(data: { message?: string; details?: string } | null, fallback: string) {
    return data?.details || data?.message || fallback
}

export async function getAdminPortfolioAlbums(
    page = 1,
    pageSize = 500
): Promise<PagedResultDto<PortfolioAlbumDto>> {
    const response = await apiFetch(`/admin/portfolio/albums?page=${page}&pageSize=${pageSize}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<PagedResultDto<PortfolioAlbumDto> | PortfolioAlbumDto[]>(response)

    if (!response.ok) {
        throw new Error("Failed to load portfolio albums.")
    }

    if (Array.isArray(data)) {
        return {
            page,
            pageSize,
            total: data.length,
            items: data.map(normalizePortfolioAlbum),
        }
    }

    return {
        page: data?.page ?? page,
        pageSize: data?.pageSize ?? pageSize,
        total: data?.total ?? 0,
        items: Array.isArray(data?.items) ? data.items.map(normalizePortfolioAlbum) : [],
    }
}

export async function deleteAdminPortfolioAlbum(albumId: number): Promise<void> {
    const response = await apiFetch(`/admin/portfolio/albums/${albumId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to delete portfolio album."))
    }
}

export async function getMyClientGalleries(): Promise<MyClientGalleryDto[]> {
    const response = await apiFetch("/client-galleries/my", {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<MyClientGalleryDto[]>(response)

    if (!response.ok) {
        throw new Error("Failed to load client galleries.")
    }

    return Array.isArray(data) ? data.map(normalizeGallery) : []
}

export async function createMyClientGallery(
    payload: CreateUserClientGalleryRequest
): Promise<{ id: number; message?: string }> {
    const response = await apiFetch("/client-galleries/my", {
        method: "POST",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ id: number; message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to create gallery."))
    }

    return data
}

export async function uploadMyClientGalleryPhoto(
    galleryId: number,
    file: File
): Promise<ClientPhotoDto> {
    validatePhotoFile(file)

    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch(`/client-galleries/${galleryId}/photos/upload`, {
        method: "POST",
        body: formData,
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<ClientPhotoDto & { message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to upload photo."))
    }

    return normalizePhoto(data)
}

export async function deleteMyClientGallery(galleryId: number): Promise<{ message?: string }> {
    const response = await apiFetch(`/client-galleries/${galleryId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to delete gallery."))
    }

    return { message: data?.message }
}

export async function getClientGalleryDetails(galleryId: number): Promise<ClientGalleryDetailsDto> {
    const response = await apiFetch(`/client-galleries/${galleryId}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<ClientGalleryDetailsDto & { message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to load client gallery."))
    }

    return normalizeGalleryDetails(data)
}

export function getGalleryPhotoDownloadUrl(galleryId: number, photoId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/photos/${photoId}/download`
}

export function getAdminGalleryPhotoDownloadUrl(galleryId: number, photoId: number): string {
    return `${API_BASE}/admin/client-galleries/${galleryId}/photos/${photoId}/download`
}

export function getGalleryZipDownloadUrl(galleryId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/download`
}

export async function getAdminClientGalleries(): Promise<MyClientGalleryDto[]> {
    const response = await apiFetch("/admin/client-galleries", {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<MyClientGalleryDto[]>(response)

    if (!response.ok) {
        throw new Error("Failed to load admin client galleries.")
    }

    return Array.isArray(data) ? data.map(normalizeGallery) : []
}

export async function getAdminClientGalleryById(galleryId: number): Promise<ClientGalleryDetailsDto> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<ClientGalleryDetailsDto & { message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to load client gallery."))
    }

    return normalizeGalleryDetails(data)
}

export async function createAdminClientGallery(
    payload: CreateAdminClientGalleryRequest
): Promise<{ id: number; message?: string }> {
    const response = await apiFetch("/admin/client-galleries", {
        method: "POST",
        body: JSON.stringify(normalizeAdminGalleryPayload(payload)),
    })

    const data = await parseJsonSafe<{ id: number; message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to create client gallery."))
    }

    return {
        id: data.id ?? 0,
        message: data.message,
    }
}

export async function updateAdminClientGallery(
    galleryId: number,
    payload: UpdateAdminClientGalleryRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "PUT",
        body: JSON.stringify(normalizeAdminGalleryPayload(payload)),
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to update client gallery."))
    }

    return { message: data?.message }
}

export async function deleteAdminClientGallery(
    galleryId: number
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to delete client gallery."))
    }

    return { message: data?.message }
}

export async function getGalleryAccesses(galleryId: number): Promise<GalleryAccessDto[]> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<GalleryAccessDto[] | { message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data as { message?: string; details?: string } | null, "Failed to load gallery access."))
    }

    return Array.isArray(data) ? data : []
}

export async function grantGalleryAccess(
    galleryId: number,
    payload: GrantGalleryAccessRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access`, {
        method: "POST",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to grant gallery access."))
    }

    return { message: data?.message }
}

export async function updateGalleryAccess(
    galleryId: number,
    userId: string,
    payload: UpdateGalleryAccessRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to update gallery access."))
    }

    return { message: data?.message }
}

export async function removeGalleryAccess(
    galleryId: number,
    userId: string
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access/${userId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to remove gallery access."))
    }

    return { message: data?.message }
}

export async function uploadGalleryPhoto(
    galleryId: number,
    file: File
): Promise<ClientPhotoDto> {
    validatePhotoFile(file)

    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/upload`, {
        method: "POST",
        body: formData,
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<ClientPhotoDto & { message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to upload photo."))
    }

    return normalizePhoto(data)
}

export async function updateGalleryPhoto(
    galleryId: number,
    photoId: number,
    payload: AdminUpdateClientPhotoRequest
): Promise<ClientPhotoDto> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/${photoId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<ClientPhotoDto & { message?: string; details?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(getErrorMessage(data, "Failed to update photo."))
    }

    return normalizePhoto(data)
}

export async function deleteGalleryPhoto(
    galleryId: number,
    photoId: number
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/${photoId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to delete photo."))
    }

    return { message: data?.message }
}

export async function setGalleryCoverImage(
    galleryId: number,
    payload: SetGalleryCoverRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/cover`, {
        method: "PUT",
        body: JSON.stringify({
            ...payload,
            coverImageUrl: toStoredImagePath(payload.coverImageUrl),
        }),
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to update gallery cover."))
    }

    return { message: data?.message }
}

export async function reorderGalleryPhotos(
    galleryId: number,
    payload: ReorderGalleryPhotosRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/reorder`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to reorder photos."))
    }

    return { message: data?.message }
}