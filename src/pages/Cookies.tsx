import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

export default function Cookies() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const cookiesJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: isBg ? "Политика за бисквитките" : "Cookies Policy",
        url: "https://dgvisionstudio.com/cookies",
        description: isBg
            ? "Политиката за бисквитките на DG Vision Studio относно localStorage, настройки, банера за бисквитки и външно съдържание като Google Maps."
            : "The DG Vision Studio cookies policy regarding browser storage, settings, the cookie banner, and external content such as Google Maps.",
        isPartOf: {
            "@type": "WebSite",
            name: "DG Vision Studio",
            url: "https://dgvisionstudio.com",
        },
    }

    const wrapperClass =
        "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-900"

    const titleClass =
        "text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl"

    const updatedClass =
        "mt-3 text-center text-sm font-medium text-slate-500 dark:text-zinc-400"

    const cardClass =
        "mt-8 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:p-8"

    const headingClass =
        "mt-8 mb-4 text-2xl font-bold text-slate-900 dark:text-white first:mt-0"

    const textClass =
        "text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base"

    const groupClass = "space-y-4"

    const listClass =
        "mt-4 list-disc space-y-3 pl-5 text-[15px] leading-8 text-slate-700 marker:text-sky-500 dark:text-zinc-200 dark:marker:text-white sm:text-base"

    return isBg ? (
        <>
            <Seo
                title="Политика за бисквитките"
                description="Политиката за бисквитките на DG Vision Studio относно localStorage, настройки, банера за бисквитки и външно съдържание като Google Maps."
                canonical="/cookies"
                image="/og-cover.jpg"
                type="website"
                jsonLd={cookiesJsonLd}
            />

            <div className={wrapperClass}>
                <h1 className={titleClass}>Политика за бисквитките</h1>
                <p className={updatedClass}>
                    Последна актуализация: <span className="font-semibold text-slate-700 dark:text-zinc-200">29 март 2026 г.</span>
                </p>

                <div className={cardClass}>
                    <h2 className={headingClass}>Въведение</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Тази политика за бисквитките обяснява как DG Vision Studio използва локално съхранение в браузъра, бисквитки и вградено външно съдържание в този сайт.
                        </p>
                        <p className={textClass}>
                            Към текущия етап сайтът е основно статичен и не използва маркетингови или рекламни бисквитки.
                        </p>
                    </div>

                    <h2 className={headingClass}>Какво използва сайтът в момента</h2>
                    <ul className={listClass}>
                        <li>
                            <strong>Необходими настройки:</strong> сайтът запазва в браузъра избрани настройки като тема и избора ви от банера за бисквитките.
                        </li>
                        <li>
                            <strong>Външно вградено съдържание:</strong> страницата за контакт може да зареди Google Maps карта, но само ако приемете незадължителното външно съдържание.
                        </li>
                        <li>
                            <strong>Няма активни marketing / ads cookies:</strong> към този етап сайтът не използва рекламни, ремаркетинг или tracking пиксели.
                        </li>
                        <li>
                            <strong>Няма активни analytics cookies:</strong> към този етап не са активирани Google Analytics, Meta Pixel, Hotjar, Clarity или подобни инструменти.
                        </li>
                    </ul>

                    <h2 className={headingClass}>Какво представляват бисквитките и сходните технологии</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Бисквитките са малки файлове, които се записват в браузъра ви. Сайтът може да използва и сходни технологии като localStorage за запазване на настройки.
                        </p>
                        <p className={textClass}>
                            В този проект основното използване е свързано с избор на тема и с това дали сте приели или отказали незадължителното външно съдържание.
                        </p>
                    </div>

                    <h2 className={headingClass}>Каква е логиката на банера</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            При първо посещение се показва банер за бисквитки с избор „Приемам“ или „Отказвам“.
                        </p>
                        <p className={textClass}>
                            Изборът се записва локално в браузъра, за да не се показва банерът при всяко посещение.
                        </p>
                        <p className={textClass}>
                            <strong>„Приемам“:</strong> разрешавате зареждането на незадължително външно съдържание, като Google Maps embed.
                        </p>
                        <p className={textClass}>
                            <strong>„Отказвам“:</strong> запазва се само самият избор, а картата не се зарежда; вместо това остава само линк за отваряне в Google Maps.
                        </p>
                    </div>

                    <h2 className={headingClass}>Как можете да управлявате избора си</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Можете да премахнете запазения избор, като изчистите данните за сайта от браузъра си.
                        </p>
                        <p className={textClass}>
                            След това банерът ще се появи отново и ще можете да направите нов избор.
                        </p>
                    </div>

                    <h2 className={headingClass}>Трети страни</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Ако приемете незадължителното външно съдържание, страницата за контакт може да зареди карта от Google Maps.
                        </p>
                        <p className={textClass}>
                            При зареждане на такава услуга е възможно съответната външна платформа да използва собствени технологии според своите политики.
                        </p>
                    </div>

                    <h2 className={headingClass}>Промени в тази политика</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Тази политика може да бъде обновявана при промени по сайта, по използваните услуги или при добавяне на нови инструменти като аналитика.
                        </p>
                        <p className={textClass}>
                            Актуалната версия винаги е публикувана на тази страница.
                        </p>
                    </div>

                    <h2 className={headingClass}>Контакт</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Ако имате въпроси относно използването на бисквитки и подобни технологии в сайта, можете да се свържете с DG Vision Studio чрез страницата за контакт.
                        </p>
                    </div>
                </div>
            </div>
        </>
    ) : (
        <>
            <Seo
                title="Cookies Policy"
                description="The DG Vision Studio cookies policy regarding browser storage, settings, the cookie banner, and external content such as Google Maps."
                canonical="/cookies"
                image="/og-cover.jpg"
                type="website"
                jsonLd={cookiesJsonLd}
            />

            <div className={wrapperClass}>
                <h1 className={titleClass}>Cookies Policy</h1>
                <p className={updatedClass}>
                    Last updated: <span className="font-semibold text-slate-700 dark:text-zinc-200">29 March 2026</span>
                </p>

                <div className={cardClass}>
                    <h2 className={headingClass}>Introduction</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            This Cookies Policy explains how DG Vision Studio uses browser storage, cookies, and embedded external content on this website.
                        </p>
                        <p className={textClass}>
                            At the current stage, the website is mainly static and does not use marketing or advertising cookies.
                        </p>
                    </div>

                    <h2 className={headingClass}>What the Website Currently Uses</h2>
                    <ul className={listClass}>
                        <li>
                            <strong>Necessary settings:</strong> the website stores selected preferences such as theme and your cookie-banner choice in the browser.
                        </li>
                        <li>
                            <strong>Embedded external content:</strong> the contact page may load a Google Maps embed, but only if you accept optional external content.
                        </li>
                        <li>
                            <strong>No active marketing / ads cookies:</strong> the website does not currently use advertising, remarketing, or tracking pixels.
                        </li>
                        <li>
                            <strong>No active analytics cookies:</strong> Google Analytics, Meta Pixel, Hotjar, Clarity, or similar tools are not currently active.
                        </li>
                    </ul>

                    <h2 className={headingClass}>What Cookies and Similar Technologies Are</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            Cookies are small files stored in your browser. A website may also use similar technologies such as localStorage to keep settings.
                        </p>
                        <p className={textClass}>
                            In this project, the main use is related to theme selection and whether you accepted or declined optional external content.
                        </p>
                    </div>

                    <h2 className={headingClass}>How the Banner Logic Works</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            On your first visit, a cookie banner is shown with the options “Accept” or “Decline”.
                        </p>
                        <p className={textClass}>
                            Your choice is stored locally in the browser so the banner does not appear on every visit.
                        </p>
                        <p className={textClass}>
                            <strong>“Accept”:</strong> you allow optional external content such as the Google Maps embed to load.
                        </p>
                        <p className={textClass}>
                            <strong>“Decline”:</strong> only the choice itself is stored, while the map does not load and only a link to open Google Maps remains.
                        </p>
                    </div>

                    <h2 className={headingClass}>How You Can Manage Your Choice</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            You can remove your saved choice by clearing the website data in your browser.
                        </p>
                        <p className={textClass}>
                            After that, the banner will appear again and you will be able to choose again.
                        </p>
                    </div>

                    <h2 className={headingClass}>Third Parties</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            If you accept optional external content, the contact page may load a map from Google Maps.
                        </p>
                        <p className={textClass}>
                            When such a service is loaded, the external platform may use its own technologies under its own policies.
                        </p>
                    </div>

                    <h2 className={headingClass}>Changes to This Policy</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            This policy may be updated when the website changes, when external services change, or when new tools such as analytics are added.
                        </p>
                        <p className={textClass}>
                            The latest version is always published on this page.
                        </p>
                    </div>

                    <h2 className={headingClass}>Contact</h2>
                    <div className={groupClass}>
                        <p className={textClass}>
                            If you have questions about the use of cookies and similar technologies on this website, you can contact DG Vision Studio through the contact page.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}