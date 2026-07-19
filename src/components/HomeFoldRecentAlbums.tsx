import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation } from "react-router-dom"
import { usePortfolioData } from "../hooks/usePortfolioData"

function isVideoPath(value?: string | null) {
    return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value || "")
}

export default function HomeFoldRecentAlbums() {
    const location = useLocation()
    const { albumsData, imagesData } = usePortfolioData()
    const [target, setTarget] = useState<HTMLElement | null>(null)

    const extraAlbums = useMemo(() => {
        return albumsData
            .filter((album) => album.isPublished)
            .sort((a, b) => {
                const aDate = a.createdAtUtc ? new Date(a.createdAtUtc).getTime() : 0
                const bDate = b.createdAtUtc ? new Date(b.createdAtUtc).getTime() : 0
                return bDate - aDate || b.id - a.id
            })
            .map((album) => {
                const albumImages = imagesData
                    .filter((image) => image.portfolioAlbumId === album.id && image.isPublished)
                    .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
                const firstImage = albumImages.find((image) => !isVideoPath(image.imageUrl)) ?? albumImages[0]
                const coverSrc = album.coverImageUrl?.trim() || firstImage?.thumbnailUrl?.trim() || firstImage?.imageUrl || ""

                return {
                    id: album.id,
                    title: album.title,
                    coverSrc,
                }
            })
            .filter((album) => album.coverSrc.trim().length > 0)
            .slice(4, 6)
    }, [albumsData, imagesData])

    useEffect(() => {
        if (location.pathname !== "/" || extraAlbums.length === 0) {
            setTarget(null)
            return
        }

        const locateGrid = () => {
            setTarget(document.querySelector<HTMLElement>(".home-recent-collage"))
        }

        locateGrid()

        const observer = new MutationObserver(locateGrid)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [extraAlbums.length, location.pathname])

    if (location.pathname !== "/" || !target || extraAlbums.length === 0) return null

    return createPortal(
        <>
            {extraAlbums.map((album, index) => (
                <Link
                    key={album.id}
                    to="/portfolio"
                    className={`home-recent-card home-recent-card-${index + 5} home-fold-recent-extra`}
                    style={{ order: index + 5 }}
                >
                    <div className="home-recent-image-frame">
                        <img
                            src={album.coverSrc}
                            alt={album.title}
                            className="home-recent-image"
                        />
                    </div>
                </Link>
            ))}
        </>,
        target,
    )
}
