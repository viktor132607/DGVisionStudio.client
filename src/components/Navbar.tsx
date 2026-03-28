import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

const THEME_KEY = "theme"

export default function Navbar() {
    const { i18n } = useTranslation()
    const location = useLocation()

    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [isDark, setIsDark] = useState(false)
    const [servicesOpen, setServicesOpen] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY)
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const dark = savedTheme === "dark" || (!savedTheme && systemDark)

        document.documentElement.classList.toggle("dark", dark)
        setIsDark(dark)
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle("dark", next)
        localStorage.setItem(THEME_KEY, next ? "dark" : "light")
    }

    const serviceItems = isBg
        ? [
              { to: "/portfolio#portrait", label: "Портретна фотография" },
              { to: "/portfolio#product", label: "Продуктова фотография" },
              { to: "/portfolio#commercial", label: "Рекламна фотография" },
              { to: "/portfolio#corporate", label: "Корпоративна фотография" },
              { to: "/portfolio#graduate", label: "Абитуриентска фотография" },
              { to: "/portfolio#birthday", label: "Заснемане на детски рожден ден" },
              { to: "/portfolio#christmas", label: "Коледна фотосесия" },
              { to: "/portfolio#baptism", label: "Заснемане на кръщене" },
              { to: "/portfolio#wedding", label: "Сватбена фотография" },
              { to: "/portfolio#family", label: "Семейна фотография" },
              { to: "/portfolio#maternity", label: "Фотосесия за бременни" },
          ]
        : [
              { to: "/portfolio#portrait", label: "Portrait Photography" },
              { to: "/portfolio#product", label: "Product Photography" },
              { to: "/portfolio#commercial", label: "Commercial Photography" },
              { to: "/portfolio#corporate", label: "Corporate Photography" },
              { to: "/portfolio#graduate", label: "Graduation Photography" },
              { to: "/portfolio#birthday", label: "Kids Birthday Photography" },
              { to: "/portfolio#christmas", label: "Christmas Photoshoot" },
              { to: "/portfolio#baptism", label: "Baptism Photography" },
              { to: "/portfolio#wedding", label: "Wedding Photography" },
              { to: "/portfolio#family", label: "Family Photography" },
              { to: "/portfolio#maternity", label: "Maternity Photoshoot" },
          ]

    const items = isBg
        ? [
              { to: "/portfolio", label: "Услуги", hasDropdown: true },
              { to: "/portfolio", label: "Портфолио" },
              { to: "/about", label: "За нас" },
              { to: "/contact", label: "Контакти" },
          ]
        : [
              { to: "/portfolio", label: "Services", hasDropdown: true },
              { to: "/portfolio", label: "Portfolio" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
          ]

    const isServicesActive =
        location.pathname === "/portfolio" ||
        location.pathname === "/services" ||
        location.hash === "#portrait" ||
        location.hash === "#product" ||
        location.hash === "#commercial" ||
        location.hash === "#corporate" ||
        location.hash === "#graduate" ||
        location.hash === "#birthday" ||
        location.hash === "#christmas" ||
        location.hash === "#baptism" ||
        location.hash === "#wedding" ||
        location.hash === "#family" ||
        location.hash === "#maternity"

    const isActive = (to: string, hasDropdown?: boolean) => {
        if (hasDropdown) return isServicesActive
        return location.pathname === to
    }

    const linkClass = (to: string, hasDropdown?: boolean) =>
        `relative inline-flex items-center text-[14px] font-semibold tracking-[0.01em] transition ${
            isActive(to, hasDropdown)
                ? "text-slate-950 after:absolute after:-bottom-[16px] after:left-0 after:h-[2px] after:w-full after:bg-slate-950 dark:text-white dark:after:bg-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        }`

    const langButtonClass = (active: boolean) =>
        `text-[11px] font-bold uppercase tracking-[0.14em] transition ${
            active
                ? "text-slate-950 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
        }`

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white dark:bg-black">
            <div className="mx-auto max-w-[1400px] px-6">
                <div className="flex min-h-[84px] items-center">
                    <div className="w-[220px] shrink-0">
                        <Link to="/" className="inline-flex items-center">
                            <img
                                src="/images/mainlogo.png"
                                alt="DG Vision Studio"
                                className="h-14 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                        <nav className="flex items-center gap-8">
                            {items.map((item) =>
                                item.hasDropdown ? (
                                    <div
                                        key={item.label}
                                        className="relative"
                                        onMouseEnter={() => setServicesOpen(true)}
                                        onMouseLeave={() => setServicesOpen(false)}
                                    >
                                        <Link to="/" className={linkClass("/", item.hasDropdown)}>
                                            <span>{item.label}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="ml-2 h-4 w-4"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </Link>

                                        <div className="absolute left-0 top-full h-2.5 w-full" />

                                        <div
                                            className={`absolute left-1/2 top-full z-50 mt-2 w-[320px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition dark:border-white dark:bg-black ${
                                                servicesOpen
                                                    ? "visible translate-y-0 opacity-100"
                                                    : "invisible -translate-y-1 opacity-0"
                                            }`}
                                        >
                                            <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-1">
                                                {serviceItems.map((service) => (
                                                    <Link
                                                        key={service.to}
                                                        to={service.to}
                                                        className="rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white dark:hover:bg-white dark:hover:text-black"
                                                        onClick={() => setServicesOpen(false)}
                                                    >
                                                        {service.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link key={item.to} to={item.to} className={linkClass(item.to)}>
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>

                    <div className="flex w-[220px] shrink-0 items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3c0 .37.02.73.05 1.08A7 7 0 0 0 19.92 12c.36.03.72.05 1.08.05Z" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void i18n.changeLanguage("bg")}
                                className={langButtonClass(!!isBg)}
                            >
                                BG
                            </button>

                            <span className="text-slate-300 dark:text-slate-600">|</span>

                            <button
                                type="button"
                                onClick={() => void i18n.changeLanguage("en")}
                                className={langButtonClass(!isBg)}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}