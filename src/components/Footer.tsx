import { Link } from "react-router-dom"
import { Mail, Phone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

const THEME_KEY = "theme"

export default function Footer() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY)
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const dark = savedTheme === "dark" || (!savedTheme && systemDark)
        setIsDark(dark)
    }, [])

    const t = isBg
        ? {
              description:
                  "Професионална фотография – портрети, събития и визуално съдържание с характер и стил.",
              company: "Страници",
              info: "Информация",
              home: "Начало",
              about: "За нас",
              contact: "Контакти",
              privacy: "Политика за поверителност",
              terms: "Общи условия",
              cookies: "Бисквитки",
              rights: "Всички права запазени.",
              createdBy: "Site created by DG Vision Studio",
          }
        : {
              description:
                  "Professional photography – portraits, events, and visual content with character and style.",
              company: "Pages",
              info: "Information",
              home: "Home",
              about: "About Us",
              contact: "Contact",
              privacy: "Privacy Policy",
              terms: "Terms",
              cookies: "Cookies",
              rights: "All rights reserved.",
              createdBy: "Site created by DG Vision Studio",
          }

    const socialClass =
        "inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:scale-105 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20 sm:h-11 sm:w-11"

    const fullIconClass = "h-full w-full rounded-full object-contain p-[1px]"

    const footerLinkClass =
        "break-words transition hover:text-slate-950 dark:hover:text-white"

    const contactLinkClass =
        "inline-flex w-fit max-w-full items-start gap-2 text-left transition hover:text-slate-900 dark:hover:text-white lg:text-right"

    return (
        <footer className="mt-12 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 sm:mt-14 lg:mt-16">
            <div className="mx-auto w-full max-w-[1700px] px-4 py-10 sm:px-6 sm:py-12 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
                <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10 xl:gap-14 2xl:gap-20">
                    <div className="min-w-0">
                        <Link to="/" className="inline-flex max-w-full items-center">
                            <img
                                src={isDark ? "/images/mainlogoBlack.png" : "/images/mainlogo.png"}
                                alt="DG Vision Studio"
                                className="h-11 w-auto max-w-full object-contain sm:h-12 md:h-14 xl:h-16"
                            />
                        </Link>

                        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-[15px] sm:leading-7 xl:max-w-lg xl:text-base">
                            {t.description}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <a
                                href="https://www.facebook.com/profile.php?id=61588317548349"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={socialClass}
                            >
                                <img
                                    src="/images/facebook.png"
                                    alt="Facebook"
                                    className={fullIconClass}
                                />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 min-[430px]:grid-cols-2 sm:gap-10 lg:gap-8 xl:gap-12">
                        <div className="min-w-0">
                            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white sm:mb-4 sm:text-[15px]">
                                {t.company}
                            </h4>

                            <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-300 sm:text-[15px]">
                                <Link to="/" className={footerLinkClass}>
                                    {t.home}
                                </Link>
                                <Link to="/about" className={footerLinkClass}>
                                    {t.about}
                                </Link>
                                <Link to="/contact" className={footerLinkClass}>
                                    {t.contact}
                                </Link>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white sm:mb-4 sm:text-[15px]">
                                {t.info}
                            </h4>

                            <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-300 sm:text-[15px]">
                                <Link to="/privacy" className={footerLinkClass}>
                                    {t.privacy}
                                </Link>
                                <Link to="/terms" className={footerLinkClass}>
                                    {t.terms}
                                </Link>
                                <Link to="/cookies" className={footerLinkClass}>
                                    {t.cookies}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 lg:justify-self-end lg:text-right">
                        <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 sm:text-[15px] lg:items-end">
                            <a href="tel:+359887764200" className={contactLinkClass}>
                                <Phone size={16} className="mt-[2px] shrink-0" />
                                <span className="whitespace-nowrap">088 776 4200</span>
                            </a>

                            <a href="tel:+359887764201" className={contactLinkClass}>
                                <Phone size={16} className="mt-[2px] shrink-0" />
                                <span className="whitespace-nowrap">088 776 4201</span>
                            </a>

                            <a
                                href="mailto:dgvisionstudio@gmail.com"
                                className={contactLinkClass}
                            >
                                <Mail size={16} className="mt-[2px] shrink-0" />
                                <span className="break-all">dgvisionstudio@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 sm:mt-10 sm:pt-7 md:text-[15px]">
                    <div className="flex flex-col gap-3 text-center sm:text-left lg:flex-row lg:items-center lg:justify-between">
                        <p className="break-words">
                            © {new Date().getFullYear()} DG Vision Studio. {t.rights}
                        </p>

                        <p className="break-words lg:text-right">
                            {t.createdBy}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}