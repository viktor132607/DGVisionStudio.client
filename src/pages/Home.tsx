import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import Seo from "../components/Seo"
import { useHomeContent } from "../hooks/useHomeContent"
import { useHomePortfolioSlideshow } from "../hooks/useHomePortfolioSlideshow"
import { useThemeLogo } from "../hooks/useThemeLogo"
import type { HomeSlideshowImage } from "../types/home"

const HARDCODED_SLIDESHOW_VIDEO_SOURCES: string[] = [
    // Add a future hardcoded intro video here, for example:
    // "/videos/example-intro.mov",
]

const ACTIVE_HARDCODED_VIDEO_SRC = HARDCODED_SLIDESHOW_VIDEO_SOURCES[0] || ""

export default function Home() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const logoSrc = useThemeLogo()
    const { quickLinks, serviceCards } = useHomeContent()
    const { currentImage, previousImage, isTransitioning, direction, goNext, goPrevious } =
        useHomePortfolioSlideshow(4500, 700)

    const hasHardcodedVideo = Boolean(ACTIVE_HARDCODED_VIDEO_SRC)
    const introVideoRef = useRef<HTMLVideoElement | null>(null)
    const [introVideoDone, setIntroVideoDone] = useState(!hasHardcodedVideo)
    const [isVideoMuted, setIsVideoMuted] = useState(false)
    const [selectedSlideshowImage, setSelectedSlideshowImage] = useState<HomeSlideshowImage | null>(null)

    useEffect(() => {
        if (location.pathname !== "/") return

        if (!hasHardcodedVideo) {
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
    }, [hasHardcodedVideo, location.key, location.pathname])

    useEffect(() => {
        if (!selectedSlideshowImage) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelectedSlideshowImage(null)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedSlideshowImage])

    const toggleVideoMute = () => {
        const video = introVideoRef.current
        if (!video) return

        video.muted = !video.muted
        setIsVideoMuted(video.muted)
        void video.play()
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

    const showingHardcodedVideo = hasHardcodedVideo && !introVideoDone

    const slideshowEyebrow = showingHardcodedVideo
        ? "DG Vision Studio"
        : (isBg ? currentImage?.categoryName?.trim() : currentImage?.categoryNameEn?.trim()) ||
          currentImage?.albumTitle?.trim() ||
          "DG Vision Studio"

    const slideshowDescription = showingHardcodedVideo
        ? isBg
            ? "Фотография и визуално съдържание със стил"
            : "Photography and visual content with style"
        : currentImage?.caption?.trim()
          ? currentImage.caption
          : isBg
            ? "Съвременен визуален стил с внимание към детайла"
            : "Contemporary visual style with attention to detail"

    const selectedImageSrc = selectedSlideshowImage?.imageUrl || selectedSlideshowImage?.thumbnailUrl || ""
    const selectedImageAlt =
        selectedSlideshowImage?.albumTitle ||
        selectedSlideshowImage?.altText ||
        selectedSlideshowImage?.caption ||
        "DG Vision Studio"

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

            <div className="min-h-screen overflow-x-hidden bg-neutral-100 text-neutral-900 dark:bg-zinc-900 dark:text-white">
                <section className="border-b border-neutral-300 bg-white pt-6 sm:pt-7 md:pt-8 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="mx-auto grid min-h-[auto] w-full max-w-[1120px] grid-cols-1 xl:min-h-[700px] xl:max-w-[1700px] xl:grid-cols-[1.08fr_0.92fr] 2xl:min-h-[760px]">
                        <div className="order-2 flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 md:order-1 md:px-10 md:py-12 lg:px-14 lg:py-14 xl:px-14 xl:py-16 2xl:px-20">
                            <img
                                src={logoSrc}
                                alt="DG Vision Studio"
                                className="mb-4 block h-auto w-[220px] max-w-full object-contain sm:mb-5 sm:w-[260px] md:w-[300px]"
                            />

                            <h1 className="max-w-4xl text-[28px] font-extrabold uppercase leading-[1.06] tracking-[0.02em] text-neutral-950 dark:text-white sm:text-[36px] md:text-[42px] md:leading-[1.05] lg:text-[48px] xl:text-[60px] 2xl:text-[68px]">
                                {isBg
                                    ? "Фотография и визуално съдържание със стил, характер и ясно присъствие"
                                    : "Photography and visual content with style, character, and clear presence"}
                            </h1>

                            <p className="mt-5 max-w-2xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:mt-6 sm:text-[15px] sm:leading-8 md:max-w-3xl md:text-[16px] lg:max-w-[760px] xl:max-w-[700px]">
                                {isBg
                                    ? "Създаваме модерно визуално съдържание за брандове, продукти, кампании и лични фотосесии. Подходът ни е изчистен, силно визуален и насочен към кадри, които остават."
                                    : "We create modern visual content for brands, products, campaigns, and personal photoshoots. Our approach is clean, visually strong, and focused on images that stay with people."}
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4 lg:mt-10">
                                <Link
                                    to="/portfolio"
                                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-none border border-neutral-950 bg-neutral-950 px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:min-h-[52px] sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    {isBg ? "Вижте портфолио" : "View portfolio"}
                                </Link>

                                <Link
                                    to="/contact"
                                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-none border border-neutral-400 bg-transparent px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-900 transition hover:border-neutral-950 hover:bg-neutral-100 dark:border-zinc-500 dark:text-white dark:hover:border-white dark:hover:bg-zinc-800 sm:min-h-[52px] sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    {isBg ? "Свържете се" : "Contact us"}
                                </Link>
                            </div>
                        </div>

                        <div className="order-1 relative aspect-[9/16] min-h-0 overflow-hidden border-b border-neutral-300 bg-black dark:border-zinc-700 sm:aspect-[9/16] md:order-2 md:aspect-[16/10] md:border-t lg:aspect-[16/9] xl:order-2 xl:aspect-auto xl:min-h-full xl:border-b-0 xl:border-l xl:border-t-0">
                            <div className="relative h-full w-full overflow-hidden bg-neutral-950">
                                {!currentImage && !showingHardcodedVideo ? (
                                    <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-black">
                                        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                                        <div className="absolute bottom-20 right-0 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
                                        <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                                            <img src={logoSrc} alt="" aria-hidden="true" className="h-auto w-44 max-w-[72%] object-contain opacity-90 brightness-0 invert sm:w-52" />
                                            <div className="h-[2px] w-32 overflow-hidden bg-white/15">
                                                <div className="h-full w-1/2 animate-[homeLoadingBar_1200ms_ease-in-out_infinite] bg-white/70" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 sm:text-xs">DG Vision Studio</p>
                                        </div>
                                    </div>
                                ) : null}

                                {showingHardcodedVideo ? (
                                    <>
                                        <video className="absolute inset-0 h-full w-full scale-125 object-cover object-center opacity-45 blur-xl lg:hidden" src={ACTIVE_HARDCODED_VIDEO_SRC} autoPlay playsInline muted loop preload="auto" />
                                        <video key={location.key} ref={introVideoRef} className="absolute inset-0 h-full w-full object-contain object-center lg:object-cover lg:object-top" src={ACTIVE_HARDCODED_VIDEO_SRC} autoPlay playsInline preload="auto" muted={isVideoMuted} onEnded={() => setIntroVideoDone(true)} onError={() => setIntroVideoDone(true)} />
                                        <button type="button" onClick={toggleVideoMute} aria-label={isVideoMuted ? "Unmute video" : "Mute video"} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center border border-white/40 bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 sm:right-5 sm:top-5 sm:h-11 sm:w-11">
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
                                                className={`absolute inset-0 h-full w-full object-cover object-top ${direction === 1 ? "animate-slide-out-left" : "animate-slide-out-right"}`}
                                            />
                                        ) : null}

                                        {currentImage ? (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSlideshowImage(currentImage)}
                                                className="absolute inset-0 block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
                                                aria-label={isBg ? "Отвори снимката" : "Open image"}
                                            >
                                                <img
                                                    key={currentImage.id}
                                                    src={currentImage.thumbnailUrl?.trim() || currentImage.imageUrl}
                                                    alt={currentImage.albumTitle || currentImage.altText || currentImage.caption || "DG Vision Studio"}
                                                    loading="eager"
                                                    decoding="async"
                                                    className={`absolute inset-0 h-full w-full object-cover object-top ${isTransitioning ? (direction === 1 ? "animate-slide-in-right" : "animate-slide-in-left") : ""}`}
                                                />
                                            </button>
                                        ) : null}
                                    </>
                                )}

                                <div className="absolute inset-x-0 bottom-0 z-20 bg-black/78 px-4 py-4 text-white backdrop-blur-sm sm:px-5 sm:py-5 lg:px-7 lg:py-6">
                                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={goPrevious}
                                            disabled={!currentImage || showingHardcodedVideo}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
                                            aria-label={isBg ? "Предишна снимка" : "Previous image"}
                                        >
                                            ‹
                                        </button>

                                        <div className="min-w-0 flex-1 text-center">
                                            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-xs">{slideshowEyebrow}</p>
                                            <p className="mx-auto mt-2 max-w-xl text-[15px] font-semibold leading-6 sm:text-[17px] lg:text-[20px] lg:leading-7">{slideshowDescription}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={goNext}
                                            disabled={!currentImage || showingHardcodedVideo}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
                                            aria-label={isBg ? "Следваща снимка" : "Next image"}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[1700px] px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 lg:py-12 xl:px-12 2xl:px-16">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                        {quickLinks.map((item) => (
                            <Link key={item.href} to={item.href} className="group border border-neutral-300 bg-white p-5 transition hover:-translate-y-1 hover:border-neutral-950 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-white sm:p-6">
                                <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-400">DG Vision Studio</p>
                                <p className="mt-3 text-[18px] font-bold text-neutral-950 dark:text-white sm:text-[20px]">{isBg ? item.bg : item.en}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[1700px] px-4 pb-12 sm:px-6 sm:pb-14 md:px-8 lg:px-10 lg:pb-16 xl:px-12 2xl:px-16">
                    <div className="mb-6 flex flex-col gap-3 sm:mb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-400">{isBg ? "Нашите услуги" : "Our services"}</p>
                            <h2 className="mt-3 max-w-4xl text-[28px] font-extrabold uppercase leading-[1.08] text-neutral-950 dark:text-white sm:text-[36px] md:text-[44px] lg:text-[50px]">
                                {isBg ? "Визуално съдържание за всяка история" : "Visual content for every story"}
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {serviceCards.map((item) => {
                            const title = isBg ? item.titleBg : item.titleEn
                            const description = isBg ? item.descBg : item.descEn

                            return (
                                <Link key={item.href} to={item.href} className="group overflow-hidden border border-neutral-300 bg-white transition hover:-translate-y-1 hover:border-neutral-950 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)] dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-white">
                                    <div className="aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-zinc-900">
                                        {item.image ? <img src={item.image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-400">{isBg ? "Услуга" : "Service"}</p>
                                        <h3 className="mt-3 text-[20px] font-bold text-neutral-950 dark:text-white sm:text-[22px]">{title}</h3>
                                        {description ? <p className="mt-3 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300">{description}</p> : null}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0.6; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideInLeft {
                        from { transform: translateX(-100%); opacity: 0.6; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutLeft {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(-100%); opacity: 0.6; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0.6; }
                    }
                    @keyframes homeLoadingBar {
                        0% { transform: translateX(-120%); }
                        100% { transform: translateX(220%); }
                    }
                    .animate-slide-in-right { animation: slideInRight 700ms ease-in-out forwards; }
                    .animate-slide-in-left { animation: slideInLeft 700ms ease-in-out forwards; }
                    .animate-slide-out-left { animation: slideOutLeft 700ms ease-in-out forwards; }
                    .animate-slide-out-right { animation: slideOutRight 700ms ease-in-out forwards; }
                `}</style>
            </div>

            {selectedSlideshowImage && selectedImageSrc ? (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedSlideshowImage(null)}
                >
                    <button
                        type="button"
                        aria-label={isBg ? "Затвори" : "Close"}
                        onClick={() => setSelectedSlideshowImage(null)}
                        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-2xl font-light text-white transition hover:bg-white hover:text-black sm:right-6 sm:top-6"
                    >
                        ×
                    </button>

                    <img
                        src={selectedImageSrc}
                        alt={selectedImageAlt}
                        className="max-h-[88vh] max-w-[94vw] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            ) : null}
        </>
    )
}
