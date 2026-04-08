import { useEffect, useState } from "react"
import { apiFetch } from "../services/api"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"
import type {
    PortfolioAlbum,
    PortfolioCategory,
    PortfolioImage,
} from "../types/portfolio"

function normalizeAlbum(album: PortfolioAlbum): PortfolioAlbum {
    return {
        ...album,
        coverImageUrl: album.coverImageUrl ? resolveAssetUrl(album.coverImageUrl) : album.coverImageUrl,
    }
}

function normalizeImage(image: PortfolioImage): PortfolioImage {
    return {
        ...image,
        imageUrl: resolveAssetUrl(image.imageUrl),
        thumbnailUrl: image.thumbnailUrl ? resolveAssetUrl(image.thumbnailUrl) : image.thumbnailUrl,
    }
}

export function usePortfolioData() {
    const [categoriesData, setCategoriesData] = useState<PortfolioCategory[]>([])
    const [albumsData, setAlbumsData] = useState<PortfolioAlbum[]>([])
    const [imagesData, setImagesData] = useState<PortfolioImage[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const [categoriesRes, albumsRes, imagesRes] = await Promise.all([
                    apiFetch("/portfolio/categories", {
                        method: "GET",
                        skipJsonContentType: true,
                    }),
                    apiFetch("/portfolio/albums", {
                        method: "GET",
                        skipJsonContentType: true,
                    }),
                    apiFetch("/portfolio/images", {
                        method: "GET",
                        skipJsonContentType: true,
                    }),
                ])

                if (!categoriesRes.ok || !albumsRes.ok || !imagesRes.ok) {
                    throw new Error()
                }

                const [categoriesJson, albumsJson, imagesJson] = await Promise.all([
                    categoriesRes.json().catch(() => []),
                    albumsRes.json().catch(() => []),
                    imagesRes.json().catch(() => []),
                ])

                setCategoriesData(Array.isArray(categoriesJson) ? categoriesJson : [])
                setAlbumsData(
                    Array.isArray(albumsJson)
                        ? albumsJson.map((album) => normalizeAlbum(album as PortfolioAlbum))
                        : []
                )
                setImagesData(
                    Array.isArray(imagesJson)
                        ? imagesJson.map((image) => normalizeImage(image as PortfolioImage))
                        : []
                )
            } catch {
                setCategoriesData([])
                setAlbumsData([])
                setImagesData([])
            }
        }

        void load()
    }, [])

    return {
        categoriesData,
        albumsData,
        imagesData,
    }
}