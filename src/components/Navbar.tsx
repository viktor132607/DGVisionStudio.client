import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"

const THEME_KEY = "theme"

export default function Navbar() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const { user, isAdmin, logout } = useAuth()

    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [isDark, setIsDark] = useState(false)
    const [servicesOpen, setServicesOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
    const [mobileAuthOpen, setMobileAuthOpen] = useState(false)
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
                setMobileServicesOpen(false)
                setMobileAuthOpen(false)
            }

            lastScrollY.current = currentScrollY
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle("dark", next)
        localStorage.setItem(THEME_KEY, next ? "dark" : "light")
    }

    const closeMobileMenu = () => {
        setMobileOpen(false)
        setMobileServicesOpen(false)
        setMobileAuthOpen(false)
    }

    const handleLogout = async () => {
        await logout()
        closeMobileMenu()
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
              { to: "/pricing", label: "Ценоразпис" },
              { to: "/about", label: "За нас" },
              { to: "/contact", label: "Контакти" },
          ]
        : [
              { to: "/", label: "Services", hasDropdown: true },
              { to: "/portfolio", label: "Portfolio" },
              { to: "/pricing", label: "Pricing" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
          ]

    const isActive = (to: string, hasDropdown?: boolean) => {
        if (hasDropdown) return location.pathname === "/"
        if (to === "/portfolio") return location.pathname === "/portfolio"
        if (to === "/pricing") return location.pathname === "/pricing"
        return location.pathname === to
    }

    const desktopNavLinkClass = (to: string, hasDropdown?: boolean) =>
        `relative inline-flex items-center py-1 text-[14px] 2xl:text-[16px] font-semibold tracking-[0.01em] transition ${
            isActive(to, hasDropdown)
                ? "text-neutral-950 after:absolute after:-bottom-[27px] after:left-0 after:h-[2px] after:w-full after:bg-neutral-950 dark:text-white dark:after:bg-white"
                : "text-neutral-600 hover:text-neutral-950 dark:text-zinc-300 dark:hover:text-white"
        }`

    const desktopOutlineButtonClass =
        "hidden xl:inline-flex items-center justify-center rounded-full border border-neutral-300 bg-transparent px-4 2xl:px-5 py-2 text-[13px] 2xl:text-[14px] font-semibold text-neutral-800 transition hover:border-neutral-950 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"

    const desktopSolidButtonClass =
        "hidden xl:inline-flex items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-4 2xl:px-5 py-2 text-[13px] 2xl:text-[14px] font-semibold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"

    const mobileHeaderButtonClass =
        "inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-[12px] font-bold text-neutral-800 transition hover:bg-neutral-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"

    const mobileIconButtonClass =
        "flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"

    const mobileLinkClass = (active: boolean) =>
        `block border-b border-neutral-200 py-4 text-base font-semibold tracking-[0.01em] transition dark:border-white/10 ${
            active
                ? "text-neutral-950 dark:text-white"
                : "text-neutral-700 hover:text-neutral-950 dark:text-zinc-200 dark:hover:text-white"
        }`

    const mobileSubLinkClass =
        "block border-b border-neutral-100 py-3 text-sm font-medium text-neutral-500 transition last:border-b-0 hover:text-neutral-950 dark:border-white/10 dark:text-zinc-400 dark:hover:text-white"

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-transform duration-300 dark:border-white/10 dark:bg-black/90 ${
                showNavbar ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12">
                <div className="flex h-[72px] items-center justify-between sm:h-[78px] xl:h-[88px]">
                    <Link to="/" className="flex min-w-0 items-center py-1 pr-2 xl:pr-4">
                        <img
                            src={isDark ? "/images/relogo/white.webp" : "/images/relogo/black.webp"}
                            alt="DG Vision Studio"
                            className="block h-[34px] w-auto object-contain sm:h-[42px] xl:h-[50px] 2xl:h-[54px]"
                        />
                    </Link>

                    <nav className="hidden items-center gap-6 2xl:gap-11 xl:flex">
                        {items.map((item) =>
                            item.hasDropdown ? (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => setServicesOpen(true)}
                                    onMouseLeave={() => setServicesOpen(false)}
                                >
                                    <Link to="/" className={desktopNavLinkClass("/", true)}>
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
                                        className={`absolute left-1/2 top-full z-50 mt-6 w-[340px] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.14)] transition-all duration-200 dark:border-white/10 dark:bg-zinc-950 dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${
                                            servicesOpen
                                                ? "visible translate-y-0 opacity-100"
                                                : "invisible -translate-y-1 opacity-0"
                                        }`}
                                    >
                                        {serviceItems.map((s) => (
                                            <Link
                                                key={s.to}
                                                to={s.to}
                                                className="block rounded-xl px-4 py-3 text-[14px] font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black"
                                                onClick={() => setServicesOpen(false)}
                                            >
                                                {s.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link key={item.to} to={item.to} className={desktopNavLinkClass(item.to)}>
                                    {item.label}
                                </Link>
                            )
                        )}
                    </nav>

                    <div className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3">
                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin" className={desktopOutlineButtonClass}>
                                        {isBg ? "Админ" : "Admin"}
                                    </Link>
                                )}

                                <Link to="/identity/profile" className={desktopOutlineButtonClass}>
                                    {isBg ? "Профил" : "Profile"}
                                </Link>

                                <button type="button" onClick={handleLogout} className={desktopSolidButtonClass}>
                                    {isBg ? "Изход" : "Logout"}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/identity/login" className={desktopOutlineButtonClass}>
                                    {isBg ? "Вход" : "Login"}
                                </Link>

                                <Link to="/identity/register" className={desktopSolidButtonClass}>
                                    {isBg ? "Регистрация" : "Register"}
                                </Link>
                            </>
                        )}

                        {!user ? (
                            <div className="relative xl:hidden">
                                <button
                                    type="button"
                                    onClick={() => setMobileAuthOpen((prev) => !prev)}
                                    className={mobileHeaderButtonClass}
                                >
                                    {isBg ? "Вход" : "Login"}
                                </button>

                                {mobileAuthOpen && (
                                    <div className="absolute right-0 top-full z-50 mt-3 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-zinc-950">
                                        <Link
                                            to="/identity/login"
                                            className="block border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                            onClick={closeMobileMenu}
                                        >
                                            {isBg ? "Вход" : "Login"}
                                        </Link>

                                        <Link
                                            to="/identity/register"
                                            className="block px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                            onClick={closeMobileMenu}
                                        >
                                            {isBg ? "Регистрация" : "Register"}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/identity/profile" className={`${mobileHeaderButtonClass} xl:hidden`}>
                                {isBg ? "Профил" : "Profile"}
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => i18n.changeLanguage(isBg ? "en" : "bg")}
                            className={mobileHeaderButtonClass}
                        >
                            {isBg ? "EN" : "BG"}
                        </button>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-transparent transition hover:border-neutral-200 hover:bg-neutral-100 dark:hover:border-white/10 dark:hover:bg-zinc-900"
                            aria-label={isBg ? "Смени тема" : "Toggle theme"}
                        >
                            <img
                                src="/light-mode.svg"
                                alt=""
                                className={`h-[15px] w-[15px] object-contain transition duration-200 ${isDark ? "invert" : ""}`}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={`${mobileIconButtonClass} xl:hidden`}
                            aria-label={isBg ? "Меню" : "Menu"}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-neutral-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-black sm:max-h-[calc(100vh-78px)] xl:hidden">
                    <div>
                        {items.map((item) =>
                            item.hasDropdown ? (
                                <div key={item.label} className="border-b border-neutral-200 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setMobileServicesOpen((prev) => !prev)}
                                        className={`flex w-full items-center justify-between py-4 text-left text-base font-semibold tracking-[0.01em] transition ${
                                            isActive(item.to, true)
                                                ? "text-neutral-950 dark:text-white"
                                                : "text-neutral-700 hover:text-neutral-950 dark:text-zinc-200 dark:hover:text-white"
                                        }`}
                                    >
                                        <span>{item.label}</span>

                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 dark:border-white/20 dark:text-zinc-200">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </span>
                                    </button>

                                    {mobileServicesOpen && (
                                        <div className="mb-3 bg-white dark:bg-black">
                                            {serviceItems.map((s) => (
                                                <Link
                                                    key={s.to}
                                                    to={s.to}
                                                    className={mobileSubLinkClass}
                                                    onClick={closeMobileMenu}
                                                >
                                                    {s.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={mobileLinkClass(isActive(item.to))}
                                    onClick={closeMobileMenu}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}

                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={mobileLinkClass(location.pathname === "/admin")}
                                        onClick={closeMobileMenu}
                                    >
                                        {isBg ? "Админ" : "Admin"}
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full border-b border-neutral-200 py-4 text-left text-base font-semibold text-neutral-700 dark:border-white/10 dark:text-zinc-200"
                                >
                                    {isBg ? "Изход" : "Logout"}
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </header>
    )
}
