import { apiFetch } from "../api"
import type {
    ClientGalleryDetailsDto,
    ClientPhotoDto,
    CreateUserClientGalleryRequest,
    MyClientGalleryDto,
} from "../../types/clientGallery"
import {
    getErrorMessage,
    normalizeGallery,
    normalizeGalleryDetails,
    normalizePhoto,
    parseJsonSafe,
    validatePhotoFile,
} from "./shared"

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
