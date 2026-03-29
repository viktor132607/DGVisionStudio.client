import { useTranslation } from "react-i18next"

export default function Privacy() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const wrapperClass =
        "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-900"

    const titleClass =
        "text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl"

    const updatedClass =
        "mt-3 text-center text-sm font-medium text-slate-500 dark:text-zinc-400"

    const sectionClass =
        "mt-8 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:p-8"

    const headingClass =
        "mb-4 text-2xl font-bold text-slate-900 dark:text-white"

    const textClass =
        "text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base"

    const boxClass =
        "my-5 rounded-[22px] border border-slate-200 bg-sky-50 p-5 text-[15px] leading-8 text-slate-700 dark:border-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-200"

    const listClass =
        "mt-4 list-disc space-y-3 pl-5 text-[15px] leading-8 text-slate-700 marker:text-sky-500 dark:text-zinc-200 dark:marker:text-white sm:text-base"

    return isBg ? (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Политика за поверителност</h1>
            <p className={updatedClass}>
                Последна актуализация:{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                    29 март 2026 г.
                </span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        Тази политика за поверителност обяснява как DG Vision Studio
                        обработва информация, когато използвате сайта или се свързвате с нас
                        чрез наличните форми, имейл, телефон или външни линкове.
                    </p>
                    <p className={textClass}>
                        Целта ни е ясно да посочим каква информация може да бъде получена,
                        защо се използва и какви права имате във връзка с нея.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Кой обработва информацията</h2>
                <p className={textClass}>
                    За целите на този сайт администратор на информацията е DG Vision Studio.
                </p>

                <div className={boxClass}>
                    <p><strong>Име на сайта:</strong> DG Vision Studio</p>
                    <p><strong>Имейл:</strong> dgvisionstudio@gmail.com</p>
                    <p><strong>Телефон:</strong> +359 988 758 434</p>
                    <p><strong>Допълнителен телефон:</strong> +359 888 959 373</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Каква информация може да събираме</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Контактни данни:</strong> име, имейл, телефон или друга
                        информация, която ни изпращате доброволно.
                    </li>
                    <li>
                        <strong>Съдържание на съобщения:</strong> текст от запитвания,
                        резервации или друга комуникация през сайта.
                    </li>
                    <li>
                        <strong>Техническа информация:</strong> IP адрес, браузър,
                        устройство, език, базови логове за сигурност и информация за
                        използването на сайта.
                    </li>
                    <li>
                        <strong>Данни от бисквитки:</strong> настройки, предпочитания и
                        информация, свързана с бисквитки и сходни технологии.
                    </li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>За какво използваме информацията</h2>
                <ul className={listClass}>
                    <li>За да отговорим на запитвания и съобщения.</li>
                    <li>За да обработим заявки, резервации или искания за информация.</li>
                    <li>За да поддържаме сайта сигурен и технически изправен.</li>
                    <li>За да подобряваме съдържанието и потребителското изживяване.</li>
                    <li>За да спазим приложими законови задължения, когато това е необходимо.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Правни основания</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Съгласие:</strong> когато доброволно ни изпращате
                        информация чрез формуляри или други канали.
                    </li>
                    <li>
                        <strong>Предприемане на стъпки по ваше искане:</strong> когато се
                        свързвате с нас за услуга, оферта или резервация.
                    </li>
                    <li>
                        <strong>Легитимен интерес:</strong> за сигурност, защита на сайта и
                        подобряване на услугите.
                    </li>
                    <li>
                        <strong>Законово задължение:</strong> когато съхранение или
                        предоставяне на информация се изисква от закон.
                    </li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Срок на съхранение</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        Съхраняваме информацията само за периода, който е разумно необходим
                        за целта, за която е получена, или за срока, който се изисква по закон.
                    </p>
                    <p className={textClass}>
                        Когато информацията вече не е необходима, тя се изтрива,
                        анонимизира или се съхранява само ако има валидно правно основание
                        за това.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Споделяне с трети страни</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        Не продаваме лични данни. Информация може да бъде споделяна само
                        когато това е необходимо за работата на сайта, за вградени услуги,
                        техническа поддръжка или когато законът го изисква.
                    </p>
                    <p className={textClass}>
                        При използване на външни услуги като карта, хостинг, аналитични
                        инструменти или контактни решения е възможно тези доставчици да
                        обработват ограничени данни според собствените си политики.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Вашите права</h2>
                <ul className={listClass}>
                    <li>Право на достъп до информацията, която се отнася до вас.</li>
                    <li>Право на коригиране на неточни или непълни данни.</li>
                    <li>Право на изтриване, когато има основание за това.</li>
                    <li>Право на ограничаване на обработването в определени случаи.</li>
                    <li>Право на възражение срещу определени форми на обработване.</li>
                    <li>Право да оттеглите съгласието си, когато обработването е основано на съгласие.</li>
                    <li>Право да подадете жалба до компетентния надзорен орган.</li>
                </ul>

                <p className={`${textClass} mt-4`}>
                    За въпроси или упражняване на права можете да се свържете с нас чрез
                    страницата за контакт или на dgvisionstudio@gmail.com.
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Сигурност</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        Полагаме разумни технически и организационни мерки за защита на
                        информацията от неоторизиран достъп, загуба, неправомерна промяна
                        или разкриване.
                    </p>
                    <p className={textClass}>
                        Въпреки това никоя интернет среда не може да гарантира абсолютна
                        сигурност.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Промени в политиката</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        Тази политика може да бъде променяна при обновяване на сайта,
                        начина на работа или приложимите правни изисквания.
                    </p>
                    <p className={textClass}>
                        Актуалната версия винаги е публикувана на тази страница.
                    </p>
                </div>
            </section>
        </div>
    ) : (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Privacy Policy</h1>
            <p className={updatedClass}>
                Last updated:{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                    29 March 2026
                </span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        This Privacy Policy explains how DG Vision Studio handles
                        information when you use the website and when you contact us through
                        its forms and listed contact channels.
                    </p>
                    <p className={textClass}>
                        The goal is to make clear what information may be received, why it
                        may be used, and what rights you have in relation to it.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Who Handles the Information</h2>
                <p className={textClass}>
                    For the purposes of this website, DG Vision Studio acts as the
                    controller of the information described in this policy.
                </p>

                <div className={boxClass}>
                    <p><strong>Website name:</strong> DG Vision Studio</p>
                    <p><strong>Email:</strong> dgvisionstudio@gmail.com</p>
                    <p><strong>Phone:</strong> +359 988 758 434</p>
                    <p><strong>Additional phone:</strong> +359 888 959 373</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>What Information We May Collect</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Contact details:</strong> name, email, phone number, or
                        other information you provide voluntarily.
                    </li>
                    <li>
                        <strong>Message content:</strong> text from enquiries, bookings, or
                        any other communication sent through the website.
                    </li>
                    <li>
                        <strong>Technical information:</strong> IP address, browser,
                        device, language, basic security logs, and information about website usage.
                    </li>
                    <li>
                        <strong>Cookie-related data:</strong> preferences, settings, and
                        information related to cookies and similar technologies used on the site.
                    </li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>How We Use the Information</h2>
                <ul className={listClass}>
                    <li>To respond to enquiries and messages.</li>
                    <li>To process requests, bookings, or service-related communication.</li>
                    <li>To keep the website secure and technically functional.</li>
                    <li>To improve the structure, content, and user experience of the website.</li>
                    <li>To comply with applicable legal obligations when necessary.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Legal Grounds</h2>
                <ul className={listClass}>
                    <li>
                        <strong>Consent:</strong> when you voluntarily submit information
                        through forms or other contact channels.
                    </li>
                    <li>
                        <strong>Steps taken at your request:</strong> when you contact us
                        regarding a service, quote, or booking.
                    </li>
                    <li>
                        <strong>Legitimate interest:</strong> for security, website
                        protection, and service improvement.
                    </li>
                    <li>
                        <strong>Legal obligation:</strong> when storing or disclosing
                        information is required by law.
                    </li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Data Retention</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        We keep information only for as long as reasonably necessary for the
                        purpose for which it was received, or for the period required by law.
                    </p>
                    <p className={textClass}>
                        When the information is no longer needed, it is deleted,
                        anonymized, or retained only where a valid legal basis continues to apply.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Sharing with Third Parties</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        We do not sell personal data. Information may be shared only where
                        necessary for website operation, embedded services, technical
                        support, or where required by law.
                    </p>
                    <p className={textClass}>
                        Where the website uses external tools such as maps, hosting,
                        analytics, or contact-related services, those providers may process
                        limited information under their own policies.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Your Rights</h2>
                <ul className={listClass}>
                    <li>Right of access to information relating to you.</li>
                    <li>Right to correct inaccurate or incomplete data.</li>
                    <li>Right to erasure where applicable.</li>
                    <li>Right to restriction of processing in certain cases.</li>
                    <li>Right to object to certain types of processing.</li>
                    <li>Right to withdraw consent where processing is based on consent.</li>
                    <li>Right to lodge a complaint with the competent supervisory authority.</li>
                </ul>

                <p className={`${textClass} mt-4`}>
                    For privacy-related questions or to exercise your rights, you can
                    contact us through the contact page or at dgvisionstudio@gmail.com.
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Security</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        We apply reasonable technical and organizational measures to protect
                        information against unauthorized access, loss, unlawful alteration,
                        or disclosure.
                    </p>
                    <p className={textClass}>
                        However, no internet environment can guarantee absolute security.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Changes to This Policy</h2>
                <div className="space-y-4">
                    <p className={textClass}>
                        This policy may be updated when the website, the way it operates, or
                        the applicable legal requirements change.
                    </p>
                    <p className={textClass}>
                        The latest version is always published on this page.
                    </p>
                </div>
            </section>
        </div>
    )
}