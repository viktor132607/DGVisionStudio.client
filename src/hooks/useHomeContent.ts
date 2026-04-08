import { useMemo } from "react"
import { usePortfolioData } from "./usePortfolioData"
import type { HomeDynamicCard, QuickLink } from "../types/home"

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
        fallbackImage: "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/641416539_122101709805277251_8677250284073032946_n.jpg",
    },
    product: {
        titleBg: "Продуктова фотография",
        titleEn: "Product Photography",
        descBg: "Кадри за продукти, брандове и онлайн магазини с фокус върху детайла и представянето.",
        descEn: "Visuals for products, brands, and online stores with focus on detail and presentation.",
        fallbackImage: "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6355.jpg",
    },
    commercial: {
        titleBg: "Рекламна фотография",
        titleEn: "Commercial Photography",
        descBg: "Съдържание за кампании, социални мрежи и онлайн присъствие с ясно визуално послание.",
        descEn: "Content for campaigns, social media, and online presence with a clear visual message.",
        fallbackImage: "/images/porfolio/events/bulgare/2.jpg",
    },
    corporate: {
        titleBg: "Корпоративна фотография",
        titleEn: "Corporate Photography",
        descBg: "Професионални кадри за екипи, бизнес среда, услуги и фирмено присъствие.",
        descEn: "Professional visuals for teams, business environments, services, and company presence.",
        fallbackImage: "/images/porfolio/ПЕЙЗАЖИ/650235666_122104710225277251_7176854112806431771_n.jpg",
    },
    graduate: {
        titleBg: "Абитуриентска фотография",
        titleEn: "Graduation Photography",
        descBg: "Елегантни и запомнящи се кадри за абитуриенти с изразен стил и настроение.",
        descEn: "Elegant and memorable images for graduates with a distinct style and mood.",
        fallbackImage: "/images/porfolio/балове/Бал Азра/639766578_122099975367277251_3978753087381724830_n.jpg",
    },
    // birthday: {
    //     titleBg: "Фотография за рожден ден",
    //     titleEn: "Birthday Photography",
    //     descBg: "Емоционални и живи кадри за лични празници и специални поводи.",
    //     descEn: "Emotional and lively visuals for birthdays and personal celebrations.",
    //     fallbackImage: "/images/porfolio/балове/Бал Азра/639766578_122099975367277251_3978753087381724830_n.jpg",
    // },
    // christmas: {
    //     titleBg: "Коледна фотография",
    //     titleEn: "Christmas Photography",
    //     descBg: "Топли и празнични сесии с уютна атмосфера и сезонно настроение.",
    //     descEn: "Warm holiday sessions with a cozy atmosphere and seasonal mood.",
    //     fallbackImage: "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2362.jpg",
    // },
    baptism: {
        titleBg: "Заснемане на кръщене",
        titleEn: "Baptism Photography",
        descBg: "Дискретно и емоционално заснемане на важни семейни и ритуални моменти.",
        descEn: "Discreet and emotional coverage of important family and ceremonial moments.",
        fallbackImage: "/images/porfolio/кръщенета/Кръщене 1/2U2A2111.jpg",
    },
    wedding: {
        titleBg: "Сватбена фотография",
        titleEn: "Wedding Photography",
        descBg: "Емоционални и стилни кадри, които запазват атмосферата, хората и най-силните моменти.",
        descEn: "Emotional and stylish images that preserve the atmosphere, people, and strongest moments.",
        fallbackImage: "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1723.jpg",
    },
    family: {
        titleBg: "Семейна фотография",
        titleEn: "Family Photography",
        descBg: "Топли, естествени и запомнящи се кадри за семейства, деца и лични поводи.",
        descEn: "Warm, natural, and memorable sessions for families, children, and personal occasions.",
        fallbackImage: "/images/porfolio/кръщенета/Кръщене 1/2U2A2198.jpg",
    },
    maternity: {
        titleBg: "Фотосесия за бременни",
        titleEn: "Maternity Photography",
        descBg: "Нежни и естетични кадри, които запазват усещането за този специален период.",
        descEn: "Soft and aesthetic images that preserve the feeling of this special period.",
        fallbackImage: "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6404.jpg",
    },
    landscape: {
        titleBg: "Пейзажна фотография",
        titleEn: "Landscape Photography",
        descBg: "Силни визуални кадри от природни и градски пространства с атмосфера и дълбочина.",
        descEn: "Strong visual frames from natural and urban spaces with atmosphere and depth.",
        fallbackImage: "/images/porfolio/ПЕЙЗАЖИ/650235666_122104710225277251_7176854112806431771_n.jpg",
    },
    event: {
        titleBg: "Заснемане на събития",
        titleEn: "Event Photography",
        descBg: "Отразяване на различни събития, събирания и поводи с фокус върху атмосферата и ключовите моменти.",
        descEn: "Coverage of events and gatherings with a focus on atmosphere and key moments.",
        fallbackImage: "/images/porfolio/events/bulgare/1.jpg",
    },
}

const HOME_SERVICE_ORDER = [
    "portrait",
    "product",
    "commercial",
    "corporate",
    "graduate",
    // "birthday",
    // "christmas",
    "baptism",
    "wedding",
    // "family",
    // "maternity",
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

            const coverImage =
                coverAlbum?.coverImageUrl ||
                categoryImages[0]?.thumbnailUrl ||
                categoryImages[0]?.imageUrl ||
                translation.fallbackImage ||
                "/og-cover.jpg"

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