import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState } from "react"

const THEME_KEY = "theme"

export default function Navbar() {
    const { i18n } = useTranslation()
    const location = useLocation()

    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [isDark, setIsDark] = useState(false)
    const [servicesOpen, setServicesOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showNavbar, setShowNavbar] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY)
        const dark = savedTheme === "dark"

        document.documentElement.classList.toggle("dark", dark)
        setIsDark(dark)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const revealZone = window.innerHeight * 0.3

            if (currentScrollY <= revealZone) {
                setShowNavbar(true)
            } else if (currentScrollY < lastScrollY.current) {
                setShowNavbar(true)
            } else if (currentScrollY > lastScrollY.current) {
                setShowNavbar(false)
                setServicesOpen(false)
                setMobileOpen(false)
            }

            lastScrollY.current = currentScrollY
        }

        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
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
              { to: "/portfolio#baptism", label: "Кръщене" },
              { to: "/portfolio#wedding", label: "Сватбена фотография" },
              { to: "/portfolio#family", label: "Семейна фотография" },
              { to: "/portfolio#event", label: "Заснемане на събития" },
          ]
        : [
              { to: "/portfolio#portrait", label: "Portrait Photography" },
              { to: "/portfolio#product", label: "Product Photography" },
              { to: "/portfolio#commercial", label: "Commercial Photography" },
              { to: "/portfolio#corporate", label: "Corporate Photography" },
              { to: "/portfolio#graduate", label: "Graduation Photography" },
              { to: "/portfolio#baptism", label: "Baptism" },
              { to: "/portfolio#wedding", label: "Wedding Photography" },
              { to: "/portfolio#family", label: "Family Photography" },
                { to: "/portfolio#event", label: "Event Photography" },
          ]

    const items = isBg
        ? [
              { to: "/", label: "Услуги", hasDropdown: true },
              { to: "/portfolio", label: "Портфолио" },
              { to: "/about", label: "За нас" },
              { to: "/contact", label: "Контакти" },
          ]
        : [
              { to: "/", label: "Services", hasDropdown: true },
              { to: "/portfolio", label: "Portfolio" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
          ]

    const isActive = (to: string, hasDropdown?: boolean) => {
        if (hasDropdown) return location.pathname === "/"
        if (to === "/portfolio") return location.pathname === "/portfolio"
        return location.pathname === to
    }

    const linkClass = (to: string, hasDropdown?: boolean) =>
        `relative inline-flex items-center pb-1 text-sm font-semibold transition ${
            isActive(to, hasDropdown)
                ? "text-slate-950 after:absolute after:-bottom-[22px] after:left-0 after:h-[2px] after:w-full after:bg-slate-950 dark:text-white dark:after:bg-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        }`

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white transition-transform duration-300 dark:border-white dark:bg-black ${
                showNavbar ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between lg:h-20">
                    <Link to="/" className="flex items-center overflow-hidden">
                        <img
                            src={isDark ? "/images/mainlogoBlack.png" : "/images/mainlogo.png"}
                            alt="DG Vision Studio"
                            className="h-10 w-auto scale-[1.35] object-contain sm:h-12 lg:h-14"
                        />
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {items.map((item) =>
                            item.hasDropdown ? (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => setServicesOpen(true)}
                                    onMouseLeave={() => setServicesOpen(false)}
                                >
                                    <Link to="/" className={linkClass("/", true)}>
                                        {item.label}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="ml-1.5 h-4 w-4"
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </Link>

                                    <div className="absolute left-0 top-full h-8 w-full" />

                                    <div
                                        className={`absolute left-1/2 top-full z-50 mt-6 w-[320px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg transition-all duration-200 dark:border-white/10 dark:bg-black ${
                                            servicesOpen
                                                ? "visible translate-y-0 opacity-100"
                                                : "invisible -translate-y-1 opacity-0"
                                        }`}
                                    >
                                        {serviceItems.map((s) => (
                                            <Link
                                                key={s.to}
                                                to={s.to}
                                                className="block rounded-lg px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white dark:hover:text-black"
                                                onClick={() => setServicesOpen(false)}
                                            >
                                                {s.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link key={item.to} to={item.to} className={linkClass(item.to)}>
                                    {item.label}
                                </Link>
                            )
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex h-9 w-9 items-center justify-center bg-transparent"
                            aria-label={isBg ? "Смени тема" : "Toggle theme"}
                        >
                            <img
                                src="/light-mode.svg"
                                alt=""
                                className={`h-4 w-4 object-contain transition duration-200 ${isDark ? "invert" : ""}`}
                            />
                        </button>

                        <div className="hidden text-xs font-bold sm:flex">
                            <button
                                type="button"
                                onClick={() => i18n.changeLanguage(isBg ? "en" : "bg")}
                                className="transition hover:text-slate-950 dark:hover:text-white"
                            >
                                {isBg ? "EN" : "BG"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="flex h-9 w-9 items-center justify-center rounded border lg:hidden"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div className="space-y-3 border-t bg-white px-4 py-4 dark:bg-black lg:hidden">
                    <button
                        type="button"
                        onClick={() => {
                            i18n.changeLanguage(isBg ? "en" : "bg")
                            setMobileOpen(false)
                        }}
                        className="block text-base font-medium text-slate-600 dark:text-slate-300"
                    >
                        {isBg ? "EN" : "BG"}
                    </button>

                    {items.map((item) => (
                        <div key={item.label}>
                            <Link
                                to={item.to}
                                className={`block text-base font-medium ${
                                    isActive(item.to, item.hasDropdown)
                                        ? "text-slate-950 dark:text-white"
                                        : "text-slate-600 dark:text-slate-300"
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>

                            {item.hasDropdown && (
                                <div className="ml-3 mt-2 space-y-1">
                                    {serviceItems.map((s) => (
                                        <Link
                                            key={s.to}
                                            to={s.to}
                                            className="block text-sm text-slate-500 dark:text-slate-400"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {s.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </header>
    )
}