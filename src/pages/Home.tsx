import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import Seo from "../components/Seo"
import PortfolioLightbox from "../components/portfolio/PortfolioLightbox"
import { useHomeContent } from "../hooks/useHomeContent"
import { useHomePortfolioSlideshow } from "../hooks/useHomePortfolioSlideshow"
import { usePortfolioData } from "../hooks/usePortfolioData"
import { useThemeLogo } from "../hooks/useThemeLogo"
import type { PortfolioItem } from "../types/portfolio"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"

function isVideoPath(value?: string | null) {
    return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value || "")
}

export default function Home() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const logoSrc = useThemeLogo()
    const { serviceCards } = useHomeContent()
    const { albumsData, imagesData } = usePortfolioData()
    const { introVideoUrl, currentImage, previousImage, isTransitioning, direction, isMobile, goNext, goPrevious } =
        useHomePortfolioSlideshow(4500, 700)

    const activeIntroVideoSrc = introVideoUrl ? resolveAssetUrl(introVideoUrl) : ""
    const hasIntroVideo = Boolean(activeIntroVideoSrc)
    const introVideoRef = useRef<HTMLVideoElement | null>(null)
    const [introVideoDone, setIntroVideoDone] = useState(!hasIntroVideo)
    const [isVideoMuted, setIsVideoMuted] = useState(false)
    const [selectedSlideshowItem, setSelectedSlideshowItem] = useState<PortfolioItem | null>(null)

    const recentAlbums = useMemo(() => {
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
            .slice(0, 4)
    }, [albumsData, imagesData])

    useEffect(() => {
        if (!selectedSlideshowItem) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedSlideshowItem(null)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedSlideshowItem])

    useEffect(() => {
        if (location.pathname !== "/") return

        if (!hasIntroVideo) {
            setIntroVideoDone(true)
            return
        }

        setIntroVideoDone(false)

        const timer = window.setTimeout(() => {
            const video = introVideoRef.current
            if (!video) return

            video.pause()
            video.currentTime = 0
            video.load()

            video.muted = false
            setIsVideoMuted(false)

            const playPromise = video.play()

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    video.muted = true
                    setIsVideoMuted(true)
                    video.currentTime = 0
                    void video.play()
                })
            }
        }, 0)

        return () => window.clearTimeout(timer)
    }, [activeIntroVideoSrc, hasIntroVideo, location.key, location.pathname])

    const toggleVideoMute = () => {
        const video = introVideoRef.current
        if (!video) return

        video.muted = !video.muted
        setIsVideoMuted(video.muted)
        void video.play()
    }

    const showingIntroVideo = hasIntroVideo && !introVideoDone

    const openCurrentSlideshowImage = () => {
        if (showingIntroVideo || !currentImage) return

        const album = albumsData.find((item) => item.id === currentImage.portfolioAlbumId)
        const albumTitle = currentImage.albumTitle?.trim() || album?.title || "DG Vision Studio"

        setSelectedSlideshowItem({
            id: currentImage.id,
            src: currentImage.imageUrl,
            originalSrc: currentImage.imageUrl,
            category: "slideshow",
            categoryLabel:
                (isBg ? currentImage.categoryName?.trim() : currentImage.categoryNameEn?.trim()) ||
                currentImage.categoryName?.trim() ||
                "DG Vision Studio",
            albumKey: album?.slug || String(currentImage.portfolioAlbumId || currentImage.id),
            albumLabel: albumTitle,
            title: currentImage.altText?.trim() || currentImage.caption?.trim() || albumTitle,
            mediaType: "Image",
        })
    }

    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "DG Vision Studio",
        url: "https://dgvisionstudio.com",
        image: "https://dgvisionstudio.com/og-cover.jpg",
        email: "dgvisionstudio@gmail.com",
        telephone: "+359988758434",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Ruse",
            addressCountry: "BG",
        },
        description: isBg
            ? "DG Vision Studio предлага фотография и визуално съдържание за брандове, продукти, кампании, портрети и събития."
            : "DG Vision Studio offers photography and visual content for brands, products, campaigns, portraits, and events.",
    }

    const slideshowEyebrow = showingIntroVideo
        ? "DG Vision Studio"
        : (isBg ? currentImage?.categoryName?.trim() : currentImage?.categoryNameEn?.trim()) ||
          currentImage?.albumTitle?.trim() ||
          "DG Vision Studio"

    const slideshowDescription = showingIntroVideo
        ? isBg
            ? "Фотография и визуално съдържание със стил"
            : "Photography and visual content with style"
        : currentImage?.caption?.trim()
          ? currentImage.caption
          : isBg
            ? "Съвременен визуален стил с внимание към детайла"
            : "Contemporary visual style with attention to detail"

    return (
        <>
            <Seo
                title={isBg ? "Начало" : "Home"}
                description={
                    isBg
                        ? "DG Vision Studio предлага фотография и визуално съдържание за брандове, продукти, кампании, портрети, сватби и лични фотосесии."
                        : "DG Vision Studio offers photography and visual content for brands, products, campaigns, portraits, weddings, and personal photoshoots."
                }
                canonical="/"
                image="/og-cover.jpg"
                type="website"
                jsonLd={homeJsonLd}
            />

            <div className="min-h-screen overflow-x-hidden bg-white text-neutral-900 dark:bg-zinc-900 dark:text-white">
                <section className="home-hero bg-white dark:bg-zinc-900">
                    <div className="home-hero-grid">
                        <div className="home-hero-copy">
                            <img
                                src={logoSrc}
                                alt="DG Vision Studio"
                                className="home-hero-logo"
                            />

                            <h1 className="home-hero-title text-neutral-950 dark:text-white">
                                {isBg
                                    ? "Фотография и визуално съдържание"
                                    : "Photography and visual content"}
                            </h1>

                            {recentAlbums.length > 0 ? (
                                <div className="home-recent">
                                    <div className="home-recent-label text-neutral-500">
                                        Recent photography
                                    </div>
                                    <div className="home-recent-collage">
                                        {recentAlbums.map((album, index) => (
                                            <Link
                                                key={album.id}
                                                to="/portfolio"
                                                className={`home-recent-card home-recent-card-${index + 1} ${index === 3 ? "lg:hidden" : ""}`}
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
                                    </div>
                                </div>
                            ) : null}

                            <p className="home-hero-description text-neutral-600 dark:text-zinc-300">
                                {isBg
                                    ? "Създаваме модерно визуално съдържание за брандове, продукти, кампании и лични фотосесии. Подходът ни е изчистен, силно визуален и насочен към кадри, които остават."
                                    : "We create modern visual content for brands, products, campaigns, and personal photoshoots. Our approach is clean, visually strong, and focused on images that stay with people."}
                            </p>
                        </div>

                        <div className="home-slideshow bg-black dark:border-zinc-700">
                            <div
                                className={`home-slideshow-media bg-neutral-950 ${
                                    !showingIntroVideo && currentImage ? "cursor-zoom-in" : ""
                                }`}
                                onClick={openCurrentSlideshowImage}
                            >
                                <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-black">
                                    <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                                    <div className="absolute bottom-20 right-0 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
                                    <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                                        <img
                                            src={logoSrc}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-auto w-44 max-w-[72%] object-contain opacity-90 brightness-0 invert sm:w-52"
                                        />
                                        <div className="h-[2px] w-32 overflow-hidden bg-white/15">
                                            <div className="h-full w-1/2 animate-[homeLoadingBar_1200ms_ease-in-out_infinite] bg-white/70" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 sm:text-xs">
                                            DG Vision Studio
                                        </p>
                                    </div>
                                </div>

                                {showingIntroVideo ? (
                                    <>
                                        <video
                                            className="absolute inset-0 h-full w-full scale-125 object-cover object-center opacity-45 blur-xl lg:hidden"
                                            src={activeIntroVideoSrc}
                                            autoPlay
                                            playsInline
                                            muted
                                            loop
                                            preload="auto"
                                        />

                                        <video
                                            key={`${location.key}-${activeIntroVideoSrc}`}
                                            ref={introVideoRef}
                                            className="absolute inset-0 h-full w-full object-cover object-top"
                                            src={activeIntroVideoSrc}
                                            autoPlay
                                            playsInline
                                            preload="auto"
                                            muted={isVideoMuted}
                                            onEnded={() => setIntroVideoDone(true)}
                                            onError={() => setIntroVideoDone(true)}
                                        />

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                toggleVideoMute()
                                            }}
                                            aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                                            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center border border-white/40 bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 sm:right-5 sm:top-5 sm:h-11 sm:w-11"
                                        >
                                            {isVideoMuted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                    <line x1="23" y1="9" x2="17" y2="15" />
                                                    <line x1="17" y1="9" x2="23" y2="15" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                                                    <path d="M19 5a10 10 0 0 1 0 14" />
                                                </svg>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {previousImage && isTransitioning ? (
                                            <img
                                                src={previousImage.thumbnailUrl?.trim() || previousImage.imageUrl}
                                                alt={previousImage.albumTitle || previousImage.altText || previousImage.caption || "DG Vision Studio"}
                                                loading="lazy"
                                                decoding="async"
                                                className={`absolute inset-0 h-full w-full object-cover object-top ${
                                                    !isMobile && direction === 1
                                                        ? "animate-[homeSlideOutLeft_700ms_ease-in-out_forwards]"
                                                        : !isMobile
                                                          ? "animate-[homeSlideOutRight_700ms_ease-in-out_forwards]"
                                                          : "opacity-100"
                                                }`}
                                            />
                                        ) : null}

                                        {currentImage ? (
                                            <img
                                                src={currentImage.thumbnailUrl?.trim() || currentImage.imageUrl}
                                                alt={currentImage.albumTitle || currentImage.altText || currentImage.caption || "DG Vision Studio"}
                                                loading="eager"
                                                decoding="async"
                                                className={`absolute inset-0 h-full w-full object-cover object-top ${
                                                    !isMobile && isTransitioning
                                                        ? direction === 1
                                                            ? "animate-[homeSlideInRight_700ms_ease-in-out_forwards]"
                                                            : "animate-[homeSlideInLeft_700ms_ease-in-out_forwards]"
                                                        : "opacity-100"
                                                }`}
                                            />
                                        ) : null}
                                    </>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                            </div>

                            <div className="home-slideshow-controls border-t border-white/10 bg-black/65 backdrop-blur-sm">
                                <div className="home-slideshow-controls-grid">
                                    <button
                                        type="button"
                                        onClick={goPrevious}
                                        disabled={!currentImage || showingIntroVideo}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
                                        aria-label={isBg ? "Предишна снимка" : "Previous image"}
                                    >
                                        ‹
                                    </button>

                                    <div
                                        key={showingIntroVideo ? "intro-video-text" : currentImage?.id ?? "fallback-text"}
                                        className="min-w-0 animate-[fadeUp_500ms_ease-out] text-center"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[11px] sm:tracking-[0.28em] md:text-[12px]">
                                            {slideshowEyebrow}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold text-white sm:text-sm md:text-[15px]">
                                            {slideshowDescription}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={goNext}
                                        disabled={!currentImage || showingIntroVideo}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
                                        aria-label={isBg ? "Следваща снимка" : "Next image"}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>
                        {`
                            @keyframes homeSlideInRight {
                                from { transform: translateX(100%); opacity: 0.9; }
                                to { transform: translateX(0); opacity: 1; }
                            }

                            @keyframes homeSlideOutLeft {
                                from { transform: translateX(0); opacity: 1; }
                                to { transform: translateX(-100%); opacity: 0.9; }
                            }

                            @keyframes homeSlideInLeft {
                                from { transform: translateX(-100%); opacity: 0.9; }
                                to { transform: translateX(0); opacity: 1; }
                            }

                            @keyframes homeSlideOutRight {
                                from { transform: translateX(0); opacity: 1; }
                                to { transform: translateX(100%); opacity: 0.9; }
                            }

                            @keyframes fadeUp {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }

                            @keyframes homeLoadingBar {
                                from { transform: translateX(-120%); }
                                to { transform: translateX(240%); }
                            }
                        `}
                    </style>
                </section>

                <section className="bg-white py-12 dark:bg-zinc-900 sm:py-16 lg:py-20 xl:py-24">
                    <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-10">
                        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
                            <h2 className="[font-family:Messenger,sans-serif] text-[28px] font-black uppercase tracking-[0.06em] text-neutral-950 dark:text-white sm:text-[34px] md:text-[40px] xl:text-[44px]">
                                {isBg ? "Услуги" : "Services"}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {serviceCards.map((card) => (
                                <Link
                                    key={card.id}
                                    to={card.href}
                                    className="group overflow-hidden border border-neutral-300 bg-white [font-family:Messenger,sans-serif] transition hover:-translate-y-1 hover:border-neutral-950 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-white"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img
                                            src={card.image}
                                            alt={isBg ? card.titleBg : card.titleEn}
                                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                                    </div>

                                    <div className="space-y-3 p-5 sm:p-6">
                                        <h3 className="text-sm font-black italic uppercase tracking-[0.14em] text-neutral-950 dark:text-white">
                                            {isBg ? card.titleBg : card.titleEn}
                                        </h3>

                                        {(isBg ? card.descBg : card.descEn) ? (
                                            <p className="text-sm leading-7 text-neutral-600 dark:text-zinc-300">
                                                {isBg ? card.descBg : card.descEn}
                                            </p>
                                        ) : null}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {selectedSlideshowItem ? (
                <PortfolioLightbox
                    isBg={isBg}
                    item={selectedSlideshowItem}
                    selectedIndex={0}
                    totalItems={1}
                    onClose={() => setSelectedSlideshowItem(null)}
                    onPrev={() => {}}
                    onNext={() => {}}
                    showNavigation={false}
                />
            ) : null}
        </>
    )
}
