import { Mail, MapPin, Phone } from "lucide-react"
import Seo from "../components/Seo"

const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Yalta%20Shopping%20Complex%2C%20Ruse%207000"
const EMBED_URL = "https://www.google.com/maps?hl=bg&q=Yalta%20Shopping%20Complex%2C%20Ruse%207000&z=17&output=embed"

export default function Contact() {
    const contactJsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact",
        url: "https://dgvisionstudio.com/contact",
        mainEntity: {
            "@type": "LocalBusiness",
            name: "DG Vision Studio",
            email: "dgvisionstudio@gmail.com",
            telephone: "+359988758434",
            hasMap: MAP_URL,
            address: {
                "@type": "PostalAddress",
                streetAddress: "Yalta Shopping Complex",
                postalCode: "7000",
                addressLocality: "Ruse",
                addressCountry: "BG"
            }
        }
    }

    const cardClass = "rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-800 sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-8"
    const titleClass = "text-[24px] font-bold text-slate-900 dark:text-white sm:text-[28px] lg:text-[30px]"
    const contactLinkClass = "inline-flex w-fit max-w-full items-start gap-2 text-left text-[15px] leading-8 font-semibold text-slate-700 transition hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white sm:text-base"
    const textWithIconClass = "flex max-w-full items-start gap-2 text-[15px] leading-8 text-slate-700 dark:text-zinc-200 sm:text-base lg:text-[17px]"
    const iconClass = "mt-[7px] shrink-0 text-slate-500 dark:text-zinc-300"

    return (
        <>
            <Seo title="Контакти" description="DG Vision Studio контакти." canonical="/contact" image="/og-cover.jpg" type="website" jsonLd={contactJsonLd} />
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 2xl:px-16 dark:bg-zinc-900">
                <section className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-800 sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-10 lg:mb-10 lg:rounded-[32px] lg:px-10 lg:py-12 xl:px-12">
                    <h1 className="mb-4 text-[32px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[42px] lg:text-[52px]">DG Vision Studio</h1>
                    <p className="mx-auto max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-zinc-300 sm:text-[17px] sm:leading-8 lg:text-[18px]">Фотография и видеография. Свържете се с нас за запитвания и резервации.</p>
                </section>

                <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
                    <div className={cardClass}>
                        <h2 className={titleClass}>Телефон</h2>
                        <div className="mt-5 space-y-3">
                            <a className={contactLinkClass} href="tel:+359988758434">
                                <Phone size={16} className={iconClass} />
                                <span className="whitespace-nowrap">+359 988 758 434</span>
                            </a>
                            <a className={contactLinkClass} href="tel:+359888959373">
                                <Phone size={16} className={iconClass} />
                                <span className="whitespace-nowrap">+359 888 959 373</span>
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={titleClass}>Имейл</h2>
                        <div className="mt-5">
                            <a className={contactLinkClass} href="mailto:dgvisionstudio@gmail.com">
                                <Mail size={16} className={iconClass} />
                                <span className="break-all">dgvisionstudio@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h2 className={titleClass}>Адрес</h2>
                        <div className="mt-5">
                            <p className={textWithIconClass}>
                                <MapPin size={16} className={iconClass} />
                                <span>Търговски комплекс Ялта, Русе 7000</span>
                            </p>
                            <p className="mt-3 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 dark:border-zinc-600 dark:text-zinc-200">Coming soon</p>
                            <a className={`${contactLinkClass} mt-3`} href={MAP_URL} target="_blank" rel="noopener noreferrer">
                                <MapPin size={16} className={iconClass} />
                                <span>Виж локацията в Google Maps</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mt-5 sm:mt-6 lg:mt-8">
                    <div className={cardClass}>
                        <h2 className={titleClass}>Карта</h2>
                        <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 dark:border-zinc-700 sm:rounded-[22px] lg:rounded-[24px]"><iframe className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={EMBED_URL} title="DG Vision Studio Map" /></div>
                        <div className="mt-5"><a className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:min-h-[48px] sm:w-auto" target="_blank" rel="noopener noreferrer" href={MAP_URL}><MapPin size={16} className="shrink-0" />Отвори в Google Maps</a></div>
                    </div>
                </section>
            </div>
        </>
    )
}
