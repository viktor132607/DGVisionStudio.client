import { useTranslation } from "react-i18next"

export default function Contact() {
    const { i18n } = useTranslation()
    const lang = i18n.language?.toLowerCase() ?? "bg"
    const isBg = lang.startsWith("bg")

    const cardClass =
        "rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"

    const iconWrapClass =
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 shrink-0"

    return isBg ? (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <section className="mb-10 rounded-[32px] bg-gradient-to-br from-sky-100 via-white to-cyan-50 px-6 py-10 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:px-10">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                    Фотография и видеография. Свържете се с нас за запитвания и резервации.
                </p>
            </section>

            <section className="grid gap-6">
                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="За студиото"
                                className="h-5 w-5 object-contain"
                            />
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                            За студиото
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-sm leading-7 text-slate-700">
                                DG Vision Studio предлага услуги в сферата на фотографията и видеографията.
                            </p>
                        </div>

                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-sm leading-7 text-slate-700">
                                Работим с клиенти от Русе, Варна, Пловдив, Бургас и други градове в България.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/phone.png"
                                    alt="Телефони"
                                    className="h-5 w-5 object-contain"
                                />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Телефони
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            <a
                                className="rounded-[20px] border border-sky-100 bg-sky-50 px-5 py-4 text-base font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 hover:text-sky-900"
                                href="tel:+359988758434"
                            >
                                +359 988 758 434
                            </a>

                            <a
                                className="rounded-[20px] border border-sky-100 bg-sky-50 px-5 py-4 text-base font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 hover:text-sky-900"
                                href="tel:+359888959373"
                            >
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
                                    className="h-5 w-5 object-contain"
                                />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Адрес
                            </h2>
                        </div>

                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-base leading-8 text-slate-700">
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
                                className="h-5 w-5 object-contain"
                            />
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Карта
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-sky-100">
                        <iframe
                            className="h-[420px] w-full border-0 sm:h-[500px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
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
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <section className="mb-10 rounded-[32px] bg-gradient-to-br from-sky-100 via-white to-cyan-50 px-6 py-10 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:px-10">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    DG Vision Studio
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                    Photography and videography. Contact us for inquiries and bookings.
                </p>
            </section>

            <section className="grid gap-6">
                <div className={cardClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <span className={iconWrapClass}>
                            <img
                                src="/images/location.png"
                                alt="About the Studio"
                                className="h-5 w-5 object-contain"
                            />
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                            About the Studio
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-sm leading-7 text-slate-700">
                                DG Vision Studio offers photography and videography services.
                            </p>
                        </div>

                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-sm leading-7 text-slate-700">
                                We work with clients from Ruse, Varna, Plovdiv, Burgas and other cities in Bulgaria.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className={cardClass}>
                        <div className="mb-5 flex items-center gap-4">
                            <span className={iconWrapClass}>
                                <img
                                    src="/images/phone.png"
                                    alt="Phones"
                                    className="h-5 w-5 object-contain"
                                />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Phones
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            <a
                                className="rounded-[20px] border border-sky-100 bg-sky-50 px-5 py-4 text-base font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 hover:text-sky-900"
                                href="tel:+359988758434"
                            >
                                +359 988 758 434
                            </a>

                            <a
                                className="rounded-[20px] border border-sky-100 bg-sky-50 px-5 py-4 text-base font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 hover:text-sky-900"
                                href="tel:+359888959373"
                            >
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
                                    className="h-5 w-5 object-contain"
                                />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Address
                            </h2>
                        </div>

                        <div className="rounded-[22px] bg-sky-50 p-5">
                            <p className="text-base leading-8 text-slate-700">
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
                                className="h-5 w-5 object-contain"
                            />
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Map
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-sky-100">
                        <iframe
                            className="h-[420px] w-full border-0 sm:h-[500px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?hl=bg&q=Ruse,%20Bulgaria&z=12&output=embed"
                        />
                    </div>

                    <div className="mt-5">
                        <a
                            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
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