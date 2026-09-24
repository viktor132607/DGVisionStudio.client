import { API_BASE } from "./shared"

export function getGalleryPhotoDownloadUrl(galleryId: number, photoId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/photos/${photoId}/download`
}

export function getAdminGalleryPhotoDownloadUrl(galleryId: number, photoId: number): string {
    return `${API_BASE}/admin/client-galleries/${galleryId}/photos/${photoId}/download`
}

export function getGalleryZipDownloadUrl(galleryId: number): string {
    return `${API_BASE}/client-galleries/${galleryId}/download`
}
