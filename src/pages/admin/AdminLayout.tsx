import { useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import AdminToastProvider from "../../components/admin/AdminToastProvider"

export default function AdminLayout() {
    useEffect(() => {
        const cleanupButtons = () => {
            const pathname = window.location.pathname
            const buttons = Array.from(document.querySelectorAll("button"))

            for (const button of buttons) {
                const text = button.textContent?.trim() || ""
                const parent = button.parentElement

                if (pathname === "/admin" && text === "Обнови албумите" && parent) {
                    const exists = parent.querySelector("[data-create-category-link='true']")
                    if (!exists) {
                        const link = document.createElement("a")
                        link.href = "/admin/portfolio-categories/new"
                        link.textContent = "Създай категория"
                        link.dataset.createCategoryLink = "true"
                        link.className = "inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        button.replaceWith(link)
                    } else {
                        button.remove()
                    }
                    continue
                }

                if (pathname === "/admin" && (text === "Обнови всичко" || text === "Обнови категориите")) {
                    button.remove()
                    continue
                }

                if (pathname.startsWith("/admin/portfolio-categories") && text === "Обнови") {
                    button.remove()
                }
            }
        }

        cleanupButtons()
        const observer = new MutationObserver(cleanupButtons)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [])

    return (
        <AdminToastProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">
                <div className="bg-gray-900 px-4 py-4 text-white dark:bg-black">
                    <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <h1 className="text-lg font-bold">Админ панел</h1>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/90">
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
                        </div>
                    </div>
                </div>

                <div className="w-full px-0 py-6 sm:py-8">
                    <Outlet />
                </div>
            </div>
        </AdminToastProvider>
    )
}
