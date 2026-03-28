import { useTranslation } from "react-i18next"

export default function Privacy() {
    const { i18n } = useTranslation()
    const lang = i18n.language

    const wrapperClass =
        "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8"

    const titleClass =
        "text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"

    const updatedClass =
        "mt-3 text-center text-sm font-medium text-slate-500"

    const sectionClass =
        "mt-8 rounded-[26px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8"

    const headingClass =
        "mb-4 text-2xl font-bold text-slate-900"

    const textClass =
        "text-[15px] leading-8 text-slate-700 sm:text-base"

    const boxClass =
        "my-5 rounded-[22px] bg-sky-50 p-5 text-[15px] leading-8 text-slate-700"

    const listClass =
        "mt-4 list-disc space-y-3 pl-5 text-[15px] leading-8 text-slate-700 marker:text-sky-500 sm:text-base"

    return lang === "bg" ? (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Политика за поверителност</h1>
            <p className={updatedClass}>
                Последна актуализация: <span className="font-semibold text-slate-700">17.03.2025</span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        Настоящата политика за поверителност описва как „ЕТ Никола Халачев Акаунтинг“
                        („Никола Халачев Акаунтинг“, „ние“) обработва лични данни при използване на
                        уебсайта halachevaccounting.com и свързаните канали.
                    </p>
                    <p className={textClass}>
                        Поддържаме прозрачност и прилагаме мерки, които отговарят на изискванията
                        на Общия регламент за защита на данните (GDPR) и Закона за защита на личните данни.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Администратор на лични данни</h2>
                <p className={textClass}>
                    „ЕТ Никола Халачев Акаунтинг“ е администратор на личните ви данни,
                    когато използвате нашия уебсайт, заявявате услуга или общувате с нас.
                </p>

                <div className={boxClass}>
                    <p><strong>Юридическо лице:</strong> ЕТ Никола Халачев Акаунтинг</p>
                    <p><strong>Електронна поща:</strong> contact@halachevaccounting.com</p>
                    <p><strong>Телефон:</strong> +359 887 764 200</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Видове лични данни, които обработваме</h2>
                <p className={textClass}>
                    Събираме ограничено количество лични данни, които са необходими за
                    изпълнение на услугите ни и за спазване на законовите ни задължения.
                </p>

                <ul className={listClass}>
                    <li><strong>Идентификационни данни:</strong> име, телефон и имейл адрес.</li>
                    <li><strong>Данни за услуги:</strong> информация от запитвания и комуникация.</li>
                    <li><strong>Финансови и счетоводни данни:</strong> данни от фактури и платежни документи.</li>
                    <li><strong>Технически данни:</strong> логове, данни за устройството и бисквитки.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Правни основания за обработване</h2>
                <ul className={listClass}>
                    <li>Изпълнение на договор</li>
                    <li>Законно задължение</li>
                    <li>Законен интерес</li>
                    <li>Съгласие</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Споделяне на лични данни</h2>
                <p className={textClass}>
                    Не продаваме лични данни. Споделяме ги само когато е необходимо
                    за предоставяне на услугите или при законово изискване.
                </p>

                <p className={`${textClass} mt-4`}>
                    Всички доставчици работят съгласно договори и инструкции
                    от „ЕТ Никола Халачев Акаунтинг“.
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Вашите права</h2>
                <ul className={listClass}>
                    <li>Право на достъп</li>
                    <li>Право на корекция</li>
                    <li>Право на изтриване</li>
                    <li>Право на ограничаване</li>
                    <li>Право на преносимост</li>
                    <li>Право на възражение</li>
                    <li>Право на жалба до КЗЛД</li>
                </ul>

                <p className={`${textClass} mt-4`}>
                    Упражняване на права: contact@halachevaccounting.com
                </p>
            </section>
        </div>
    ) : (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Privacy Policy</h1>
            <p className={updatedClass}>
                Last updated: <span className="font-semibold text-slate-700">16.11.2025</span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        This privacy policy explains how ET Nikola Halachev Accounting
                        (“Nikola Halachev Accounting”, “we”) processes personal data when
                        operating the halachevaccounting.com website and communicating through related channels.
                    </p>
                    <p className={textClass}>
                        We comply with the General Data Protection Regulation (GDPR)
                        and applicable Bulgarian data protection legislation.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Data Controller</h2>
                <p className={textClass}>
                    ET Nikola Halachev Accounting acts as the data controller whenever
                    you use our website or communicate with us.
                </p>

                <div className={boxClass}>
                    <p><strong>Registered entity:</strong> ET Nikola Halachev Accounting</p>
                    <p><strong>Email:</strong> contact@halachevaccounting.com</p>
                    <p><strong>Phone:</strong> +359 887 764 200</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Types of Personal Data We Process</h2>

                <ul className={listClass}>
                    <li><strong>Identification data:</strong> name, phone number, and email.</li>
                    <li><strong>Service information:</strong> enquiry details and communication.</li>
                    <li><strong>Financial data:</strong> invoice and accounting records.</li>
                    <li><strong>Technical data:</strong> logs, device data, cookies.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Legal Grounds</h2>
                <ul className={listClass}>
                    <li>Contract performance</li>
                    <li>Legal obligation</li>
                    <li>Legitimate interest</li>
                    <li>Consent</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Sharing Data</h2>
                <p className={textClass}>
                    We do not sell personal data. Data is shared only when necessary
                    for service delivery or required by law.
                </p>

                <p className={`${textClass} mt-4`}>
                    All providers operate under written agreements
                    and follow instructions from ET Nikola Halachev Accounting.
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Your Rights</h2>
                <ul className={listClass}>
                    <li>Right of access</li>
                    <li>Right to rectification</li>
                    <li>Right to erasure</li>
                    <li>Right to restriction</li>
                    <li>Right to data portability</li>
                    <li>Right to object</li>
                    <li>Right to lodge a complaint</li>
                </ul>

                <p className={`${textClass} mt-4`}>
                    To exercise your rights contact: contact@halachevaccounting.com
                </p>
            </section>
        </div>
    )
}