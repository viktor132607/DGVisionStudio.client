import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import Seo from "../components/Seo"
import { useHomeContent } from "../hooks/useHomeContent"
import { useHomePortfolioSlideshow } from "../hooks/useHomePortfolioSlideshow"
import { useThemeLogo } from "../hooks/useThemeLogo"
import { resolveAssetUrl } from "../utils/resolveAssetUrl"

export default function Home() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const logoSrc = useThemeLogo()
    const { quickLinks, serviceCards } = useHomeContent()
    const { introVideoUrl, currentImage, previousImage, isTransitioning, direction, isMobile, goNext, goPrevious } =
        useHomePortfolioSlideshow(4500, 700)

    const activeIntroVideoSrc = introVideoUrl ? resolveAssetUrl(introVideoUrl) : ""
    const hasIntroVideo = Boolean(activeIntroVideoSrc)
    const introVideoRef = useRef<HTMLVideoElement | null>(null)
    const [introVideoDone, setIntroVideoDone] = useState(!hasIntroVideo)
    const [isVideoMuted, setIsVideoMuted] = useState(false)

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

    const showingIntroVideo = hasIntroVideo && !introVideoDone

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

            <div className="min-h-screen overflow-x-hidden bg-neutral-100 text-neutral-900 dark:bg-zinc-900 dark:text-white">
                <section className="border-b border-neutral-300 bg-white pt-6 sm:pt-7 lg:pt-8 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="mx-auto grid min-h-[auto] w-full max-w-[1700px] grid-cols-1 lg:min-h-[620px] lg:grid-cols-[1.08fr_0.92fr] xl:min-h-[700px] 2xl:min-h-[760px]">
                        <div className="order-2 flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:order-1 lg:px-10 lg:py-16 xl:px-14 2xl:px-20">
                            <img
                                src={logoSrc}
                                alt="DG Vision Studio"
                                className="mb-4 block h-auto w-[220px] max-w-full object-contain sm:mb-5 sm:w-[260px] md:w-[300px]"
                            />

                            <h1 className="max-w-4xl text-[28px] font-extrabold uppercase leading-[1.06] tracking-[0.02em] text-neutral-950 dark:text-white sm:text-[36px] md:text-[44px] md:leading-[1.05] lg:text-[50px] xl:text-[60px] 2xl:text-[68px]">
                                {isBg
                                    ? "Фотография и визуално съдържание със стил, характер и ясно присъствие"
                                    : "Photography and visual content with style, character, and clear presence"}
                            </h1>

                            <p className="mt-5 max-w-2xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:mt-6 sm:text-[15px] sm:leading-8 md:text-[16px] lg:max-w-[640px] xl:max-w-[700px]">
                                {isBg
                                    ? "Създаваме модерно визуално съдържание за брандове, продукти, кампании и лични фотосесии. Подходът ни е изчистен, силно визуален и насочен към кадри, които остават."
                                    : "We create modern visual content for brands, products, campaigns, and personal photoshoots. Our approach is clean, visually strong, and focused on images that stay with people."}
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4 lg:mt-10">
                                <Link
                                    to="/portfolio"
                                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-none border border-neutral-950 bg-neutral-950 px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:min-h-[52px] sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    {isBg ? "Виж портфолио" : "View Portfolio"}
                                </Link>

                                <Link
                                    to="/contact"
                                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-none border border-neutral-400 bg-transparent px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-900 transition hover:border-neutral-950 hover:bg-neutral-100 dark:border-zinc-500 dark:text-white dark:hover:border-white dark:hover:bg-zinc-800 sm:min-h-[52px] sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    {isBg ? "Свържи се" : "Contact"}
                                </Link>
                            </div>
                        </div>

                        <div className="order-1 relative aspect-[9/16] min-h-0 overflow-hidden border-b border-neutral-300 bg-black dark:border-zinc-700 sm:aspect-[9/16] md:aspect-[9/16] lg:order-2 lg:aspect-auto lg:min-h-full lg:border-b-0 lg:border-l">
                            <div className="relative h-full w-full overflow-hidden bg-neutral-950">
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
                                            className="absolute inset-0 h-full w-full object-contain object-center lg:object-cover lg:object-top"
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
                                            onClick={toggleVideoMute}
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

                            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/65 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 md:px-7 lg:px-6 xl:px-8">
                                <div className="flex items-center justify-between gap-3">
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
                                        className="min-w-0 flex-1 animate-[fadeUp_500ms_ease-out] text-center"
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

                <section className="border-b border-neutral-300 bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="mx-auto max-w-[1700px]">
                        <div className="grid grid-cols-2 gap-[1px] bg-neutral-200 text-center dark:bg-zinc-800 sm:grid-cols-3 xl:grid-cols-6">
                            {quickLinks.map((item) => (
                                <Link
                                    key={item.href + item.bg}
                                    to={item.href}
                                    className="flex min-h-[42px] items-center justify-center bg-neutral-200 px-2 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-700 transition hover:bg-white hover:text-neutral-950 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white sm:text-xs sm:tracking-[0.18em]"
                                >
                                    {isBg ? item.bg : item.en}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-neutral-100 py-12 dark:bg-zinc-900 sm:py-16 lg:py-20 xl:py-24">
                    <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-10">
                        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
                            <h2 className="text-[28px] font-extrabold uppercase tracking-[0.06em] text-neutral-950 dark:text-white sm:text-[34px] md:text-[40px] xl:text-[44px]">
                                {isBg ? "Услуги" : "Services"}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {serviceCards.map((card) => (
                                <Link
                                    key={card.id}
                                    to={card.href}
                                    className="group overflow-hidden border border-neutral-300 bg-white transition hover:-translate-y-1 hover:border-neutral-950 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-white"
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
                                        <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white">
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
        </>
    )
}
