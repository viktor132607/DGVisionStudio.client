import { Link, Outlet } from "react-router-dom"

export default function AdminLayout() {
    return (
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
    )
}