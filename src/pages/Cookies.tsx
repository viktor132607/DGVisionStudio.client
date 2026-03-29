import { useTranslation } from "react-i18next"

export default function Cookies() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

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
        <div className={wrapperClass}>
            <h1 className={titleClass}>Политика за бисквитките</h1>
            <p className={updatedClass}>
                Последна актуализация: <span className="font-semibold text-slate-700 dark:text-zinc-200">29 март 2026 г.</span>
            </p>

            <div className={cardClass}>
                <h2 className={headingClass}>Въведение</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Тази политика за бисквитките обяснява как DG Vision Studio използва бисквитки и сходни технологии в този уебсайт.
                    </p>
                    <p className={textClass}>
                        Целта е сайтът да работи коректно, да запомня вашите предпочитания и да ви дава ясен контрол върху незадължителните технологии.
                    </p>
                </div>

                <h2 className={headingClass}>Какво представляват бисквитките</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Бисквитките са малки текстови файлове, които се записват на вашето устройство при посещение на даден сайт.
                    </p>
                    <p className={textClass}>
                        Те могат да бъдат необходими за основната работа на сайта, за запомняне на настройки или за събиране на обобщена информация за използването му.
                    </p>
                </div>

                <h2 className={headingClass}>Какви бисквитки използваме</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Задължителни бисквитки:</strong> нужни са за основни функции на сайта, навигация, сигурност и правилно зареждане на съдържанието.
                    </li>
                    <li>
                        <strong>Бисквитки за предпочитания:</strong> запомнят избори като тема, език или решението ви от банера за бисквитките.
                    </li>
                    <li>
                        <strong>Аналитични бисквитки:</strong> могат да се използват за обобщени данни за посещения, поведение и производителност на сайта.
                    </li>
                    <li>
                        <strong>Бисквитки от вградени услуги:</strong> възможно е вградени елементи като карта, външни линкове или други услуги на трети страни да използват свои собствени технологии.
                    </li>
                </ul>

                <h2 className={headingClass}>За какво ги използваме</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Използваме бисквитки, за да поддържаме сайта функционален, да запомним избрани настройки и да подобряваме потребителското изживяване.
                    </p>
                    <p className={textClass}>
                        Това може да включва запомняне на тема, език, взаимодействие с банера за бисквитки и работа на вградени елементи като карта.
                    </p>
                </div>

                <h2 className={headingClass}>Съгласие</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        При първо посещение на сайта може да видите банер за бисквитки, чрез който да приемете или откажете незадължителните бисквитки.
                    </p>
                    <p className={textClass}>
                        Вашият избор се записва локално в браузъра, за да не се налага да го правите при всяко зареждане.
                    </p>
                    <p className={textClass}>
                        <strong>„Приемам“:</strong> разрешавате използването на незадължителни бисквитки, ако такива са активни в сайта.
                    </p>
                    <p className={textClass}>
                        <strong>„Отказвам“:</strong> запазва се само решението ви, а незадължителните бисквитки остават изключени.
                    </p>
                </div>

                <h2 className={headingClass}>Управление на бисквитките</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Можете по всяко време да изтриете бисквитките през настройките на браузъра си.
                    </p>
                    <p className={textClass}>
                        Повечето браузъри позволяват да блокирате, ограничите или премахнете бисквитки изцяло. Имайте предвид, че това може да повлияе на нормалната работа на някои функции.
                    </p>
                </div>

                <h2 className={headingClass}>Трети страни</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Част от съдържанието в сайта може да бъде предоставяно от външни услуги, например карта или линкове към външни платформи.
                    </p>
                    <p className={textClass}>
                        Тези услуги могат да използват собствени бисквитки и политики, върху които DG Vision Studio няма пряк контрол.
                    </p>
                </div>

                <h2 className={headingClass}>Промени в тази политика</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Политиката може да бъде обновявана при промени по сайта, използваните технологии или приложимите изисквания.
                    </p>
                    <p className={textClass}>
                        Актуалната версия винаги е публикувана на тази страница.
                    </p>
                </div>

                <h2 className={headingClass}>Контакт</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Ако имате въпроси относно използването на бисквитки в сайта, можете да се свържете с DG Vision Studio чрез страницата за контакт.
                    </p>
                </div>
            </div>
        </div>
    ) : (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Cookies Policy</h1>
            <p className={updatedClass}>
                Last updated: <span className="font-semibold text-slate-700 dark:text-zinc-200">29 March 2026</span>
            </p>

            <div className={cardClass}>
                <h2 className={headingClass}>Introduction</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        This Cookies Policy explains how DG Vision Studio uses cookies and similar technologies on this website.
                    </p>
                    <p className={textClass}>
                        The goal is to keep the site working properly, remember your preferences, and give you clear control over optional technologies.
                    </p>
                </div>

                <h2 className={headingClass}>What Cookies Are</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Cookies are small text files stored on your device when you visit a website.
                    </p>
                    <p className={textClass}>
                        They may be required for core site functionality, saving settings, or collecting aggregated information about site usage.
                    </p>
                </div>

                <h2 className={headingClass}>What Types of Cookies We Use</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Essential cookies:</strong> required for core website functionality, navigation, security, and proper content delivery.
                    </li>
                    <li>
                        <strong>Preference cookies:</strong> remember choices such as theme, language, or your decision in the cookie banner.
                    </li>
                    <li>
                        <strong>Analytics cookies:</strong> may be used for aggregated information about visits, behavior, and website performance.
                    </li>
                    <li>
                        <strong>Embedded service cookies:</strong> embedded features such as maps, external links, or other third-party services may use their own technologies.
                    </li>
                </ul>

                <h2 className={headingClass}>How We Use Them</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        We use cookies to keep the website functional, remember selected settings, and improve the browsing experience.
                    </p>
                    <p className={textClass}>
                        This may include saving theme, language, cookie-banner preferences, and supporting embedded features such as maps.
                    </p>
                </div>

                <h2 className={headingClass}>Consent</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        On your first visit, you may see a cookie banner that lets you accept or reject optional cookies.
                    </p>
                    <p className={textClass}>
                        Your choice is stored locally in your browser so you do not need to make the same decision on every visit.
                    </p>
                    <p className={textClass}>
                        <strong>“Accept”:</strong> optional cookies are allowed if such technologies are active on the site.
                    </p>
                    <p className={textClass}>
                        <strong>“Decline”:</strong> only your preference is stored, while optional cookies remain disabled.
                    </p>
                </div>

                <h2 className={headingClass}>Managing Cookies</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        You can delete cookies at any time through your browser settings.
                    </p>
                    <p className={textClass}>
                        Most browsers allow you to block, limit, or remove cookies entirely. Keep in mind that this may affect the proper functioning of some features.
                    </p>
                </div>

                <h2 className={headingClass}>Third Parties</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Some content on the website may be provided through external services, such as maps or links to third-party platforms.
                    </p>
                    <p className={textClass}>
                        These services may use their own cookies and policies, which are outside the direct control of DG Vision Studio.
                    </p>
                </div>

                <h2 className={headingClass}>Changes to This Policy</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        This policy may be updated when the website, technologies used, or applicable requirements change.
                    </p>
                    <p className={textClass}>
                        The latest version is always published on this page.
                    </p>
                </div>

                <h2 className={headingClass}>Contact</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        If you have questions about the use of cookies on this website, you can contact DG Vision Studio through the contact page.
                    </p>
                </div>
            </div>
        </div>
    )
}