import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

export default function About() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const aboutJsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: isBg ? "За нас" : "About Us",
        url: "https://dgvisionstudio.com/about",
        mainEntity: {
            "@type": "LocalBusiness",
            name: "DG Vision Studio",
            url: "https://dgvisionstudio.com",
            image: "https://dgvisionstudio.com/images/JS.jpg",
            email: "dgvisionstudio@gmail.com",
            telephone: "+359988758434",
            address: {
                "@type": "PostalAddress",
                addressLocality: "Ruse",
                addressCountry: "BG",
            },
            description: isBg
                ? "DG Vision Studio създава модерно визуално съдържание с фокус върху брандове, рекламни визии, портретна фотография и запомнящи се истории."
                : "DG Vision Studio creates modern visual content focused on brands, advertising, portrait photography, and memorable stories.",
        },
    }

    const sectionClass =
        "rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-7 xl:p-8"

    const textClass =
        "text-[14px] leading-7 text-slate-600 dark:text-zinc-200 sm:text-[15px] sm:leading-8 lg:text-[16px]"

    const smallTitleClass =
        "mb-4 text-[17px] font-semibold text-slate-900 dark:text-white sm:text-[18px] lg:text-[20px]"

    const bulletClass =
        "flex items-start gap-3 text-[14px] leading-7 text-slate-600 dark:text-zinc-200 sm:text-[15px] sm:leading-8 lg:text-[16px]"

    const bulletDot =
        "mt-[9px] h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500 dark:bg-white sm:mt-[11px]"

    return isBg ? (
        <>
            <Seo
                title="За нас"
                description="Научете повече за DG Vision Studio – модerno визуално съдържание, портретна фотография, бранд визии и професионален творчески подход."
                canonical="/about"
                image="/images/JS.jpg"
                type="website"
                jsonLd={aboutJsonLd}
            />

            <div className="mx-auto w-full max-w-[1600px] bg-white px-4 pb-12 pt-6 dark:bg-zinc-900 sm:px-6 sm:pb-14 sm:pt-8 md:px-8 md:pb-16 md:pt-10 lg:px-10 xl:px-12 2xl:px-16">
                <div className="grid gap-5 sm:gap-6 lg:gap-8 xl:gap-10">
                    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:rounded-[28px] lg:rounded-[32px]">
                        <img
                            src="/images/JS.jpg"
                            alt="DG Vision Studio"
                            className="h-[220px] w-full object-cover object-center sm:h-[300px] md:h-[360px] lg:h-[420px] xl:h-[500px] 2xl:h-[560px]"
                        />

                        <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-9 lg:px-10 lg:py-10 xl:px-12">
                            <h1 className="mb-4 text-center text-[28px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[34px] md:text-[38px] lg:text-[44px] xl:text-[48px]">
                                За DG Vision Studio
                            </h1>

                            <p className="mx-auto max-w-4xl text-center text-[15px] leading-7 text-slate-600 dark:text-zinc-200 sm:text-[16px] sm:leading-8 lg:text-[17px] xl:text-[18px]">
                                Създаваме модерно визуално съдържание с фокус върху брандове, рекламни визии,
                                портретна фотография и запомнящи се истории. Работим като екип от двама души,
                                обединени от общ стил, внимание към детайла и стремеж към силно визуално присъствие.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Нашият подход</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    За нас добрата фотография и видеография не са просто красив кадър, а инструмент
                                    за изграждане на идентичност, емоция и доверие. Подхождаме към всеки проект с
                                    ясна идея, усещане за стил и внимание към посланието зад визията.
                                </p>
                                <p className={textClass}>
                                    Работим както по комерсиални проекти за брандове и рекламни кампании, така и по
                                    лични, семейни и артистични фотосесии. Целта ни е всяка визия да носи характер и
                                    да оставя разпознаваем отпечатък.
                                </p>
                            </div>
                        </div>

                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Какво създаваме</h2>
                            <ul className="space-y-3">
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Бранд и рекламно съдържание за социални мрежи, кампании и онлайн присъствие
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Портретни фотосесии с личен, артистичен или професионален характер
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Съдържание за малки и големи екипи, продукти, услуги и визуални концепции
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Кадри, които комбинират естетика, идентичност и ясна комуникация
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Студио и възможности</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    Базирани сме в Русе и разполагаме със студийна среда, която позволява работа по
                                    различни типове проекти — от индивидуални портрети до по-мащабни снимачни дни.
                                </p>
                                <p className={textClass}>
                                    Използваме модерно оборудване, осветление, декори и аксесоари, които ни дават
                                    свобода да изграждаме професионална и последователна визия според нуждите на
                                    конкретния клиент.
                                </p>
                            </div>
                        </div>

                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Работа с клиенти</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    Вярваме, че добрият резултат идва от добра комуникация. Затова държим процесът да
                                    бъде ясен, подреден и приятен — от първата идея до финалната реализация.
                                </p>
                                <p className={textClass}>
                                    Работим с клиенти от различни градове и приемаме проекти и извън Русе. За нас
                                    всяка нова идея е възможност да изградим нещо отличимо, смело и запомнящо се.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className={smallTitleClass}>Нашата визия</h2>
                        <div className="space-y-4">
                            <p className={textClass}>
                                Обичаме кадри с характер. Търсим баланса между емоция, естетика и силно присъствие,
                                независимо дали снимаме човек, продукт или цялостна рекламна концепция.
                            </p>
                            <p className={textClass}>
                                Искаме всеки проект да изглежда завършен, съвременен и истински. Ако търсите
                                визуална идентичност, професионално отношение и креативна посока, DG Vision Studio е
                                мястото, където можем да го изградим заедно.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    ) : (
        <>
            <Seo
                title="About Us"
                description="Learn more about DG Vision Studio – modern visual content, portrait photography, brand visuals and a professional creative approach."
                canonical="/about"
                image="/images/JS.jpg"
                type="website"
                jsonLd={aboutJsonLd}
            />

            <div className="mx-auto w-full max-w-[1600px] bg-white px-4 pb-12 pt-6 dark:bg-zinc-900 sm:px-6 sm:pb-14 sm:pt-8 md:px-8 md:pb-16 md:pt-10 lg:px-10 xl:px-12 2xl:px-16">
                <div className="grid gap-5 sm:gap-6 lg:gap-8 xl:gap-10">
                    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:rounded-[28px] lg:rounded-[32px]">
                        <img
                            src="/images/JS.jpg"
                            alt="DG Vision Studio"
                            className="h-[220px] w-full object-cover object-center sm:h-[300px] md:h-[360px] lg:h-[420px] xl:h-[500px] 2xl:h-[560px]"
                        />

                        <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-9 lg:px-10 lg:py-10 xl:px-12">
                            <h1 className="mb-4 text-center text-[28px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[34px] md:text-[38px] lg:text-[44px] xl:text-[48px]">
                                About DG Vision Studio
                            </h1>

                            <p className="mx-auto max-w-4xl text-center text-[15px] leading-7 text-slate-600 dark:text-zinc-200 sm:text-[16px] sm:leading-8 lg:text-[17px] xl:text-[18px]">
                                We create modern visual content focused on brands, advertising, portrait photography
                                and memorable stories. We work as a two-person studio united by a shared style,
                                attention to detail and a strong sense of visual identity.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Our Approach</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    For us, good photography and videography are not just about beautiful images, but
                                    about creating identity, emotion and connection. Every project starts with a clear
                                    idea, a strong visual direction and attention to the message behind the frame.
                                </p>
                                <p className={textClass}>
                                    We work on both commercial projects for brands and campaigns, as well as personal,
                                    family and artistic sessions. Our goal is to create visuals with character and a
                                    lasting impression.
                                </p>
                            </div>
                        </div>

                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>What We Create</h2>
                            <ul className="space-y-3">
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Brand and advertising content for campaigns, social media and digital presence
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Portrait sessions with personal, artistic or professional focus
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Visual content for teams, products, services and creative concepts
                                    </span>
                                </li>
                                <li className={bulletClass}>
                                    <span className={bulletDot}></span>
                                    <span>
                                        Images that combine aesthetics, identity and clear communication
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Studio and Production</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    We are based in Ruse and work in a studio environment that supports different
                                    types of projects — from individual portraits to larger production days.
                                </p>
                                <p className={textClass}>
                                    We use modern equipment, lighting, backdrops and accessories that give us the
                                    flexibility to build a professional and consistent visual result for each client.
                                </p>
                            </div>
                        </div>

                        <div className={sectionClass}>
                            <h2 className={smallTitleClass}>Working With Clients</h2>
                            <div className="space-y-4">
                                <p className={textClass}>
                                    We believe great results come from good communication. That is why we keep the
                                    process clear, structured and easy — from the first idea to the final delivery.
                                </p>
                                <p className={textClass}>
                                    We work with clients from different cities and also take projects outside Ruse. For
                                    us, every new collaboration is a chance to create something distinctive, bold and
                                    memorable.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className={smallTitleClass}>Our Vision</h2>
                        <div className="space-y-4">
                            <p className={textClass}>
                                We are drawn to visuals with character. We look for the balance between emotion,
                                aesthetics and strong presence, whether we are photographing a person, a product or a
                                full campaign concept.
                            </p>
                            <p className={textClass}>
                                We want every project to feel complete, modern and authentic. If you are looking for
                                visual identity, professional execution and creative direction, DG Vision Studio is the
                                place where we can build it together.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}