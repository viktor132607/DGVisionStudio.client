import { useTranslation } from "react-i18next"

export default function Contact() {
    const { i18n } = useTranslation()
    const lang = i18n.language?.toLowerCase() ?? "bg"
    const isBg = lang.startsWith("bg")

    const pageClass =
        "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 2xl:px-16"

    const cardClass =
        "rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900 sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-8"

    const sectionTitleClass =
        "text-[24px] font-bold text-slate-900 dark:text-white sm:text-[28px] lg:text-[30px]"

    const infoBoxClass =
        "rounded-[18px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black sm:rounded-[20px] sm:p-5 lg:rounded-[22px]"

    const linkBoxClass =
        "rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-black dark:text-white dark:hover:border-white/20 dark:hover:bg-neutral-950 sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-base"

    const emailBoxClass =
        "rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-black dark:text-white dark:hover:border-white/20 dark:hover:bg-neutral-950 sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-[15px]"

    return isBg ? (
        <div className={pageClass}>
            <section className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-900 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                    Фотография и видеография. Свържете се с нас за запитвания и резервации.
                </p>
            </section>

            <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Телефон</h2>

                    <div className="mt-5 grid gap-4">
                        <a className={linkBoxClass} href="tel:+359988758434">
                            +359 988 758 434
                        </a>

                        <a className={linkBoxClass} href="tel:+359888959373">
                            +359 888 959 373
                        </a>
                    </div>
                </div>

                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Имейл</h2>

                    <div className="mt-5 grid gap-4">
                        <a
                            className={`${emailBoxClass} break-all`}
                            href="mailto:contact@dgvisionstudio.com"
                        >
                            contact@dgvisionstudio.com
                        </a>
                    </div>
                </div>

                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Адрес</h2>

                    <div className="mt-5">
                        <div className={infoBoxClass}>
                            <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 sm:text-base sm:leading-8 lg:text-[17px]">
                                Базирани сме в Русе и работим с клиенти от Русе, Варна, Пловдив, Бургас и други градове в България.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-5 sm:mt-6 lg:mt-8">
                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Карта</h2>

                    <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 dark:border-white/10 sm:rounded-[22px] lg:rounded-[24px]">
                        <iframe
                            className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:min-h-[48px] sm:w-auto"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.google.com/maps/search/?api=1&query=Ruse%2C%20Bulgaria"
                        >
                            Отвори в Google Maps
                        </a>
                    </div>
                </div>
            </section>
        </div>
    ) : (
        <div className={pageClass}>
            <section className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-900 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                    Photography and videography. Contact us for inquiries and bookings.
                </p>
            </section>

            <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Phone</h2>

                    <div className="mt-5 grid gap-4">
                        <a className={linkBoxClass} href="tel:+359988758434">
                            +359 988 758 434
                        </a>

                        <a className={linkBoxClass} href="tel:+359888959373">
                            +359 888 959 373
                        </a>
                    </div>
                </div>

                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Email</h2>

                    <div className="mt-5 grid gap-4">
                        <a
                            className={`${emailBoxClass} break-all`}
                            href="mailto:contact@dgvisionstudio.com"
                        >
                            contact@dgvisionstudio.com
                        </a>
                    </div>
                </div>

                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Address</h2>

                    <div className="mt-5">
                        <div className={infoBoxClass}>
                            <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 sm:text-base sm:leading-8 lg:text-[17px]">
                                We are based in Ruse and work with clients from Ruse, Varna, Plovdiv, Burgas and other cities across Bulgaria.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-5 sm:mt-6 lg:mt-8">
                <div className={cardClass}>
                    <h2 className={sectionTitleClass}>Map</h2>

                    <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 dark:border-white/10 sm:rounded-[22px] lg:rounded-[24px]">
                        <iframe
                            className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:min-h-[48px] sm:w-auto"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.google.com/maps/search/?api=1&query=Ruse%2C%20Bulgaria"
                        >
                            Open in Google Maps
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}