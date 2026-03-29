import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

export default function Terms() {
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
        <>
            <Seo
                title="Общи условия"
                description="Общите условия на DG Vision Studio за използване на сайта, запитвания, резервации, съдържание и права."
                canonical="/terms"
                image="/og-cover.jpg"
                type="website"
            />

            <div className={wrapperClass}>
                <h1 className={titleClass}>Общи условия</h1>
                <p className={updatedClass}>
                    Последна актуализация:{" "}
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        29 март 2026 г.
                    </span>
                </p>

                <section className={sectionClass}>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Настоящите общи условия уреждат използването на сайта DG Vision Studio
                            и комуникацията, свързана със запитвания, фотосесии, резервации и
                            съдържанието, публикувано в сайта.
                        </p>
                        <p className={textClass}>
                            С използването на сайта приемате тези условия. Ако не сте съгласни с
                            тях, не следва да използвате сайта.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Предмет на сайта</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Сайтът има представителен и информационен характер. Чрез него можете
                            да се запознаете с портфолиото, стила на работа, услугите и начините
                            за контакт с DG Vision Studio.
                        </p>
                        <p className={textClass}>
                            Публикуваната информация не представлява автоматично обвързваща
                            оферта, освен ако изрично не е посочено друго.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Запитвания и резервации</h2>
                    <ul className={listClass}>
                        <li>Изпращането на запитване през сайта не означава автоматично приета резервация.</li>
                        <li>Резервация се счита за потвърдена след изрично потвърждение от страна на DG Vision Studio.</li>
                        <li>Детайлите по проект, фотосесия, дата, място, цена и срокове се уточняват допълнително.</li>
                        <li>DG Vision Studio си запазва правото да откаже запитване по своя преценка.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Цени и условия по услуги</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Ако на сайта има публикувани ориентировъчни цени, пакети или описания,
                            те имат информативен характер, освен ако изрично не е посочено друго.
                        </p>
                        <p className={textClass}>
                            Крайните условия по конкретна услуга се уточняват индивидуално според
                            обема на проекта, локацията, продължителността, обработката и другите
                            специфики на заданието.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Права върху съдържанието</h2>
                    <ul className={listClass}>
                        <li>Всички текстове, изображения, видео, графики и други материали в сайта са защитени.</li>
                        <li>Съдържанието не може да бъде копирано, разпространявано, променяно или използвано с търговска цел без предварително разрешение.</li>
                        <li>Портфолиото служи за представяне на работата на DG Vision Studio и не може да се използва извън тази цел без съгласие.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Поведение при използване на сайта</h2>
                    <ul className={listClass}>
                        <li>Да не използвате сайта по начин, който нарушава закона или правата на трети лица.</li>
                        <li>Да не изпращате злонамерено, подвеждащо или спам съдържание.</li>
                        <li>Да не правите опити за неоторизиран достъп, претоварване или нарушаване на работата на сайта.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Външни услуги и линкове</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Сайтът може да съдържа вградени услуги или линкове към външни
                            платформи, като карта, социални мрежи или други сайтове.
                        </p>
                        <p className={textClass}>
                            DG Vision Studio не носи отговорност за съдържанието, наличността или
                            политиките на тези външни услуги.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Ограничаване на отговорността</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Полагаме усилия информацията в сайта да бъде актуална и точна, но не
                            гарантираме, че тя е изчерпателна, напълно безгрешна или винаги
                            актуализирана към всеки момент.
                        </p>
                        <p className={textClass}>
                            DG Vision Studio не носи отговорност за вреди или пропуснати ползи,
                            настъпили във връзка с използването или невъзможността за използване
                            на сайта, освен ако това не следва от императивни правни норми.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Поверителност и бисквитки</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            Обработването на информация и използването на бисквитки се уреждат
                            съответно от Политиката за поверителност и Политиката за бисквитките,
                            публикувани в сайта.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Промени в условията</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            DG Vision Studio си запазва правото да актуализира тези общи условия
                            по всяко време.
                        </p>
                        <p className={textClass}>
                            Актуалната версия винаги е публикувана на тази страница и влиза в сила
                            от момента на публикуването ѝ.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Контакт</h2>
                    <div className={boxClass}>
                        <p><strong>DG Vision Studio</strong></p>
                        <p><strong>Имейл:</strong> dgvisionstudio@gmail.com</p>
                        <p><strong>Телефон:</strong> +359 988 758 434</p>
                        <p><strong>Допълнителен телефон:</strong> +359 888 959 373</p>
                    </div>
                </section>
            </div>
        </>
    ) : (
        <>
            <Seo
                title="Terms and Conditions"
                description="The DG Vision Studio terms and conditions for website use, enquiries, bookings, content, and rights."
                canonical="/terms"
                image="/og-cover.jpg"
                type="website"
            />

            <div className={wrapperClass}>
                <h1 className={titleClass}>Terms and Conditions</h1>
                <p className={updatedClass}>
                    Last updated:{" "}
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        29 March 2026
                    </span>
                </p>

                <section className={sectionClass}>
                    <div className="space-y-4">
                        <p className={textClass}>
                            These Terms and Conditions govern the use of the DG Vision Studio
                            website and the communication related to enquiries, photoshoots,
                            bookings, and the content published on the site.
                        </p>
                        <p className={textClass}>
                            By using this website, you agree to these terms. If you do not agree,
                            you should not use the website.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Purpose of the Website</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            The website is informational and presentation-based. It is intended to
                            present the portfolio, working style, services, and contact options of
                            DG Vision Studio.
                        </p>
                        <p className={textClass}>
                            The information published on the website does not automatically
                            constitute a binding offer unless explicitly stated otherwise.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Enquiries and Bookings</h2>
                    <ul className={listClass}>
                        <li>Sending an enquiry through the website does not automatically create a confirmed booking.</li>
                        <li>A booking is considered confirmed only after explicit confirmation from DG Vision Studio.</li>
                        <li>Project details such as date, location, scope, price, and deadlines are agreed separately.</li>
                        <li>DG Vision Studio reserves the right to decline an enquiry at its discretion.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Prices and Service Terms</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            If the website contains indicative prices, packages, or descriptions,
                            they are for informational purposes only unless explicitly stated otherwise.
                        </p>
                        <p className={textClass}>
                            Final terms for a specific service are agreed individually depending on
                            project scope, location, duration, editing, and other details.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Intellectual Property</h2>
                    <ul className={listClass}>
                        <li>All texts, images, video, graphics, and other materials on the website are protected.</li>
                        <li>Website content may not be copied, distributed, modified, or used commercially without prior permission.</li>
                        <li>The portfolio is presented solely to showcase the work of DG Vision Studio and may not be reused without consent.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Acceptable Use</h2>
                    <ul className={listClass}>
                        <li>You must not use the website in a way that violates the law or the rights of third parties.</li>
                        <li>You must not send malicious, misleading, or spam content through the website.</li>
                        <li>You must not attempt unauthorized access, overload, or disruption of the website.</li>
                    </ul>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>External Services and Links</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            The website may contain embedded services or links to external
                            platforms such as maps, social media, or third-party websites.
                        </p>
                        <p className={textClass}>
                            DG Vision Studio is not responsible for the content, availability, or
                            policies of those external services.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Limitation of Liability</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            We make reasonable efforts to keep the website information accurate and
                            up to date, but we do not guarantee that it is complete, error-free, or
                            current at all times.
                        </p>
                        <p className={textClass}>
                            DG Vision Studio is not liable for damages or loss arising from the use
                            of, or inability to use, the website, except where liability cannot be
                            excluded under applicable law.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Privacy and Cookies</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            The handling of information and the use of cookies are governed by the
                            Privacy Policy and the Cookies Policy published on this website.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Changes to the Terms</h2>
                    <div className="space-y-4">
                        <p className={textClass}>
                            DG Vision Studio reserves the right to update these Terms and
                            Conditions at any time.
                        </p>
                        <p className={textClass}>
                            The latest version is always published on this page and takes effect
                            from the moment of publication.
                        </p>
                    </div>
                </section>

                <section className={sectionClass}>
                    <h2 className={headingClass}>Contact</h2>
                    <div className={boxClass}>
                        <p><strong>DG Vision Studio</strong></p>
                        <p><strong>Email:</strong> dgvisionstudio@gmail.com</p>
                        <p><strong>Phone:</strong> +359 988 758 434</p>
                        <p><strong>Additional phone:</strong> +359 888 959 373</p>
                    </div>
                </section>
            </div>
        </>
    )
}