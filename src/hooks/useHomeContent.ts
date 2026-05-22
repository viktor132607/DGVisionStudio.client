import { useMemo } from "react"
import { usePortfolioData } from "./usePortfolioData"
import type { HomeDynamicCard, QuickLink } from "../types/home"

const API_STATIC_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

function resolveStaticAssetUrl(value?: string | null) {
    const path = (value || "").trim()

    if (!path) return "/og-cover.jpg"
    if (/^(https?:|data:|blob:)/i.test(path)) return path
    if (path.startsWith("/images/") || path.startsWith("/uploads/")) {
        return API_STATIC_BASE_URL ? `${API_STATIC_BASE_URL}${path}` : path
    }

    return path
}

const CATEGORY_TRANSLATIONS: Record<
    string,
    {
        titleBg: string
        titleEn: string
        descBg: string
        descEn: string
        fallbackImage?: string
    }
> = {
    portrait: {
        titleBg: "Портретна фотография",
        titleEn: "Portrait Photography",
        descBg: "Индивидуални, артистични и професионални портрети с изчистена визия и силно присъствие.",
        descEn: "Individual, artistic, and professional portraits with a clean visual style and strong presence.",
        fallbackImage: "/images/portfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/641416539_122101709805277251_8677250284073032946_n.jpg",
    },

    graduate: {
        titleBg: "Абитуриентска фотография",
        titleEn: "Graduation Photography",
        descBg: "Елегантни и запомнящи се кадри за абитуриенти с изразен стил и настроение.",
        descEn: "Elegant and memorable images for graduates with a distinct style and mood.",
        fallbackImage: "/images/portfolio/балове/Бал Азра/639766578_122099975367277251_3978753087381724830_n.jpg",
    },
    baptism: {
        titleBg: "Заснемане на кръщене",
        titleEn: "Baptism Photography",
        descBg: "Дискретно и емоционално заснемане на важни семейни и ритуални моменти.",
        descEn: "Discreet and emotional coverage of important family and ceremonial moments.",
        fallbackImage: "/images/portfolio/кръщенета/Кръщене 1/2U2A2111.jpg",
    },
    wedding: {
        titleBg: "Сватбена фотография",
        titleEn: "Wedding Photography",
        descBg: "Емоционални и стилни кадри, които запазват атмосферата, хората и най-силните моменти.",
        descEn: "Emotional and stylish images that preserve the atmosphere, people, and strongest moments.",
        fallbackImage: "/images/portfolio/СВАТБИ/СВАТБА 3/2U2A1723.jpg",
    },
    family: {
        titleBg: "Семейна фотография",
        titleEn: "Family Photography",
        descBg: "Топли, естествени и запомнящи се кадри за семейства, деца и лични поводи.",
        descEn: "Warm, natural, and memorable sessions for families, children, and personal occasions.",
        fallbackImage: "/images/portfolio/кръщенета/Кръщене 1/2U2A2198.jpg",
    },
    maternity: {
        titleBg: "Фотосесия за бременни",
        titleEn: "Maternity Photography",
        descBg: "Нежни и естетични кадри, които запазват усещането за този специален период.",
        descEn: "Soft and aesthetic images that preserve the feeling of this special period.",
        fallbackImage: "/images/portfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6404.jpg",
    },
    landscape: {
        titleBg: "Пейзажна фотография",
        titleEn: "Landscape Photography",
        descBg: "Силни визуални кадри от природни и градски пространства с атмосфера и дълбочина.",
        descEn: "Strong visual frames from natural and urban spaces with atmosphere and depth.",
        fallbackImage: "/images/portfolio/ПЕЙЗАЖИ/650235666_122104710225277251_7176854112806431771_n.jpg",
    },
    event: {
        titleBg: "Заснемане на събития",
        titleEn: "Event Photography",
        descBg: "Отразяване на различни събития, събирания и поводи с фокус върху атмосферата и ключовите моменти.",
        descEn: "Coverage of events and gatherings with a focus on atmosphere and key moments.",
        fallbackImage: "/images/portfolio/events/bulgare/1.jpg",
    },
}

const HOME_SERVICE_ORDER = [
    "portrait",
    "product",
    "commercial",
    "corporate",
    "graduate",
    "baptism",
    "wedding",
    "landscape",
    "event",
]

function titleCase(value: string) {
    if (!value) return ""
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function fallbackTranslation(key: string, name?: string) {
    const clean = (name || key || "").trim()
    const formatted = titleCase(clean)
    return {
        titleBg: formatted,
        titleEn: formatted,
        descBg: "",
        descEn: "",
        fallbackImage: "/og-cover.jpg",
    }
}

export function useHomeContent() {
    const { categoriesData, albumsData, imagesData } = usePortfolioData()

    const activeCategories = useMemo(() => {
        return [...categoriesData]
            .filter((category) => category.isActive)
            .sort(
                (a, b) =>
                    (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                    (a.id ?? 0) - (b.id ?? 0)
            )
    }, [categoriesData])

    const categoriesByKey = useMemo(() => {
        return new Map(activeCategories.map((category) => [category.key, category]))
    }, [activeCategories])

    const quickLinks = useMemo<QuickLink[]>(() => {
        return activeCategories.map((category) => {
            const translation =
                CATEGORY_TRANSLATIONS[category.key] ??
                fallbackTranslation(category.key, category.name)

            return {
                href: `/portfolio#${category.key}`,
                bg: translation.titleBg,
                en: translation.titleEn,
            }
        })
    }, [activeCategories])

    const serviceCards = useMemo<HomeDynamicCard[]>(() => {
        return HOME_SERVICE_ORDER.map((key, index) => {
            const category = categoriesByKey.get(key)
            const translation =
                CATEGORY_TRANSLATIONS[key] ??
                fallbackTranslation(key, category?.name)

            const categoryAlbums = category
                ? albumsData
                      .filter(
                          (album) =>
                              album.portfolioCategoryId === category.id &&
                              album.isPublished
                      )
                      .sort(
                          (a, b) =>
                              (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                              (a.id ?? 0) - (b.id ?? 0)
                      )
                : []

            const categoryImages = category
                ? imagesData
                      .filter(
                          (image) =>
                              image.isPublished &&
                              categoryAlbums.some(
                                  (album) => album.id === image.portfolioAlbumId
                              )
                      )
                      .sort((a, b) => {
                          if (a.isCover !== b.isCover) return a.isCover ? -1 : 1
                          return (
                              (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                              (a.id ?? 0) - (b.id ?? 0)
                          )
                      })
                : []

            const coverAlbum = categoryAlbums[0]

            const coverImage = resolveStaticAssetUrl(
                coverAlbum?.coverImageUrl ||
                categoryImages[0]?.thumbnailUrl ||
                categoryImages[0]?.imageUrl ||
                translation.fallbackImage ||
                "/og-cover.jpg"
            )

            return {
                id: category?.id ?? index + 1,
                href: category ? `/portfolio#${category.key}` : "/pricing",
                image: coverImage,
                titleBg: translation.titleBg,
                titleEn: translation.titleEn,
                descBg: translation.descBg,
                descEn: translation.descEn,
            }
        })
    }, [categoriesByKey, albumsData, imagesData])

    return {
        quickLinks,
        serviceCards,
    }
}
