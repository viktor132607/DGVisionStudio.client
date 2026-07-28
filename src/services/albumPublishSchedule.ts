import { apiFetch } from "./api"

export type AlbumPublishScheduleDto = {
    id: number
    publishAtUtc?: string | null
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
    return (await response.json().catch(() => null)) as T | null
}

export async function getAdminAlbumPublishSchedule(
    galleryId: number
): Promise<AlbumPublishScheduleDto> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/publish-schedule`, {
        method: "GET",
        skipJsonContentType: true,
    })

    const data = await parseJsonSafe<AlbumPublishScheduleDto & { message?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(data?.message || "Failed to load album publish schedule.")
    }

    return data
}

export async function updateAdminAlbumPublishSchedule(
    galleryId: number,
    publishAtUtc: string | null
): Promise<AlbumPublishScheduleDto> {
    const response = await apiFetch(`/admin/client-galleries/${galleryId}/publish-schedule`, {
        method: "PUT",
        body: JSON.stringify({ publishAtUtc }),
    })

    const data = await parseJsonSafe<AlbumPublishScheduleDto & { message?: string }>(response)

    if (!response.ok || !data) {
        throw new Error(data?.message || "Failed to update album publish schedule.")
    }

    return data
}
