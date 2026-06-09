import { useState } from "react"
import { Link, Outlet } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"
import { useAdminToast } from "../../hooks/useAdminToast"
import { apiFetch } from "../../services/api"

function AdminLayoutContent() {
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
                throw new Error("Архивът не можа да бъде изтеглен.")
            }

            const blob = await response.blob()
            const contentDisposition = response.headers.get("content-disposition") || ""
            const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
            const fileName = decodeURIComponent(fileNameMatch?.[1] || fileNameMatch?.[2] || "dgvisionstudio-albums.zip")
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")

            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            showToast({
                type: "success",
                title: "Готово",
                message: "Архивът с албумите беше изтеглен.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Архивът не можа да бъде изтеглен."

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setIsDownloadingAlbums(false)
        }
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
                            onClick={() => void downloadAllAlbums()}
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
