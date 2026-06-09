import { useState } from "react"
import { Link, Outlet } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

function AdminLayoutContent() {
    const [isDownloadingAlbums, setIsDownloadingAlbums] = useState(false)

    const downloadAllAlbums = () => {
        setIsDownloadingAlbums(true)

        const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "")
        const downloadUrl = `${normalizedBaseUrl}/api/admin/client-galleries/download-all`
        const link = document.createElement("a")

        link.href = downloadUrl
        link.download = "dgvisionstudio-albums.zip"
        document.body.appendChild(link)
        link.click()
        link.remove()

        window.setTimeout(() => setIsDownloadingAlbums(false), 1500)
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">
            <div className="bg-gray-900 px-4 py-4 text-white dark:bg-black">
                <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-lg font-bold">Админ панел</h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-white/90">
                        <Link to="/admin" className="transition hover:text-white">
                            Начало
                        </Link>

                        <Link to="/admin/contact-requests" className="transition hover:text-white">
                            Контакти
                        </Link>

                        <Link to="/admin/users" className="transition hover:text-white">
                            Потребители
                        </Link>

                        <Link to="/admin/print-requests" className="transition hover:text-white">
                            Заявки за принтиране
                        </Link>

                        <button
                            type="button"
                            onClick={downloadAllAlbums}
                            disabled={isDownloadingAlbums}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-xs font-bold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDownloadingAlbums ? "Подготвяне..." : "Изтегли всички албуми"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full px-0 py-6 sm:py-8">
                <Outlet />
            </div>
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
