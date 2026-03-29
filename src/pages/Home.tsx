import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

type ServiceCard = {
    href: string
    image: string
    titleBg: string
    titleEn: string
    descBg: string
    descEn: string
}

export default function Home() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const cards: ServiceCard[] = [
        {
            href: "/portfolio#turquoise",
            image: "/images/porfolio/turquaz/639766578_122099975367277251_3978753087381724830_n.jpg",
            titleBg: "Портретна фотография",
            titleEn: "Portrait Photography",
            descBg: "Индивидуални, артистични и професионални портрети с изчистена визия и силно присъствие.",
            descEn: "Individual, artistic, and professional portraits with a clean visual style and strong presence.",
        },
        {
            href: "/portfolio#turquoise",
            image: "/images/porfolio/turquaz/640072369_122099975331277251_8854217072496019133_n.jpg",
            titleBg: "Продуктова фотография",
            titleEn: "Product Photography",
            descBg: "Кадри за продукти, брандове и онлайн магазини с фокус върху детайла и представянето.",
            descEn: "Visuals for products, brands, and online stores with focus on detail and presentation.",
        },
        {
            href: "/portfolio#snow",
            image: "/images/porfolio/snqg/641416539_122101709805277251_8677250284073032946_n.jpg",
            titleBg: "Рекламна фотография",
            titleEn: "Commercial Photography",
            descBg: "Съдържание за кампании, социални мрежи и онлайн присъствие с ясно визуално послание.",
            descEn: "Content for campaigns, social media, and online presence with a clear visual message.",
        },
        {
            href: "/portfolio#landscape",
            image: "/images/porfolio/650235666_122104710225277251_7176854112806431771_n.jpg",
            titleBg: "Корпоративна фотография",
            titleEn: "Corporate Photography",
            descBg: "Професионални кадри за екипи, бизнес среда, услуги и фирмено присъствие.",
            descEn: "Professional visuals for teams, business environments, services, and company presence.",
        },
        {
            href: "/portfolio#turquoise",
            image: "/images/porfolio/turquaz/640973347_122099975325277251_9203183424506999673_n.jpg",
            titleBg: "Абитуриентска фотография",
            titleEn: "Graduation Photography",
            descBg: "Елегантни и запомнящи се кадри за абитуриенти с изразен стил и настроение.",
            descEn: "Elegant and memorable images for graduates with a distinct style and mood.",
        },
        {
            href: "/portfolio#snow",
            image: "/images/porfolio/snqg/641597983_122101709997277251_5678473421857308190_n.jpg",
            titleBg: "Заснемане на детски рожден ден",
            titleEn: "Kids Birthday Photography",
            descBg: "Енергични, топли и естествени кадри от детски празници и лични събития.",
            descEn: "Energetic, warm, and natural photography for kids' celebrations and personal events.",
        },
        {
            href: "/portfolio#wedding",
            image: "/images/porfolio/svatba/653345408_122105935437277251_4254495819981584913_n.jpg",
            titleBg: "Коледна фотосесия",
            titleEn: "Christmas Photoshoot",
            descBg: "Празнична атмосфера, сезонна визия и кадри с уютно, запомнящо се усещане.",
            descEn: "Festive mood, seasonal styling, and imagery with a warm memorable feel.",
        },
        {
            href: "/portfolio#wedding",
            image: "/images/porfolio/svatba/654846086_122105935389277251_2252568087198579211_n.jpg",
            titleBg: "Заснемане на кръщене",
            titleEn: "Baptism Photography",
            descBg: "Дискретно и емоционално заснемане на важни семейни и ритуални моменти.",
            descEn: "Discreet and emotional coverage of important family and ceremonial moments.",
        },
        {
            href: "/portfolio#wedding",
            image: "/images/porfolio/svatba/654688641_122105935335277251_7457760121515071198_n.jpg",
            titleBg: "Сватбена фотография",
            titleEn: "Wedding Photography",
            descBg: "Емоционални и стилни кадри, които запазват атмосферата, хората и най-силните моменти.",
            descEn: "Emotional and stylish images that preserve the atmosphere, people, and strongest moments.",
        },
        {
            href: "/portfolio#snow",
            image: "/images/porfolio/snqg/641423751_122101709535277251_8354687302531540257_n.jpg",
            titleBg: "Семейна фотография",
            titleEn: "Family Photography",
            descBg: "Топли, естествени и запомнящи се кадри за семейства, деца и лични поводи.",
            descEn: "Warm, natural, and memorable sessions for families, children, and personal occasions.",
        },
        {
            href: "/portfolio#wedding",
            image: "/images/porfolio/svatba/652929756_122105935101277251_5371404381692777414_n.jpg",
            titleBg: "Фотосесия за бременни",
            titleEn: "Maternity Photoshoot",
            descBg: "Нежни, стилни и емоционални кадри с фокус върху периода на очакване.",
            descEn: "Soft, stylish, and emotional imagery focused on the beauty of pregnancy.",
        },
    ]

    const quickLinks = [
        { href: "/portfolio#all", bg: "Всички албуми", en: "All Albums" },
        { href: "/portfolio#snow", bg: "Сняг", en: "Snow" },
        { href: "/portfolio#wedding", bg: "Сватби", en: "Weddings" },
        { href: "/portfolio#turquoise", bg: "Тюркоаз", en: "Turquoise" },
        { href: "/portfolio#landscape", bg: "Пейзажи", en: "Landscapes" },
        { href: "/portfolio#all", bg: "Портрети", en: "Portraits" },
        { href: "/portfolio#turquoise", bg: "Продукти", en: "Products" },
        { href: "/portfolio#snow", bg: "Кампании", en: "Campaigns" },
        { href: "/portfolio#landscape", bg: "Корпоративни", en: "Corporate" },
        { href: "/portfolio#wedding", bg: "Семейни", en: "Family" },
        { href: "/portfolio#wedding", bg: "Събития", en: "Events" },
    ]

    return (
        <div className="min-h-screen overflow-x-hidden bg-neutral-100 text-neutral-900 dark:bg-zinc-900 dark:text-white">
            <section className="border-b border-neutral-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mx-auto grid min-h-[auto] w-full max-w-[1700px] grid-cols-1 lg:min-h-[620px] lg:grid-cols-[1.08fr_0.92fr] xl:min-h-[700px] 2xl:min-h-[760px]">
                    <div className="order-2 flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:order-1 lg:px-10 lg:py-16 xl:px-14 2xl:px-20">
                        <span className="mb-4 inline-flex w-fit max-w-full self-start rounded-full border border-neutral-300 bg-neutral-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 sm:px-4 sm:text-[11px] sm:tracking-[0.28em] md:text-[12px]">
                            DG Vision Studio
                        </span>

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

                    <div className="order-1 relative min-h-[320px] overflow-hidden border-b border-neutral-300 dark:border-zinc-700 sm:min-h-[400px] md:min-h-[460px] lg:order-2 lg:min-h-full lg:border-b-0 lg:border-l">
                        <div className="grid h-full grid-cols-2 grid-rows-2 gap-[1px] bg-neutral-300 dark:bg-zinc-700">
                            <div className="relative overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                <img
                                    src="/images/porfolio/turquaz/640973347_122099975325277251_9203183424506999673_n.jpg"
                                    alt=""
                                    className="h-full w-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="relative overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                <img
                                    src="/images/porfolio/svatba/654688641_122105935335277251_7457760121515071198_n.jpg"
                                    alt=""
                                    className="h-full w-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="relative overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                <img
                                    src="/images/porfolio/snqg/641423751_122101709535277251_8354687302531540257_n.jpg"
                                    alt=""
                                    className="h-full w-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="relative overflow-hidden bg-neutral-200 dark:bg-zinc-800">
                                <img
                                    src="/images/porfolio/svatba/654846086_122105935389277251_2252568087198579211_n.jpg"
                                    alt=""
                                    className="h-full w-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/65 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 md:px-7 lg:px-6 xl:px-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[11px] sm:tracking-[0.28em] md:text-[12px]">
                                {isBg ? "Портрети · Брандове · Истории" : "Portraits · Brands · Stories"}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-white sm:text-sm md:text-[15px]">
                                {isBg
                                    ? "Съвременен визуален стил с внимание към детайла"
                                    : "Contemporary visual style with attention to detail"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-neutral-300 bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="mx-auto max-w-[1700px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 xl:px-10">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.href + item.bg}
                                to={item.href}
                                className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-700 transition hover:text-neutral-950 dark:text-zinc-200 dark:hover:text-white sm:text-xs sm:tracking-[0.18em]"
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
                        <p className="mx-auto mt-4 max-w-3xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8 md:text-[16px]">
                            {isBg
                                ? "Конкретните категории са свързани директно с портфолиото и всяка карта води към съответната секция."
                                : "The specific categories are linked directly to the portfolio and each card leads to its matching section."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-6">
                        {cards.map((card) => (
                            <Link
                                key={card.href + card.titleBg}
                                to={card.href}
                                className="group flex h-full flex-col overflow-hidden border border-neutral-300 bg-white no-underline transition duration-300 hover:-translate-y-1 hover:border-neutral-500 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 dark:bg-zinc-700">
                                    <img
                                        src={card.image}
                                        alt={isBg ? card.titleBg : card.titleEn}
                                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                </div>

                                <div className="flex flex-1 flex-col border-t border-neutral-300 px-4 py-4 dark:border-zinc-700 sm:px-5 sm:py-5">
                                    <h3 className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-neutral-950 dark:text-white sm:text-[15px] sm:tracking-[0.08em]">
                                        {isBg ? card.titleBg : card.titleEn}
                                    </h3>
                                    <p className="mt-3 flex-1 text-[13px] leading-6 text-neutral-600 dark:text-zinc-300 sm:min-h-[72px] sm:text-sm sm:leading-7">
                                        {isBg ? card.descBg : card.descEn}
                                    </p>
                                    <span className="mt-4 inline-flex text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white sm:text-[11px] sm:tracking-[0.18em]">
                                        {isBg ? "Виж повече" : "Learn More"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-neutral-300 bg-white py-12 dark:border-zinc-700 dark:bg-zinc-900 sm:py-16 lg:py-20">
                <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 xl:gap-12 xl:px-10">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-400 sm:text-[11px] sm:tracking-[0.28em]">
                            {isBg ? "Нашият подход" : "Our Approach"}
                        </p>
                        <h2 className="mt-4 max-w-3xl text-[28px] font-extrabold uppercase tracking-[0.04em] text-neutral-950 dark:text-white sm:text-[34px] md:text-[40px] sm:tracking-[0.06em]">
                            {isBg
                                ? "Силна визия, чиста композиция и разпознаваем стил"
                                : "Strong visuals, clean composition, and recognizable style"}
                        </h2>
                        <p className="mt-5 max-w-2xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8 md:text-[16px]">
                            {isBg
                                ? "Работим с внимание към светлина, атмосфера, детайл и усещане. Целта не е просто да има снимки, а кадри с присъствие, които носят характер и комуникират ясно."
                                : "We work with attention to light, atmosphere, detail, and feeling. The goal is not just to produce photos, but to create images with presence, character, and clear communication."}
                        </p>
                    </div>

                    <div className="grid gap-[1px] bg-neutral-300 dark:bg-zinc-700 min-[520px]:grid-cols-2">
                        <div className="bg-neutral-100 p-5 dark:bg-zinc-800 sm:p-6 lg:p-7">
                            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white sm:text-sm sm:tracking-[0.16em]">
                                {isBg ? "Стил" : "Style"}
                            </h3>
                            <p className="mt-3 text-[13px] leading-6 text-neutral-600 dark:text-zinc-300 sm:text-sm sm:leading-7">
                                {isBg
                                    ? "Изчистена и модерна визуална посока."
                                    : "A clean and modern visual direction."}
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-5 dark:bg-zinc-800 sm:p-6 lg:p-7">
                            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white sm:text-sm sm:tracking-[0.16em]">
                                {isBg ? "Детайл" : "Detail"}
                            </h3>
                            <p className="mt-3 text-[13px] leading-6 text-neutral-600 dark:text-zinc-300 sm:text-sm sm:leading-7">
                                {isBg
                                    ? "Прецизност в кадъра, светлината и обработката."
                                    : "Precision in framing, light, and post-processing."}
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-5 dark:bg-zinc-800 sm:p-6 lg:p-7">
                            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white sm:text-sm sm:tracking-[0.16em]">
                                {isBg ? "Идентичност" : "Identity"}
                            </h3>
                            <p className="mt-3 text-[13px] leading-6 text-neutral-600 dark:text-zinc-300 sm:text-sm sm:leading-7">
                                {isBg
                                    ? "Съдържание, което изгражда разпознаваем образ."
                                    : "Content that builds a recognizable image."}
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-5 dark:bg-zinc-800 sm:p-6 lg:p-7">
                            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-950 dark:text-white sm:text-sm sm:tracking-[0.16em]">
                                {isBg ? "Ефект" : "Impact"}
                            </h3>
                            <p className="mt-3 text-[13px] leading-6 text-neutral-600 dark:text-zinc-300 sm:text-sm sm:leading-7">
                                {isBg
                                    ? "Кадри, които оставят усещане и се помнят."
                                    : "Images that leave an impression and stay remembered."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-100 py-12 dark:bg-zinc-900 sm:py-16 lg:py-20">
                <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-[28px] font-extrabold uppercase tracking-[0.06em] text-neutral-950 dark:text-white sm:text-[34px] md:text-[40px] sm:tracking-[0.08em]">
                        {isBg
                            ? "Търсите силно визуално съдържание?"
                            : "Looking for strong visual content?"}
                    </h2>
                    <p className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8 md:text-[16px]">
                        {isBg
                            ? "Изпратете запитване и ще обсъдим какъв тип фотосесия, визуална концепция или съдържание е най-подходящо за вас или вашия бранд."
                            : "Send an inquiry and we will discuss what type of photoshoot, visual concept, or content best fits you or your brand."}
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex min-h-[48px] w-full max-w-[280px] items-center justify-center border border-neutral-950 bg-neutral-950 px-6 py-3 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:min-h-[52px] sm:w-auto sm:max-w-none sm:px-8 sm:text-sm sm:tracking-[0.18em]"
                        >
                            {isBg ? "Свържи се" : "Contact Us"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}