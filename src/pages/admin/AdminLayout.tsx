import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"
import { ADMIN_CONTACT_REQUESTS_SEEN_EVENT, getAdminNotificationCounts } from "../../services/adminNotifications"

const navItems = [
    { to: "/admin/database-backup", label: "Архив на базата" },
    { to: "/admin/commands", label: "Команден промпт" },
    { to: "/admin", label: "Начало" },
    { to: "/admin/portfolio-categories", label: "Категории" },
    { to: "/admin/contact-requests", label: "Запитвания" },
    { to: "/admin/users", label: "Потребители" },
    { to: "/admin/print-requests", label: "Заявки за принтиране" },
    { to: "/admin/calendar", label: "Календар" },
    { to: "/admin/slideshow", label: "Управление на слайдшоу" },
    { to: "/admin/services", label: "Услуги начален екран" },
    { to: "/admin/photography-pages", label: "Страници услуги" },
    { to: "/admin/pricing", label: "Ценоразпис" },
]

function AdminLayoutContent() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [unseenContactRequests, setUnseenContactRequests] = useState(0)

    useEffect(() => {
        let active = true
        let latestRequest = 0

        const refreshNotifications = async () => {
            if (document.visibilityState === "hidden") return
            const requestId = ++latestRequest

            try {
                const counts = await getAdminNotificationCounts()
                if (active && requestId === latestRequest) {
                    setUnseenContactRequests(Math.max(0, Number(counts.newContactRequests) || 0))
                }
            } catch {
                // Keep the last known count when the notification API is temporarily unavailable.
            }
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") void refreshNotifications()
        }
        const onContactRequestsSeen = () => {
            setUnseenContactRequests(0)
            void refreshNotifications()
        }

        void refreshNotifications()
        const intervalId = window.setInterval(() => { void refreshNotifications() }, 30000)
        window.addEventListener("focus", refreshNotifications)
        document.addEventListener("visibilitychange", onVisibilityChange)
        window.addEventListener(ADMIN_CONTACT_REQUESTS_SEEN_EVENT, onContactRequestsSeen)

        return () => {
            active = false
            window.clearInterval(intervalId)
            window.removeEventListener("focus", refreshNotifications)
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener(ADMIN_CONTACT_REQUESTS_SEEN_EVENT, onContactRequestsSeen)
        }
    }, [])

    const closeMobileMenu = () => setMobileMenuOpen(false)
    const isDashboard = location.pathname === "/admin" || location.pathname === "/admin/"
    const isCalendar = location.pathname === "/admin/calendar" || location.pathname === "/admin/calendar/"
    const hidePageHeader = isDashboard || isCalendar

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (!mobileMenuOpen) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [mobileMenuOpen])

    const isActive = (path: string) => {
        if (path === "/admin") return location.pathname === "/admin"
        return location.pathname.startsWith(path)
    }

    return (
        <div
            data-admin-shell="true"
            className="min-h-screen bg-gray-100 text-slate-900 dark:bg-zinc-950 dark:text-white lg:pl-72"
        >
            <div
                data-admin-mobile-bar="true"
                className="sticky top-0 z-40 flex justify-end border-b border-slate-200 bg-white px-4 pb-4 pt-5 shadow-sm dark:border-white/10 dark:bg-black lg:hidden"
            >
                <button
                    type="button"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="admin-mobile-sidebar"
                    onClick={() => setMobileMenuOpen(true)}
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black"
                >
                    Меню
                </button>
            </div>

            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Затвори менюто"
                    onClick={closeMobileMenu}
                    className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                id="admin-mobile-sidebar"
                data-admin-sidebar="true"
                className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(18rem,86vw)] flex-col bg-gray-950 px-5 py-6 text-white shadow-2xl transition-transform duration-200 dark:bg-black lg:top-20 lg:z-30 lg:w-72 lg:translate-x-0 ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="mb-2 flex justify-end lg:hidden">
                    <button
                        type="button"
                        aria-label="Затвори менюто"
                        onClick={closeMobileMenu}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-auto pr-1 text-sm font-bold">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeMobileMenu}
                            className={`rounded-2xl px-4 py-3 transition ${
                                isActive(item.to)
                                    ? "bg-white text-gray-950 shadow-sm"
                                    : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <span className="flex w-full items-center justify-between gap-3">
                                <span>{item.label}</span>
                                {item.to === "/admin/contact-requests" && unseenContactRequests > 0 ? (
                                    <span
                                        className="relative flex h-3 w-3 shrink-0"
                                        title={`Нови запитвания: ${unseenContactRequests}`}
                                    >
                                        <span className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-500/20" aria-hidden="true" />
                                        <span className="sr-only">Нови запитвания: {unseenContactRequests}</span>
                                    </span>
                                ) : null}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <style>{`
                main[data-calendar-layout="true"] > div {
                    padding-top: 0 !important;
                }

                main[data-calendar-layout="true"] > div > div.grid {
                    grid-template-columns: minmax(0, 1fr) !important;
                }

                main[data-calendar-layout="true"] > div > div.grid > aside {
                    display: contents;
                }

                main[data-calendar-layout="true"] > div > div.grid > section:first-child {
                    grid-column: 1 / -1;
                    order: 3;
                }

                main[data-calendar-layout="true"] > div > div.grid > aside > section:nth-child(1) {
                    order: 1;
                }

                main[data-calendar-layout="true"] > div > div.grid > aside > section:nth-child(2) {
                    order: 2;
                }

                main[data-calendar-layout="true"] > div > div.grid > aside > section:nth-child(3) {
                    grid-column: 1 / -1;
                    order: 4;
                }

                @media (min-width: 1024px) {
                    main[data-calendar-layout="true"] > div > div.grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
            `}</style>

            <main
                data-admin-main="true"
                data-calendar-layout={isCalendar ? "true" : undefined}
                className={`min-h-screen w-full px-0 ${
                    isCalendar ? "py-0" : "py-4 sm:py-6 lg:py-8"
                } ${hidePageHeader ? "[&>div>div:first-child]:hidden" : ""}`}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default function AdminLayout() {
    return (
        <AdminToastProvider>
            <AdminLayoutContent />
        </AdminToastProvider>
    )
}
