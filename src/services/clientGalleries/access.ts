import { apiFetch } from "../api"
import type {
    GalleryAccessDto,
    GrantGalleryAccessRequest,
    UpdateGalleryAccessRequest,
} from "./types"
import { getErrorMessage, parseJsonSafe } from "./shared"

export async function getGalleryAccesses(galleryId: number): Promise<GalleryAccessDto[]> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/access`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<GalleryAccessDto[] | { message?: string; details?: string }>(response)

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data as { message?: string; details?: string } | null,
                "Failed to load gallery access."
            )
        )
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
