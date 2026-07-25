import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import { resolveAssetUrl } from "../../utils/resolveAssetUrl"
import type { PortfolioAlbumCard } from "../../types/portfolio"

type PortfolioAlbumGridProps = {
    items: PortfolioAlbumCard[]
    onSelect: (albumId: number) => void
}

type PortfolioImageFallback = {
    id?: number
    portfolioAlbumId: number
    imageUrl?: string | null
    thumbnailUrl?: string | null
    displayOrder?: number
    isPublished?: boolean
}

let portfolioImagesPromise: Promise<PortfolioImageFallback[]> | null = null

function isVideoPath(value?: string | null) {
    return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value || "")
}

async function loadPortfolioImages() {
    if (!portfolioImagesPromise) {
        portfolioImagesPromise = apiFetch("/portfolio/images", {
            method: "GET",
            skipJsonContentType: true,
        })
            .then(async (response) => {
                if (!response.ok) return []
                const data = await response.json().catch(() => [])
                return Array.isArray(data) ? (data as PortfolioImageFallback[]) : []
            })
            .catch(() => [])
    }

    return portfolioImagesPromise
}

function AlbumCover({ item, eager }: { item: PortfolioAlbumCard; eager: boolean }) {
    const [src, setSrc] = useState(item.coverSrc)
    const [failed, setFailed] = useState(false)
    const [fallbackTried, setFallbackTried] = useState(false)

    useEffect(() => {
        setSrc(item.coverSrc)
        setFailed(false)
        setFallbackTried(false)
    }, [item.coverSrc])

    const useFallback = async () => {
        if (fallbackTried) {
            setFailed(true)
            return
        }

        setFallbackTried(true)
        const images = await loadPortfolioImages()
        const fallback = images
            .filter(
                (image) =>
                    image.portfolioAlbumId === item.id &&
                    image.isPublished !== false &&
                    !isVideoPath(image.imageUrl)
            )
            .sort(
                (a, b) =>
                    (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
                        (b.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
                    (a.id ?? 0) - (b.id ?? 0)
            )[0]

        const nextSrc = resolveAssetUrl(fallback?.thumbnailUrl || fallback?.imageUrl)
        if (nextSrc && nextSrc !== src) {
            setSrc(nextSrc)
            return
        }

        setFailed(true)
    }

    if (failed) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black" />
        )
    }

    return (
        <img
            src={src}
            alt={item.title}
            loading={eager ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            onError={() => void useFallback()}
        />
    )
}

export default function PortfolioAlbumGrid({
    items,
    onSelect,
}: PortfolioAlbumGridProps) {
    return (
        <div className="w-full bg-neutral-300 px-1 py-[1px] dark:bg-zinc-800 sm:px-[5mm]">
            <div className="grid grid-cols-2 gap-[1px] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 text-left dark:bg-zinc-900"
                    >
                        <AlbumCover item={item} eager={index < 4} />

                        <div className="absolute inset-0 bg-black/25 transition duration-300 group-hover:bg-black/40" />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pt-12 sm:p-5 sm:pt-16">
                            <p className="text-[9px] uppercase tracking-[0.16em] text-white/75 sm:text-[10px] sm:tracking-[0.28em]">
                                {item.categoryLabel}
                            </p>

                            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white sm:mt-2 sm:text-lg">
                                {item.title}
                            </p>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/75 sm:mt-2 sm:text-xs sm:tracking-[0.14em]">
                                {item.imageCount} снимки
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
