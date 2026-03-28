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
                Последна актуализация: <span className="font-semibold text-slate-700">17.03.2026</span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        Настоящата политика за поверителност описва как „ЕТ Никола Халачев Акаунтинг“
                        („Никола Халачев Акаунтинг“, „ние“) обработва лични данни при използване
                        на уебсайта halachevaccounting.com и свързаните канали.
                    </p>
                    <p className={textClass}>
                        Поддържаме прозрачност и прилагаме мерки съгласно Общия регламент
                        за защита на данните (GDPR) и Закона за защита на личните данни.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Администратор на лични данни</h2>
                <p className={textClass}>
                    „ЕТ Никола Халачев Акаунтинг“ е администратор на личните ви данни,
                    когато използвате нашия уебсайт или се свързвате с нас.
                </p>

                <div className={boxClass}>
                    <p><strong>Юридическо лице:</strong> ЕТ Никола Халачев Акаунтинг</p>
                    <p><strong>Град:</strong> Варна, България</p>
                    <p><strong>Електронна поща:</strong> contact@halachevaccounting.com</p>
                    <p><strong>Телефон:</strong> +359 887 764 200</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Видове лични данни</h2>

                <ul className={listClass}>
                    <li><strong>Идентификационни данни:</strong> име, телефон, имейл.</li>
                    <li><strong>Данни от комуникация:</strong> запитвания и кореспонденция.</li>
                    <li><strong>Счетоводни данни:</strong> фактури и платежни документи.</li>
                    <li><strong>Технически данни:</strong> логове, устройство и бисквитки.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Правни основания</h2>

                <ul className={listClass}>
                    <li>Изпълнение на договор</li>
                    <li>Законно задължение</li>
                    <li>Законен интерес</li>
                    <li>Съгласие</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Споделяне на данни</h2>

                <p className={textClass}>
                    Личните данни не се продават. Те могат да бъдат споделяни
                    само когато това е необходимо за предоставяне на услугите
                    или когато законът го изисква.
                </p>

                <p className={`${textClass} mt-4`}>
                    Всички доставчици обработват данни съгласно договор
                    и инструкции от „ЕТ Никола Халачев Акаунтинг“.
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
                    За упражняване на права: contact@halachevaccounting.com
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Промени</h2>
                <p className={textClass}>
                    Политиката може да бъде актуализирана при промени в закона
                    или практиките на дружеството.
                </p>
            </section>
        </div>
    ) : (
        <div className={wrapperClass}>
            <h1 className={titleClass}>Privacy Policy</h1>
            <p className={updatedClass}>
                Last updated: <span className="font-semibold text-slate-700">17.03.2026</span>
            </p>

            <section className={sectionClass}>
                <div className="space-y-4">
                    <p className={textClass}>
                        This privacy policy explains how ET Nikola Halachev Accounting
                        (“Nikola Halachev Accounting”, “we”) processes personal data
                        when operating the halachevaccounting.com website.
                    </p>
                    <p className={textClass}>
                        We follow the General Data Protection Regulation (GDPR)
                        and applicable Bulgarian data protection legislation.
                    </p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Data Controller</h2>

                <div className={boxClass}>
                    <p><strong>Registered entity:</strong> ET Nikola Halachev Accounting</p>
                    <p><strong>Location:</strong> Varna, Bulgaria</p>
                    <p><strong>Email:</strong> contact@halachevaccounting.com</p>
                    <p><strong>Phone:</strong> +359 887 764 200</p>
                </div>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Types of Data</h2>

                <ul className={listClass}>
                    <li><strong>Identification:</strong> name, phone, email.</li>
                    <li><strong>Communication data:</strong> enquiries and messages.</li>
                    <li><strong>Accounting data:</strong> invoices and payments.</li>
                    <li><strong>Technical data:</strong> logs, device info, cookies.</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Legal Basis</h2>

                <ul className={listClass}>
                    <li>Contract performance</li>
                    <li>Legal obligation</li>
                    <li>Legitimate interest</li>
                    <li>Consent</li>
                </ul>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Data Sharing</h2>

                <p className={textClass}>
                    Personal data is never sold and is shared only when
                    necessary to deliver services or comply with legal obligations.
                </p>

                <p className={`${textClass} mt-4`}>
                    All providers process data according to written agreements
                    with ET Nikola Halachev Accounting.
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
                    Contact: contact@halachevaccounting.com
                </p>
            </section>

            <section className={sectionClass}>
                <h2 className={headingClass}>Updates</h2>
                <p className={textClass}>
                    This policy may be updated when legal or operational
                    changes occur.
                </p>
            </section>
        </div>
    )
}