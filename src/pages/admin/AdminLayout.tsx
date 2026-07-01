import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"

const navItems = [
    { to: "/admin", label: "Начало" },
    { to: "/admin/contact-requests", label: "Контакти" },
    { to: "/admin/users", label: "Потребители" },
    { to: "/admin/print-requests", label: "Заявки за принтиране" },
    { to: "/admin/calendar", label: "Календар" },
    { to: "/admin/slideshow", label: "Управление на слайдшоу" },
]

const API_BASE_URL = import.meta.env.VITE_API_URL || ""
const DOWNLOAD_ALL_ALBUMS_URL = `${API_BASE_URL}/api/admin/client-galleries/download-all-file`

function AdminLayoutContent() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setMobileMenuOpen(false)

    const isActive = (path: string) => {
        if (path === "/admin") return location.pathname === "/admin"
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 dark:bg-zinc-950 dark:text-white lg:pl-72">
            <div className="sticky top-0 z-40 flex items-start justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-5 shadow-sm dark:border-white/10 dark:bg-black lg:hidden">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">DG Vision Studio</p>
                    <p className="text-sm font-black text-slate-950 dark:text-white">Админ панел</p>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="mt-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black"
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
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">DG Vision Studio</p>
                        <h1 className="mt-2 text-2xl font-black tracking-tight">Админ панел</h1>
                    </div>

                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white lg:hidden"
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

                <a
                    href={DOWNLOAD_ALL_ALBUMS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-gray-950 transition hover:bg-gray-100"
                >
                    Изтегли всички албуми
                </a>
            </aside>

            <main className="min-h-screen w-full px-0 py-4 sm:py-6 lg:py-8">
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
