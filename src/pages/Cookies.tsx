import { useTranslation } from "react-i18next"

export default function Cookies() {
    const { i18n } = useTranslation()
    const lang = i18n.language

    const wrapperClass =
        "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8"

    const titleClass =
        "text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"

    const updatedClass =
        "mt-3 text-center text-sm font-medium text-slate-500"

    const cardClass =
        "mt-8 rounded-[26px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8"

    const headingClass =
        "mt-8 mb-4 text-2xl font-bold text-slate-900 first:mt-0"

    const textClass =
        "text-[15px] leading-8 text-slate-700 sm:text-base"

    const groupClass = "space-y-4"

    const listClass =
        "mt-4 list-disc space-y-3 pl-5 text-[15px] leading-8 text-slate-700 marker:text-sky-500 sm:text-base"

    return lang === "bg" ? (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Политика за бисквитките</h1>
            <p className={updatedClass}>
                Последна актуализация: <span className="font-semibold text-slate-700">14 октомври 2025 г.</span>
            </p>

            <div className={cardClass}>
                <h2 className={headingClass}>Въведение</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Настоящата политика за бисквитките описва как ЕТ Никола Халачев („Никола Халачев Акаунтинг“, „ние“) използва бисквитки и подобни технологии в nhalachev.com и свързаните дигитални услуги.
                    </p>
                    <p className={textClass}>
                        Стремим се да осигурим безпроблемно изживяване и да ви дадем прозрачност и контрол върху данните, които се съхраняват на вашите устройства.
                    </p>
                </div>

                <h2 className={headingClass}>Какво представляват бисквитките</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Бисквитките са малки текстови файлове, които се записват на вашето устройство при посещение на уебсайта.
                    </p>
                    <p className={textClass}>
                        Те ни помагат да предоставяме основни функции, да запомняме предпочитания и да разбираме как се използва сайтът.
                    </p>
                </div>

                <h2 className={headingClass}>Видове бисквитки, които използваме</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Задължителни бисквитки:</strong> осигуряват сигурност, управление на свързаността и функции като избор на език и формуляри. Ако ги изключите, сайтът може да не работи коректно.
                    </li>
                    <li>
                        <strong>Бисквитки за предпочитания:</strong> запомнят вашите избори като град, език или решение за бисквитките, за да отговаря сайтът на настройките ви.
                    </li>
                    <li>
                        <strong>Аналитични бисквитки:</strong> събират обобщена информация за трафика и използването, за да подобряваме производителността и потребителските пътеки.
                    </li>
                    <li>
                        <strong>Маркетингови бисквитки:</strong> помагат да предоставяме релевантни комуникации и да измерваме ефективността на кампаниите, когато дадете съгласие.
                    </li>
                </ul>

                <h2 className={headingClass}>Съгласие</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Когато взаимодействате с банера за бисквитки, можете да приемете или да откажете незадължителните бисквитки.
                    </p>
                    <p className={textClass}>
                        Вашият избор се записва в браузъра, за да гарантираме, че го спазваме при следващи посещения.
                    </p>
                    <p className={textClass}>
                        <strong>„Приемам“:</strong> активираме незадължителните бисквитки и запомняме решението ви.
                    </p>
                    <p className={textClass}>
                        <strong>„Отказвам“:</strong> съхраняваме записа на избора ви, за да не показваме банера, но незадължителните бисквитки остават изключени.
                    </p>
                </div>

                <h2 className={headingClass}>Управление и изключване</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Можете да промените или оттеглите съгласието си по всяко време, като изчистите данните на браузъра или чрез банера за бисквитките, ако се покаже отново.
                    </p>
                    <p className={textClass}>
                        Повечето браузъри позволяват блокиране, изтриване или конфигуриране на бисквитки чрез настройките за поверителност. Повече информация ще откриете в помощните ресурси на избрания браузър.
                    </p>
                </div>

                <h2 className={headingClass}>Бисквитки на трети страни</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Използваме внимателно подбрани инструменти на трети страни, за да анализираме използването на сайта и да поддържаме услугите си.
                    </p>
                    <p className={textClass}>
                        Когато тези партньори поставят бисквитки, те го правят съгласно нашите договорни отношения и приложимото законодателство.
                    </p>
                </div>

                <h2 className={headingClass}>Промени в политиката</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Преразглеждаме тази политика при въвеждане на нови технологии или при промени в законодателството и указанията.
                    </p>
                    <p className={textClass}>
                        Актуализираната версия влиза в сила при публикуване на тази страница. Ще ви уведомим за съществени промени чрез подходящи канали.
                    </p>
                </div>
            </div>
        </div>
    ) : (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Cookies Policy</h1>
            <p className={updatedClass}>
                Last updated: <span className="font-semibold text-slate-700">14 October 2025</span>
            </p>

            <div className={cardClass}>
                <h2 className={headingClass}>Introduction</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        This cookie policy explains how Nikola Halachev ST (“Nikola Halachev Accounting”, “we”) uses cookies and similar technologies on nhalachev.com and related digital services.
                    </p>
                    <p className={textClass}>
                        We aim to keep your experience seamless while giving you transparency and control over the data stored on your devices.
                    </p>
                </div>

                <h2 className={headingClass}>What Cookies Are</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        Cookies are small text files placed on your device when you visit our website.
                    </p>
                    <p className={textClass}>
                        They help us deliver core functionality, remember your preferences, and understand how the site is used.
                    </p>
                </div>

                <h2 className={headingClass}>Types of Cookies We Use</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Essential cookies:</strong> enable security, network management, and features such as language selection and forms. Disabling them may break the site.
                    </li>
                    <li>
                        <strong>Preference cookies:</strong> remember your choices like saved city, language, or cookie decisions so the site matches your settings.
                    </li>
                    <li>
                        <strong>Analytics cookies:</strong> collect aggregated insights about traffic and usage so we can improve performance and user journeys.
                    </li>
                    <li>
                        <strong>Marketing cookies:</strong> help deliver relevant communications and measure campaign effectiveness when you opt in.
                    </li>
                </ul>

                <h2 className={headingClass}>Consent</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        When you interact with our cookie banner you can accept or decline optional cookies.
                    </p>
                    <p className={textClass}>
                        Your choice is stored in your browser to ensure that we respect it on future visits.
                    </p>
                    <p className={textClass}>
                        <strong>Accept:</strong> we enable optional cookies and remember your decision.
                    </p>
                    <p className={textClass}>
                        <strong>Decline:</strong> we store a record of your choice so the banner stays hidden, but optional cookies remain disabled.
                    </p>
                </div>

                <h2 className={headingClass}>Managing & Disabling Cookies</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        You can update or withdraw consent at any time by clearing your browser data or adjusting settings through the cookie banner if it reappears.
                    </p>
                    <p className={textClass}>
                        Most browsers let you block, delete, or configure cookies via their privacy controls. Review your browser’s help resources for detailed instructions.
                    </p>
                </div>

                <h2 className={headingClass}>Third-Party Technologies</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        We rely on carefully selected third-party tools to understand site performance and deliver our services.
                    </p>
                    <p className={textClass}>
                        When these partners set cookies, they do so under agreements that require compliance with applicable privacy legislation.
                    </p>
                </div>

                <h2 className={headingClass}>Changes to This Policy</h2>
                <div className={groupClass}>
                    <p className={textClass}>
                        We review this policy whenever we introduce new technologies or when laws and guidance change.
                    </p>
                    <p className={textClass}>
                        The updated version takes effect upon publication on this page. We will communicate material updates through appropriate channels.
                    </p>
                </div>
            </div>
        </div>
    )
}