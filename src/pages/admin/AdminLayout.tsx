import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"
import { useAdminToast } from "../../hooks/useAdminToast"
import { apiFetch } from "../../services/api"

const navItems = [
    { to: "/admin", label: "Начало" },
    { to: "/admin/contact-requests", label: "Контакти" },
    { to: "/admin/users", label: "Потребители" },
    { to: "/admin/print-requests", label: "Заявки за принтиране" },
    { to: "/admin/calendar", label: "Календар" },
]

function getDownloadFileName(contentDisposition: string | null) {
    if (!contentDisposition) return "dgvisionstudio-all-albums.zip"

    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utfMatch?.[1]) {
        return decodeURIComponent(utfMatch[1].replace(/"/g, ""))
    }

    const match = contentDisposition.match(/filename="?([^";]+)"?/i)
    return match?.[1] || "dgvisionstudio-all-albums.zip"
}

function AdminLayoutContent() {
    const location = useLocation()
    const { showToast } = useAdminToast()
    const [isDownloadingAlbums, setIsDownloadingAlbums] = useState(false)

    const downloadAllAlbums = async () => {
        setIsDownloadingAlbums(true)

        try {
            const response = await apiFetch("/admin/client-galleries/download-all", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                const contentType = response.headers.get("content-type") || ""
                let message = "Архивът не можа да бъде изтеглен."

                if (contentType.includes("application/json")) {
                    const data = await response.json().catch(() => null)
                    message = data?.message || data?.title || message
                } else {
                    const text = await response.text().catch(() => "")
                    message = text || `${response.status} ${response.statusText}`.trim() || message
                }

                throw new Error(message)
            }

            const blob = await response.blob()
            if (!blob.size) {
                throw new Error("Архивът е празен.")
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")

            link.href = url
            link.download = getDownloadFileName(response.headers.get("content-disposition"))
            document.body.appendChild(link)
            link.click()
            link.remove()

            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Архивът не можа да бъде изтеглен."
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setIsDownloadingAlbums(false)
        }
    }

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

                <button
                    type="button"
                    onClick={() => void downloadAllAlbums()}
                    disabled={isDownloadingAlbums}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-gray-950 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isDownloadingAlbums ? "Подготвяне..." : "Изтегли всички албуми"}
                </button>
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
