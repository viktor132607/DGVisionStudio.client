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
    const [mobileOpen, setMobileOpen] = useState(false)

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
              { to: "/portfolio#birthday", label: "Детски рожден ден" },
              { to: "/portfolio#christmas", label: "Коледна фотосесия" },
              { to: "/portfolio#baptism", label: "Кръщене" },
              { to: "/portfolio#wedding", label: "Сватбена фотография" },
              { to: "/portfolio#family", label: "Семейна фотография" },
              { to: "/portfolio#maternity", label: "Бременност" },
          ]
        : [
              { to: "/portfolio#portrait", label: "Portrait" },
              { to: "/portfolio#product", label: "Product" },
              { to: "/portfolio#commercial", label: "Commercial" },
              { to: "/portfolio#corporate", label: "Corporate" },
              { to: "/portfolio#graduate", label: "Graduation" },
              { to: "/portfolio#birthday", label: "Birthday" },
              { to: "/portfolio#christmas", label: "Christmas" },
              { to: "/portfolio#baptism", label: "Baptism" },
              { to: "/portfolio#wedding", label: "Wedding" },
              { to: "/portfolio#family", label: "Family" },
              { to: "/portfolio#maternity", label: "Maternity" },
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
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
          ]

    const isServicesActive =
        location.pathname === "/portfolio" || location.hash.includes("#")

    const isActive = (to: string, hasDropdown?: boolean) => {
        if (hasDropdown) return isServicesActive
        return location.pathname === to
    }

    const linkClass = (to: string, hasDropdown?: boolean) =>
        `text-sm font-semibold transition ${
            isActive(to, hasDropdown)
                ? "text-slate-950 dark:text-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        }`

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white dark:bg-black">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 lg:h-20 items-center justify-between">

                    {/* LOGO */}
                    <Link to="/" className="flex items-center">
                        <img
                            src={isDark ? "/images/mainlogoBlack.png" : "/images/mainlogo.png"}
                            alt="DG Vision Studio"
                            className="h-10 sm:h-12 lg:h-14 w-auto"
                        />
                    </Link>

                    {/* DESKTOP NAV */}
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
                                    </Link>

                                    <div
                                        className={`absolute left-1/2 top-full mt-3 w-[300px] -translate-x-1/2 rounded-xl border bg-white p-2 shadow-lg dark:bg-black ${
                                            servicesOpen ? "block" : "hidden"
                                        }`}
                                    >
                                        {serviceItems.map((s) => (
                                            <Link
                                                key={s.to}
                                                to={s.to}
                                                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black"
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

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">

                        {/* THEME */}
                        <button
                            onClick={toggleTheme}
                            className="h-9 w-9 flex items-center justify-center border rounded"
                        >
                            ☾
                        </button>

                        {/* LANG */}
                        <div className="hidden sm:flex gap-2 text-xs font-bold">
                            <button onClick={() => i18n.changeLanguage("bg")}>BG</button>
                            <button onClick={() => i18n.changeLanguage("en")}>EN</button>
                        </div>

                        {/* MOBILE BTN */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden h-9 w-9 flex items-center justify-center border rounded"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileOpen && (
                <div className="lg:hidden border-t bg-white dark:bg-black px-4 py-4 space-y-3">
                    {items.map((item) => (
                        <div key={item.label}>
                            <Link
                                to={item.to}
                                className="block text-base font-medium"
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
                                            className="block text-sm text-slate-500"
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