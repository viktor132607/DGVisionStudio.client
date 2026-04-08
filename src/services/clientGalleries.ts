import { apiFetch } from "./api"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"
import type {
    AdminUpdateClientPhotoRequest,
    ClientGalleryDetailsDto,
    ClientPhotoDto,
    CreateAdminClientGalleryRequest,
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

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "")
const API_BASE = (import.meta.env.VITE_API_BASE_URL || `${API_ROOT}/api`).replace(/\/+$/, "")

function normalizePhoto(photo: ClientPhotoDto): ClientPhotoDto {
    return {
        ...photo,
        previewUrl: resolveAssetUrl(photo.previewUrl),
        originalUrl: photo.originalUrl ? resolveAssetUrl(photo.originalUrl) : photo.originalUrl,
    }
}

function normalizeGallery<T extends { coverImageUrl?: string | null }>(gallery: T): T {
    return {
        ...gallery,
        coverImageUrl: gallery.coverImageUrl ? resolveAssetUrl(gallery.coverImageUrl) : gallery.coverImageUrl,
    }
}

function normalizeGalleryDetails(gallery: ClientGalleryDetailsDto): ClientGalleryDetailsDto {
    return {
        ...normalizeGallery(gallery),
        photos: Array.isArray(gallery.photos) ? gallery.photos.map(normalizePhoto) : [],
    }
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
    return (await response.json().catch(() => null)) as T | null
}

export async function getMyClientGalleries(): Promise<MyClientGalleryDto[]> {
    const response = await apiFetch("/client-galleries/my", {
        method: "GET",
        skipJsonContentType: true,
    })

    if (!response.ok) {
        throw new Error("Failed to load client galleries.")
    }

    const data = (await response.json()) as MyClientGalleryDto[]
    return data.map(normalizeGallery)
}

export async function getClientGalleryDetails(galleryId: number): Promise<ClientGalleryDetailsDto> {
    const response = await apiFetch(`/client-galleries/${galleryId}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    if (!response.ok) {
        throw new Error("Failed to load client gallery.")
    }

    const data = (await response.json()) as ClientGalleryDetailsDto
    return normalizeGalleryDetails(data)
}

export function getGalleryPhotoDownloadUrl(galleryId: number, photoId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/photos/${photoId}/download`
}

export function getGalleryZipDownloadUrl(galleryId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/download`
}

export async function getAdminClientGalleries(): Promise<MyClientGalleryDto[]> {
    const response = await apiFetch("/admin/client-galleries", {
        method: "GET",
        skipJsonContentType: true,
    })

    if (!response.ok) {
        throw new Error("Failed to load admin client galleries.")
    }

    const data = (await response.json()) as MyClientGalleryDto[]
    return data.map(normalizeGallery)
}

export async function getAdminClientGalleryById(galleryId: number): Promise<ClientGalleryDetailsDto> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    if (!response.ok) {
        throw new Error("Failed to load client gallery.")
    }

    const data = (await response.json()) as ClientGalleryDetailsDto
    return normalizeGalleryDetails(data)
}

export async function createAdminClientGallery(
    payload: CreateAdminClientGalleryRequest
): Promise<{ id: number; message?: string }> {
    const response = await apiFetch("/admin/client-galleries", {
        method: "POST",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ id: number; message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to create client gallery.")
    }

    return {
        id: data?.id ?? 0,
        message: data?.message,
    }
}

export async function updateAdminClientGallery(
    galleryId: number,
    payload: UpdateAdminClientGalleryRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to update client gallery.")
    }

    return { message: data?.message }
}

export async function deleteAdminClientGallery(
    galleryId: number
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
        method: "DELETE",
    })

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to delete client gallery.")
    }

    return { message: data?.message }
}

export async function getGalleryAccesses(galleryId: number): Promise<GalleryAccessDto[]> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access`, {
        method: "GET",
        skipJsonContentType: true,
    })

    if (!response.ok) {
        throw new Error("Failed to load gallery access.")
    }

    return (await response.json()) as GalleryAccessDto[]
}

export async function grantGalleryAccess(
    galleryId: number,
    payload: GrantGalleryAccessRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access`, {
        method: "POST",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to grant gallery access.")
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

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to update gallery access.")
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

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to remove gallery access.")
    }

    return { message: data?.message }
}

export async function uploadGalleryPhoto(
    galleryId: number,
    file: File
): Promise<ClientPhotoDto> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/upload`, {
        method: "POST",
        body: formData,
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<ClientPhotoDto & { message?: string }>(response)

    if (!response.ok || !data) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to upload photo.")
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

    const data = await parseJsonSafe<ClientPhotoDto & { message?: string }>(response)

    if (!response.ok || !data) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to update photo.")
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

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to delete photo.")
    }

    return { message: data?.message }
}

export async function setGalleryCoverImage(
    galleryId: number,
    payload: SetGalleryCoverRequest
): Promise<{ message?: string }> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/cover`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to update gallery cover.")
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

    const data = await parseJsonSafe<{ message?: string }>(response)

    if (!response.ok) {
        throw new Error(data?.message || "Failed to reorder photos.")
    }

    return { message: data?.message }
}