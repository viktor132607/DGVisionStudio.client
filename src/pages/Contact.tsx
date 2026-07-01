import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"
import { apiFetch } from "../services/api"
import {
    COOKIE_CONSENT_EVENT,
    hasAcceptedOptionalCookies,
} from "../utils/cookieConsent"

type ContactFormState = {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

const initialFormState: ContactFormState = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
}

const MAP_URL = "https://maps.app.goo.gl/Yynb5RztQio7mL28A?g_st=ic"
const EMBED_URL = "https://www.google.com/maps?hl=bg&q=Ruse%207000%2C%20Bulgaria&z=15&output=embed"

export default function Contact() {
    const { i18n } = useTranslation()
    const lang = i18n.language?.toLowerCase() ?? "bg"
    const isBg = lang.startsWith("bg")

    const [canLoadMap, setCanLoadMap] = useState(false)
    const [form, setForm] = useState<ContactFormState>(initialFormState)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState("")

    const contactJsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: isBg ? "Контакти" : "Contact",
        url: "https://dgvisionstudio.com/contact",
        mainEntity: {
            "@type": "LocalBusiness",
            name: "DG Vision Studio",
            url: "https://dgvisionstudio.com",
            image: "https://dgvisionstudio.com/og-cover.jpg",
            email: "dgvisionstudio@gmail.com",
            telephone: "+359988758434",
            hasMap: MAP_URL,
            address: {
                "@type": "PostalAddress",
                streetAddress: "Ruse 7000",
                postalCode: "7000",
                addressLocality: "Ruse",
                addressCountry: "BG",
            },
        },
    }

    useEffect(() => {
        const updateConsent = () => {
            setCanLoadMap(hasAcceptedOptionalCookies())
        }

        updateConsent()

        window.addEventListener(COOKIE_CONSENT_EVENT, updateConsent as EventListener)
        window.addEventListener("storage", updateConsent)

        return () => {
            window.removeEventListener(COOKIE_CONSENT_EVENT, updateConsent as EventListener)
            window.removeEventListener("storage", updateConsent)
        }
    }, [])

    const handleChange =
        (field: keyof ContactFormState) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((current) => ({
                ...current,
                [field]: event.target.value,
            }))
        }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setSubmitError("")
        setSubmitSuccess("")

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setSubmitError(
                isBg
                    ? "Името, имейлът и съобщението са задължителни."
                    : "Name, email and message are required."
            )
            return
        }

        setSubmitting(true)

        try {
            const response = await apiFetch("/contact", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim() || null,
                    subject: form.subject.trim() || null,
                    message: form.message.trim(),
                }),
            })

            if (!response.ok) {
                let message = isBg
                    ? "Неуспешно изпращане на запитването."
                    : "Failed to submit your inquiry."

                try {
                    const data = await response.json()
                    message = data?.message || message
                } catch {
                    const text = await response.text()
                    if (text) {
                        message = text
                    }
                }

                throw new Error(message)
            }

            setSubmitSuccess(
                isBg
                    ? "Запитването беше изпратено успешно."
                    : "Your inquiry was submitted successfully."
            )
            setForm(initialFormState)
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : isBg
                      ? "Неуспешно изпращане на запитването."
                      : "Failed to submit your inquiry."
            )
        } finally {
            setSubmitting(false)
        }
    }

    const pageClass =
        "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 2xl:px-16 dark:bg-zinc-900"

    const cardClass =
        "rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-800 sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-8"

    const sectionTitleClass =
        "text-[24px] font-bold text-slate-900 dark:text-white sm:text-[28px] lg:text-[30px]"

    const contactLinkClass =
        "block text-[15px] leading-8 font-semibold text-slate-700 transition hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white sm:text-base"

    const emailLinkClass =
        "block break-all text-[15px] leading-8 font-semibold text-slate-700 transition hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white sm:text-base"

    const textClass =
        "text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base lg:text-[17px]"

    const inputClassName =
        "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"

    const textareaClassName = `${inputClassName} min-h-[180px] resize-y`

    const submitButtonClassName =
        "inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200"

    return isBg ? (
        <>
            <Seo
                title="Контакти"
                description="Свържете се с DG Vision Studio за фотография, видеография, запитвания и резервации."
                canonical="/contact"
                image="/og-cover.jpg"
                type="website"
                jsonLd={contactJsonLd}
            />

            <div className={pageClass}>
                <section className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                    <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                        DG Vision Studio
                    </h1>
                    <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-zinc-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                        Фотография и видеография. Свържете се с нас за запитвания и резервации.
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Телефон</h2>

                        <div className="mt-5 space-y-3">
                            <a className={contactLinkClass} href="tel:+359988758434">
                                +359 988 758 434
                            </a>

                            <a className={contactLinkClass} href="tel:+359888959373">
                                +359 888 959 373
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Имейл</h2>

                        <div className="mt-5">
                            <a className={emailLinkClass} href="mailto:dgvisionstudio@gmail.com">
                                dgvisionstudio@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Адрес</h2>

                        <div className="mt-5">
                            <p className={textClass}>Русе 7000</p>
                            <p className={`${textClass} mt-2`}>
                                Студиото е капарирано и е в процес на подготовка. Предстои внасяне на техника, оборудване и интериор. Официалната дата на отваряне ще бъде обявена скоро.
                            </p>
                            <a
                                className={`${contactLinkClass} mt-3`}
                                href={MAP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Виж локацията в Google Maps
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mt-5 sm:mt-6 lg:mt-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Форма за контакт</h2>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Име *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange("name")}
                                        className={inputClassName}
                                        placeholder="Вашето име"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Имейл *
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange("email")}
                                        className={inputClassName}
                                        placeholder="Вашият имейл"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={handleChange("phone")}
                                        className={inputClassName}
                                        placeholder="Вашият телефон"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Тема
                                    </label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={handleChange("subject")}
                                        className={inputClassName}
                                        placeholder="Тема на запитването"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                    Съобщение *
                                </label>
                                <textarea
                                    value={form.message}
                                    onChange={handleChange("message")}
                                    className={textareaClassName}
                                    placeholder="Опишете какво ви е нужно"
                                />
                            </div>

                            {submitError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                    {submitError}
                                </div>
                            ) : null}

                            {submitSuccess ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {submitSuccess}
                                </div>
                            ) : null}

                            <div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={submitButtonClassName}
                                >
                                    {submitting ? "Изпращане..." : "Изпрати"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="mt-5 sm:mt-6 lg:mt-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Карта</h2>

                        <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 dark:border-zinc-700 sm:rounded-[22px] lg:rounded-[24px]">
                            {canLoadMap ? (
                                <iframe
                                    className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={EMBED_URL}
                                    title="DG Vision Studio Map"
                                />
                            ) : (
                                <div className="flex h-[300px] w-full flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-zinc-900 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]">
                                    <p className="max-w-2xl text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base lg:text-[17px]">
                                        Google Maps картата е изключена, докато не приемете незадължителното външно съдържание от банера за бисквитки.
                                    </p>
                                    <a
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={MAP_URL}
                                    >
                                        Отвори в Google Maps
                                    </a>
                                </div>
                            )}
                        </div>

                        {canLoadMap && (
                            <div className="mt-5">
                                <a
                                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:min-h-[48px] sm:w-auto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={MAP_URL}
                                >
                                    Отвори в Google Maps
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    ) : (
        <>
            <Seo
                title="Contact"
                description="Contact DG Vision Studio for photography, videography, inquiries and bookings."
                canonical="/contact"
                image="/og-cover.jpg"
                type="website"
                jsonLd={contactJsonLd}
            />

            <div className={pageClass}>
                <section className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                    <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">
                        DG Vision Studio
                    </h1>
                    <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-zinc-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">
                        Photography and videography. Contact us for inquiries and bookings.
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Phone</h2>

                        <div className="mt-5 space-y-3">
                            <a className={contactLinkClass} href="tel:+359988758434">
                                +359 988 758 434
                            </a>

                            <a className={contactLinkClass} href="tel:+359888959373">
                                +359 888 959 373
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Email</h2>

                        <div className="mt-5">
                            <a className={emailLinkClass} href="mailto:dgvisionstudio@gmail.com">
                                dgvisionstudio@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Address</h2>

                        <div className="mt-5">
                            <p className={textClass}>Ruse 7000</p>
                            <p className={`${textClass} mt-2`}>
                                The studio space has been reserved and is currently being prepared. Equipment, gear and interior setup are still pending. The official opening date will be announced soon.
                            </p>
                            <a
                                className={`${contactLinkClass} mt-3`}
                                href={MAP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View location in Google Maps
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mt-5 sm:mt-6 lg:mt-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Contact form</h2>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange("name")}
                                        className={inputClassName}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange("email")}
                                        className={inputClassName}
                                        placeholder="Your email"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={handleChange("phone")}
                                        className={inputClassName}
                                        placeholder="Your phone"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={handleChange("subject")}
                                        className={inputClassName}
                                        placeholder="Inquiry subject"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                                    Message *
                                </label>
                                <textarea
                                    value={form.message}
                                    onChange={handleChange("message")}
                                    className={textareaClassName}
                                    placeholder="Tell us what you need"
                                />
                            </div>

                            {submitError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                    {submitError}
                                </div>
                            ) : null}

                            {submitSuccess ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {submitSuccess}
                                </div>
                            ) : null}

                            <div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={submitButtonClassName}
                                >
                                    {submitting ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="mt-5 sm:mt-6 lg:mt-8">
                    <div className={cardClass}>
                        <h2 className={sectionTitleClass}>Map</h2>

                        <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 dark:border-zinc-700 sm:rounded-[22px] lg:rounded-[24px]">
                            {canLoadMap ? (
                                <iframe
                                    className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={EMBED_URL}
                                    title="DG Vision Studio Map"
                                />
                            ) : (
                                <div className="flex h-[300px] w-full flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-zinc-900 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]">
                                    <p className="max-w-2xl text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base lg:text-[17px]">
                                        The Google Maps embed stays disabled until you accept optional external content in the cookie banner.
                                    </p>
                                    <a
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={MAP_URL}
                                    >
                                        Open in Google Maps
                                    </a>
                                </div>
                            )}
                        </div>

                        {canLoadMap && (
                            <div className="mt-5">
                                <a
                                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:min-h-[48px] sm:w-auto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={MAP_URL}
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    )
}
