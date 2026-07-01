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

    const isActive = (path: string) => {
        if (path === "/admin") return location.pathname === "/admin"
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 dark:bg-zinc-950 dark:text-white lg:pl-72">
            <aside className="fixed bottom-0 left-0 top-16 z-30 flex w-72 flex-col bg-gray-950 px-5 py-6 text-white shadow-2xl dark:bg-black lg:top-20">
                <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">DG Vision Studio</p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight">Админ панел</h1>
                </div>

                <nav className="flex flex-1 flex-col gap-2 text-sm font-bold">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
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

            <main className="min-h-screen w-full px-0 py-6 sm:py-8">
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
