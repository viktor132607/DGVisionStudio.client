import { useState } from "react"
import { useTranslation } from "react-i18next"
import { apiFetch } from "../services/api"

export default function Contact() {
    const { i18n } = useTranslation()
    const lang = i18n.language?.toLowerCase() ?? "bg"
    const isBg = lang.startsWith("bg")

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState("")

    const cardClass =
        "rounded-[24px] bg-sky-100 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"

    const labelClass =
        "mb-2 block text-sm font-semibold text-slate-800"

    const inputClass =
        "w-full rounded-[16px] border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"

    const chipClass =
        "inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"

    const infoCardClass =
        "rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage("")

        try {
            const response = await apiFetch("/contact-requests", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    subject,
                    message
                })
            })

            if (!response.ok) {
                throw new Error("Request failed")
            }

            setName("")
            setEmail("")
            setPhone("")
            setSubject("")
            setMessage("")
            setSubmitMessage(
                isBg
                    ? "Съобщението беше изпратено успешно."
                    : "Your message was sent successfully."
            )
        } catch {
            setSubmitMessage(
                isBg
                    ? "Възникна грешка при изпращането."
                    : "An error occurred while sending your message."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return isBg ? (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
            <section className="text-center">
                <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Свържете се с мен
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
                    Изберете удобен канал или ми пишете директно.
                </p>
            </section>

            <section>
                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="flex flex-col gap-8">
                        <div className={cardClass}>
                            <h2 className="mb-6 text-2xl font-bold text-slate-900">
                                Изпратете ми съобщение
                            </h2>

                            <form className="flex flex-col gap-5" onSubmit={submitForm}>
                                <div>
                                    <label className={labelClass}>Име</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="name"
                                        placeholder="Вашето име"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Имейл</label>
                                    <input
                                        className={inputClass}
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Телефон</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="phone"
                                        placeholder="Вашият телефон"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Тема</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="subject"
                                        placeholder="Тема"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Съобщение</label>
                                    <textarea
                                        className={`${inputClass} min-h-[160px] resize-y`}
                                        name="message"
                                        rows={6}
                                        placeholder="Вашето съобщение..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                {submitMessage && (
                                    <div className="text-sm font-medium text-slate-700">
                                        {submitMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex w-fit items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? "Изпращане..." : "Изпрати съобщение"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-[24px] bg-gradient-to-br from-sky-400 via-sky-300 to-cyan-200 p-6 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.1)]">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70">
                                    <img
                                        src="/images/email1.png"
                                        alt=""
                                        className="h-6 w-6 object-contain"
                                        onError={(e) => {
                                            ; (e.currentTarget as HTMLImageElement).style.display = "none"
                                        }}
                                    />
                                </span>
                                <span className="text-xl font-bold">Свържете се с мен</span>
                            </div>

                            <div className="mb-6 max-w-2xl text-sm leading-7 text-slate-800">
                                Ще се радвам да Ви чуя! Независимо дали имате въпрос за услугите ми или просто искате да кажете здравей.
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.facebook.com/profile.php?id=61565641385893"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/facebook.png" alt="" />
                                    </span>
                                    Facebook
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://m.me/halachev_accounting"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/messenger.webp" alt="" />
                                    </span>
                                    Messenger
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.instagram.com/halachev_accounting/"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/instagram.png" alt="" />
                                    </span>
                                    Instagram
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.tiktok.com/@halachev_accounting"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/tiktok.png" alt="" />
                                    </span>
                                    TikTok
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://wa.me/359887764200"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/whatsapp.jpg" alt="" />
                                    </span>
                                    WhatsApp
                                </a>

                                <a className={chipClass} href="viber://chat?number=%2B359887764200">
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/viber1.png" alt="" />
                                    </span>
                                    Viber
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://revolut.me/halachev"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/revolut.png" alt="" />
                                    </span>
                                    Revolut
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className={infoCardClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/email.png"
                                        alt="Имейл"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Имейл</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <a
                                    className="break-all text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                    href="mailto:nthalachev@gmail.com"
                                >
                                    nthalachev@gmail.com
                                </a>
                                <a
                                    className="break-all text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                    href="mailto:nikolahalachev2811@gmail.com"
                                >
                                    nikolahalachev2811@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className={infoCardClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/phone.png"
                                        alt="Телефон"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Телефон</span>
                            </div>
                            <a
                                className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                href="tel:+359887764200"
                            >
                                088 776 4200
                            </a>
                        </div>

                        <div className={`${infoCardClass} overflow-hidden`}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/location.png"
                                        alt="Адрес"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Адрес</span>
                            </div>

                            <div className="mb-5 text-sm leading-7 text-slate-600">
                                ул. Архитект Петко Момчилов 24, Варна 9000, България
                            </div>

                            <div className="mb-4 overflow-hidden rounded-[20px] border border-sky-100">
                                <iframe
                                    className="h-[280px] w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src="https://www.google.com/maps?hl=bg&q=ул.%20Архитект%20Петко%20Момчилов%2024,%20Варна%209000&z=17&output=embed"
                                />
                            </div>

                            <a
                                className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://www.google.com/maps/search/?api=1&query=ул.%20Архитект%20Петко%20Момчилов%2024,%20Варна%209000"
                            >
                                Отвори в Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
            <section className="text-center">
                <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Contact Me
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
                    Choose a channel or send me a message.
                </p>
            </section>

            <section>
                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="flex flex-col gap-8">
                        <div className={cardClass}>
                            <h2 className="mb-6 text-2xl font-bold text-slate-900">
                                Send me a message
                            </h2>

                            <form className="flex flex-col gap-5" onSubmit={submitForm}>
                                <div>
                                    <label className={labelClass}>Name</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="name"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input
                                        className={inputClass}
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="phone"
                                        placeholder="Your phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Subject</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        name="subject"
                                        placeholder="Subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Message</label>
                                    <textarea
                                        className={`${inputClass} min-h-[160px] resize-y`}
                                        name="message"
                                        rows={6}
                                        placeholder="Your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                {submitMessage && (
                                    <div className="text-sm font-medium text-slate-700">
                                        {submitMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex w-fit items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-[24px] bg-gradient-to-br from-sky-400 via-sky-300 to-cyan-200 p-6 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.1)]">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70">
                                    <img
                                        src="/images/email1.png"
                                        alt=""
                                        className="h-6 w-6 object-contain"
                                        onError={(e) => {
                                            ; (e.currentTarget as HTMLImageElement).style.display = "none"
                                        }}
                                    />
                                </span>
                                <span className="text-xl font-bold">Get in Touch</span>
                            </div>

                            <div className="mb-6 max-w-2xl text-sm leading-7 text-slate-800">
                                I'd love to hear from you. If you have questions about my services, message me anytime.
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.facebook.com/profile.php?id=61565641385893"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/facebook.png" alt="" />
                                    </span>
                                    Facebook
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://m.me/halachev_accounting"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/messenger.webp" alt="" />
                                    </span>
                                    Messenger
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.instagram.com/halachev_accounting/"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/instagram.png" alt="" />
                                    </span>
                                    Instagram
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.tiktok.com/@halachev_accounting"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/tiktok.png" alt="" />
                                    </span>
                                    TikTok
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://wa.me/359887764200"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/whatsapp.jpg" alt="" />
                                    </span>
                                    WhatsApp
                                </a>

                                <a className={chipClass} href="viber://chat?number=%2B359887764200">
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/viber1.png" alt="" />
                                    </span>
                                    Viber
                                </a>

                                <a
                                    className={chipClass}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://revolut.me/halachev"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-50">
                                        <img className="h-5 w-5 object-contain" src="/images/revolut.png" alt="" />
                                    </span>
                                    Revolut
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className={infoCardClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/email.png"
                                        alt="Email"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Email</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <a
                                    className="break-all text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                    href="mailto:nthalachev@gmail.com"
                                >
                                    nthalachev@gmail.com
                                </a>
                                <a
                                    className="break-all text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                    href="mailto:nikolahalachev2811@gmail.com"
                                >
                                    nikolahalachev2811@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className={infoCardClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/phone.png"
                                        alt="Phone"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Phone</span>
                            </div>
                            <a
                                className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
                                href="tel:+359887764200"
                            >
                                088 776 4200
                            </a>
                        </div>

                        <div className={`${infoCardClass} overflow-hidden`}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                                    <img
                                        src="/images/location.png"
                                        alt="Address"
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className="text-lg font-bold text-slate-900">Address</span>
                            </div>

                            <div className="mb-5 text-sm leading-7 text-slate-600">
                                24 Architect Petko Momchilov St, Varna 9000, Bulgaria
                            </div>

                            <div className="mb-4 overflow-hidden rounded-[20px] border border-sky-100">
                                <iframe
                                    className="h-[280px] w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src="https://www.google.com/maps?hl=bg&q=ул.%20Архитект%20Петко%20Момчилов%2024,%20Варна%209000&z=17&output=embed"
                                />
                            </div>

                            <a
                                className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://www.google.com/maps/search/?api=1&query=ул.%20Архитект%20Петко%20Момчилов%2024,%20Варна%209000"
                            >
                                Open in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}