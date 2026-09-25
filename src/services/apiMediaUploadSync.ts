import { API_BASE_URL } from "./apiConfig"

function getUploadFile(body: BodyInit | null | undefined): File | null {
    if (!(body instanceof FormData)) {
        return null
    }

    const file = body.get("file")
    return file instanceof File ? file : null
}

function getFileNameWithoutExtension(file: File): string {
    return file.name.replace(/\.[^/.]+$/, "").trim() || file.name.trim()
}

function getAdminGalleryUploadMatch(path: string): RegExpMatchArray | null {
    return path.match(/^\/admin\/client-galleries\/(\d+)\/(photos|videos)\/upload$/)
}

export async function syncUploadedMediaName(
    path: string,
    response: Response,
    body: BodyInit | null | undefined,
    headers: Headers
): Promise<void> {
    if (!response.ok) {
        return
    }

    const match = getAdminGalleryUploadMatch(path)
    if (!match) {
        return
    }

    const file = getUploadFile(body)
    if (!file) {
        return
    }

    const galleryId = Number(match[1])
    if (!Number.isFinite(galleryId) || galleryId <= 0) {
        return
    }

    const data = (await response.clone().json().catch(() => null)) as { id?: number } | null
    const mediaId = Number(data?.id)
    if (!Number.isFinite(mediaId) || mediaId <= 0) {
        return
    }

    await fetch(
        `${API_BASE_URL}/api/admin/client-galleries/${galleryId}/media/${mediaId}/metadata`,
        {
            method: "PUT",
            credentials: "include",
            headers,
            body: JSON.stringify({
                name: getFileNameWithoutExtension(file),
                clearAltAndCaption: true,
            }),
        }
    ).catch(() => undefined)
}
