import { apiFetch } from "../api"
import type {
    ClientGalleryDetailsDto,
    CreateAdminClientGalleryRequest,
    MyClientGalleryDto,
    UpdateAdminClientGalleryRequest,
} from "../../types/clientGallery"
import {
    getErrorMessage,
    normalizeAdminGalleryPayload,
    normalizeGallery,
    normalizeGalleryDetails,
    parseJsonSafe,
} from "./shared"

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
