import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"

const navItems = [
    { to: "/admin", label: "Начало" },
    { to: "/admin/contact-requests", label: "Запитвания" },
    { to: "/admin/users", label: "Потребители" },
    { to: "/admin/print-requests", label: "Заявки за принтиране" },
    { to: "/admin/calendar", label: "Календар" },
    { to: "/admin/slideshow", label: "Управление на слайдшоу" },
    { to: "/admin/services", label: "Услуги начален екран" },
    { to: "/admin/pricing", label: "Ценоразпис" },
]

function AdminLayoutContent() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setMobileMenuOpen(false)
    const isDashboard = location.pathname === "/admin" || location.pathname === "/admin/"
    const isCalendar = location.pathname === "/admin/calendar" || location.pathname === "/admin/calendar/"
    const hidePageHeader = isDashboard || isCalendar

    const isActive = (path: string) => {
        if (path === "/admin") return location.pathname === "/admin"
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 dark:bg-zinc-950 dark:text-white lg:pl-72">
            <div className="sticky top-0 z-40 flex justify-end border-b border-slate-200 bg-white px-4 pb-4 pt-5 shadow-sm dark:border-white/10 dark:bg-black lg:hidden">
                <button
                    type="button"
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
                className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(18rem,86vw)] flex-col bg-gray-950 px-5 py-6 text-white shadow-2xl transition-transform duration-200 dark:bg-black lg:top-20 lg:z-30 lg:w-72 lg:translate-x-0 ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="mb-2 flex justify-end lg:hidden">
                    <button
                        type="button"
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
                            {item.label}
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
