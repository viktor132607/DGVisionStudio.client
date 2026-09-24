import { apiFetch } from "../api"
import type { AdminUpdateClientPhotoRequest, ClientPhotoDto } from "../../types/clientGallery"
import type { ReorderGalleryPhotosRequest, SetGalleryCoverRequest } from "./types"
import {
    getErrorMessage,
    normalizePhoto,
    parseJsonSafe,
    toStoredImagePath,
    validatePhotoFile,
} from "./shared"

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
