import { useTranslation } from "react-i18next"

export default function Contact() {
    const { i18n } = useTranslation()
    const lang = i18n.language?.toLowerCase() ?? "bg"
    const isBg = lang.startsWith("bg")

    const pageClass =
        "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 2xl:px-16"

    const cardClass =
        "rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:bg-neutral-900 sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-8"

    const iconWrapClass =
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 sm:h-12 sm:w-12"

    const sectionTitleClass =
        "text-[24px] font-bold text-slate-900 dark:text-white sm:text-[28px] lg:text-[30px]"

    const blockTextClass =
        "text-[14px] leading-7 text-slate-700 dark:text-slate-200 sm:text-[15px] sm:leading-8 lg:text-[16px]"

    const phoneCardClass =
        "rounded-[18px] border border-sky-100 bg-sky-50 px-4 py-4 text-[15px] font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 hover:text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:border-sky-800 dark:hover:bg-sky-900/40 sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-base"

    return isBg ? (
        <div className={pageClass}>
            <section className="mb-6 rounded-[24px] bg-gradient-to-br from-sky-100 via-white to-cyan-50 px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:from-sky-950/40 dark:via-neutral-900 dark:to-cyan-950/30 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                    Фотография и видеография. Свържете се с нас за запитвания и резервации.
                </p>
            </section>

            <section className="grid gap-5 sm:gap-6 lg:gap-8">
                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="За студиото"
                                className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                            />
                        </span>
                        <h2 className={sectionTitleClass}>За студиото</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className={blockTextClass}>
                                DG Vision Studio предлага услуги в сферата на фотографията и видеографията.
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className={blockTextClass}>
                                Работим с клиенти от Русе, Варна, Пловдив, Бургас и други градове в България.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-8">
                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/phone.png"
                                    alt="Телефони"
                                    className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                                />
                            </span>
                            <h2 className={sectionTitleClass}>Телефони</h2>
                        </div>

                        <div className="grid gap-4">
                            <a className={phoneCardClass} href="tel:+359988758434">
                                +359 988 758 434
                            </a>

                            <a className={phoneCardClass} href="tel:+359888959373">
                                +359 888 959 373
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/location.png"
                                    alt="Адрес"
                                    className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                                />
                            </span>
                            <h2 className={sectionTitleClass}>Адрес</h2>
                        </div>

                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 sm:text-base sm:leading-8 lg:text-[17px]">
                                Русе, България
                            </p>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="Карта"
                                className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                            />
                        </span>
                        <h2 className={sectionTitleClass}>Карта</h2>
                    </div>

                    <div className="overflow-hidden rounded-[20px] border border-sky-100 dark:border-sky-900/40 sm:rounded-[22px] lg:rounded-[24px]">
                        <iframe
                            className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-600 sm:min-h-[48px] sm:w-auto"
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
            <section className="mb-6 rounded-[24px] bg-gradient-to-br from-sky-100 via-white to-cyan-50 px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:from-sky-950/40 dark:via-neutral-900 dark:to-cyan-950/30 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                    Photography and videography. Contact us for inquiries and bookings.
                </p>
            </section>

            <section className="grid gap-5 sm:gap-6 lg:gap-8">
                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="About the Studio"
                                className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                            />
                        </span>
                        <h2 className={sectionTitleClass}>About the Studio</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className={blockTextClass}>
                                DG Vision Studio offers photography and videography services.
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className={blockTextClass}>
                                We work with clients from Ruse, Varna, Plovdiv, Burgas and other cities in Bulgaria.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-8">
                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/phone.png"
                                    alt="Phones"
                                    className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                                />
                            </span>
                            <h2 className={sectionTitleClass}>Phones</h2>
                        </div>

                        <div className="grid gap-4">
                            <a className={phoneCardClass} href="tel:+359988758434">
                                +359 988 758 434
                            </a>

                            <a className={phoneCardClass} href="tel:+359888959373">
                                +359 888 959 373
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/location.png"
                                    alt="Address"
                                    className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                                />
                            </span>
                            <h2 className={sectionTitleClass}>Address</h2>
                        </div>

                        <div className="rounded-[18px] bg-sky-50 p-4 dark:bg-sky-950/30 sm:rounded-[20px] sm:p-5 lg:rounded-[22px]">
                            <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 sm:text-base sm:leading-8 lg:text-[17px]">
                                Ruse, Bulgaria
                            </p>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="Map"
                                className="h-5 w-5 object-contain sm:h-5 sm:w-5"
                            />
                        </span>
                        <h2 className={sectionTitleClass}>Map</h2>
                    </div>

                    <div className="overflow-hidden rounded-[20px] border border-sky-100 dark:border-sky-900/40 sm:rounded-[22px] lg:rounded-[24px]">
                        <iframe
                            className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-600 sm:min-h-[48px] sm:w-auto"
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