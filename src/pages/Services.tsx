import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

type CategoryKey =
    | "all"
    | "snow"
    | "wedding"
    | "turquoise"
    | "landscape"

type PortfolioItem = {
    src: string
    category: CategoryKey
    categoryBg: string
    categoryEn: string
    titleBg: string
    titleEn: string
}

export default function Services() {
    const { i18n } = useTranslation()
    const lang = i18n.language
    const isBg = lang?.toLowerCase().startsWith("bg")

    const [activeCategory, setActiveCategory] = useState<CategoryKey>("all")
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const categories: {
        key: CategoryKey
        labelBg: string
        labelEn: string
    }[] = [
        { key: "all", labelBg: "Всички албуми", labelEn: "All Albums" },
        { key: "snow", labelBg: "Сняг", labelEn: "Snow" },
        { key: "wedding", labelBg: "Сватби", labelEn: "Weddings" },
        { key: "turquoise", labelBg: "Тюркоаз", labelEn: "Turquoise" },
        { key: "landscape", labelBg: "Пейзажи", labelEn: "Landscapes" },
    ]

    const portfolioItems: PortfolioItem[] = [
        {
            src: "/images/porfolio/650235666_122104710225277251_7176854112806431771_n.jpg",
            category: "landscape",
            categoryBg: "Пейзажи",
            categoryEn: "Landscapes",
            titleBg: "Пейзаж",
            titleEn: "Landscape",
        },

        {
            src: "/images/porfolio/snqg/641375147_122101709847277251_827037863896708668_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Зимна фотосесия",
            titleEn: "Winter Session",
        },
        {
            src: "/images/porfolio/snqg/641377125_122101709583277251_5958979724736947759_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Семеен кадър",
            titleEn: "Family Frame",
        },
        {
            src: "/images/porfolio/snqg/641416539_122101709805277251_8677250284073032946_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Портрет навън",
            titleEn: "Outdoor Portrait",
        },
        {
            src: "/images/porfolio/snqg/641423751_122101709535277251_8354687302531540257_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Зимен портрет",
            titleEn: "Winter Portrait",
        },
        {
            src: "/images/porfolio/snqg/641442985_122101709937277251_5457366667363920896_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Естествена светлина",
            titleEn: "Natural Light",
        },
        {
            src: "/images/porfolio/snqg/641509075_122101709673277251_3706959839988122228_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Креативен кадър",
            titleEn: "Creative Shot",
        },
        {
            src: "/images/porfolio/snqg/641546302_122101709493277251_6420918955358187600_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Празнична визия",
            titleEn: "Holiday Look",
        },
        {
            src: "/images/porfolio/snqg/641597983_122101709997277251_5678473421857308190_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Детски моменти",
            titleEn: "Kids Moments",
        },
        {
            src: "/images/porfolio/snqg/641719545_122101709757277251_6942496153785787737_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Топъл кадър",
            titleEn: "Warm Frame",
        },
        {
            src: "/images/porfolio/snqg/643314439_122101710021277251_8238292587505023432_n.jpg",
            category: "snow",
            categoryBg: "Сняг",
            categoryEn: "Snow",
            titleBg: "Зимен лайфстайл",
            titleEn: "Winter Lifestyle",
        },

        {
            src: "/images/porfolio/svatba/652218256_122105935065277251_6910562629463362805_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Сватбен момент",
            titleEn: "Wedding Moment",
        },
        {
            src: "/images/porfolio/svatba/652324174_122105935173277251_928166735313199811_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Романтичен кадър",
            titleEn: "Romantic Frame",
        },
        {
            src: "/images/porfolio/svatba/652662412_122105935227277251_5451408023515913260_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Булка и младоженец",
            titleEn: "Bride & Groom",
        },
        {
            src: "/images/porfolio/svatba/652929756_122105935101277251_5371404381692777414_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Детайл от деня",
            titleEn: "Day Detail",
        },
        {
            src: "/images/porfolio/svatba/653345408_122105935437277251_4254495819981584913_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Емоционален момент",
            titleEn: "Emotional Moment",
        },
        {
            src: "/images/porfolio/svatba/653759335_122105935497277251_2075686935719957022_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Церемония",
            titleEn: "Ceremony",
        },
        {
            src: "/images/porfolio/svatba/654688641_122105935335277251_7457760121515071198_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Сватбен портрет",
            titleEn: "Wedding Portrait",
        },
        {
            src: "/images/porfolio/svatba/654796604_122105935269277251_6083788571253739878_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Черно-бял кадър",
            titleEn: "Black & White Shot",
        },
        {
            src: "/images/porfolio/svatba/654846086_122105935389277251_2252568087198579211_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Прегръдка",
            titleEn: "Embrace",
        },
        {
            src: "/images/porfolio/svatba/654965058_122105935551277251_1647099086538045574_n.jpg",
            category: "wedding",
            categoryBg: "Сватба",
            categoryEn: "Wedding",
            titleBg: "Финален кадър",
            titleEn: "Final Shot",
        },

        {
            src: "/images/porfolio/turquaz/639766578_122099975367277251_3978753087381724830_n.jpg",
            category: "turquoise",
            categoryBg: "Тюркоаз",
            categoryEn: "Turquoise",
            titleBg: "Студиен портрет",
            titleEn: "Studio Portrait",
        },
        {
            src: "/images/porfolio/turquaz/640072369_122099975331277251_8854217072496019133_n.jpg",
            category: "turquoise",
            categoryBg: "Тюркоаз",
            categoryEn: "Turquoise",
            titleBg: "Елегантен кадър",
            titleEn: "Elegant Shot",
        },
        {
            src: "/images/porfolio/turquaz/640365873_122099976543277251_3510489861658993091_n.jpg",
            category: "turquoise",
            categoryBg: "Тюркоаз",
            categoryEn: "Turquoise",
            titleBg: "Креативна визия",
            titleEn: "Creative Look",
        },
        {
            src: "/images/porfolio/turquaz/640973347_122099975325277251_9203183424506999673_n.jpg",
            category: "turquoise",
            categoryBg: "Тюркоаз",
            categoryEn: "Turquoise",
            titleBg: "Цветен портрет",
            titleEn: "Color Portrait",
        },
    ]

    const filteredItems = useMemo(() => {
        if (activeCategory === "all") return portfolioItems
        return portfolioItems.filter((item) => item.category === activeCategory)
    }, [activeCategory])

    const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

    useEffect(() => {
        setSelectedIndex(null)
    }, [activeCategory])

    useEffect(() => {
        if (selectedIndex === null) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null)
            if (e.key === "ArrowRight") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === filteredItems.length - 1 ? 0 : prev + 1
                })
            }
            if (e.key === "ArrowLeft") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === 0 ? filteredItems.length - 1 : prev - 1
                })
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedIndex, filteredItems])

    return (
        <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-950">
            <div className="border-b border-neutral-300 bg-neutral-50 px-4 py-8 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px]">
                    <h1 className="text-center text-3xl font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                        {isBg ? "Портфолио" : "Portfolio"}
                    </h1>
                </div>
            </div>

            <div className="border-b border-neutral-300 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mx-auto flex max-w-[1600px] justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex w-full justify-start overflow-x-auto sm:justify-center">
                        <div className="flex min-w-max items-center gap-4 py-4 sm:gap-6 lg:gap-8">
                            {categories.map((category) => {
                                const active = activeCategory === category.key

                                return (
                                    <button
                                        key={category.key}
                                        type="button"
                                        onClick={() => setActiveCategory(category.key)}
                                        className={`relative whitespace-nowrap pb-2 text-xs font-bold uppercase tracking-[0.05em] transition sm:text-sm ${
                                            active
                                                ? "text-neutral-900 dark:text-white"
                                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                        }`}
                                    >
                                        {isBg ? category.labelBg : category.labelEn}

                                        <span
                                            className={`absolute bottom-0 left-0 h-[3px] transition-all ${
                                                active
                                                    ? "w-full bg-neutral-900 dark:bg-white"
                                                    : "w-0 bg-neutral-900 dark:bg-white"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full bg-neutral-300 px-[1px] py-[1px] dark:bg-neutral-900">
                <div className="columns-2 gap-[1px] sm:columns-3 lg:columns-4 xl:columns-5">
                    {filteredItems.map((item, index) => (
                        <button
                            key={`${item.src}-${index}`}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className="group relative mb-[1px] block w-full break-inside-avoid overflow-hidden bg-neutral-100 text-left dark:bg-neutral-950"
                        >
                            <img
                                src={item.src}
                                alt={isBg ? item.titleBg : item.titleEn}
                                loading="lazy"
                                className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]"
                            />

                            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/30" />

                            <div className="absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                                    {isBg ? item.categoryBg : item.categoryEn}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {isBg ? item.titleBg : item.titleEn}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6"
                    onClick={() => setSelectedIndex(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedIndex(null)}
                        className="absolute right-3 top-3 z-[1000] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                        aria-label={isBg ? "Затвори" : "Close"}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    {filteredItems.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedIndex((prev) =>
                                        prev === null ? prev : prev === 0 ? filteredItems.length - 1 : prev - 1
                                    )
                                }}
                                className="absolute left-2 top-1/2 z-[1000] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:left-6 sm:h-12 sm:w-12"
                                aria-label={isBg ? "Предишна" : "Previous"}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                >
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedIndex((prev) =>
                                        prev === null ? prev : prev === filteredItems.length - 1 ? 0 : prev + 1
                                    )
                                }}
                                className="absolute right-2 top-1/2 z-[1000] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:right-6 sm:h-12 sm:w-12"
                                aria-label={isBg ? "Следваща" : "Next"}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                >
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </button>
                        </>
                    )}

                    <div
                        className="relative flex max-h-full max-w-[96vw] flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedItem.src}
                            alt={isBg ? selectedItem.titleBg : selectedItem.titleEn}
                            className="max-h-[78vh] max-w-[96vw] object-contain sm:max-h-[82vh]"
                        />

                        <div className="mt-4 px-6 text-center">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/65 sm:text-[11px]">
                                {isBg ? selectedItem.categoryBg : selectedItem.categoryEn}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                                {isBg ? selectedItem.titleBg : selectedItem.titleEn}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}