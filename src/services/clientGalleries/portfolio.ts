import { apiFetch } from "../api"
import type { PagedResultDto, PortfolioAlbumDto } from "./types"
import { getErrorMessage, normalizePortfolioAlbum, parseJsonSafe } from "./shared"

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
