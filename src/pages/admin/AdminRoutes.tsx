import { Routes, Route } from "react-router-dom"

import AdminLayout from "./AdminLayout"
import AdminPanel from "./AdminPanel"
import UsersAdmin from "./UsersAdmin"
import UserAlbumsAdmin from "./UserAlbumsAdmin"
import ContactRequestsAdmin from "./ContactRequestsAdmin"
import ClientGalleryEditAdmin from "./ClientGalleryEditAdmin"
import ClientGalleryAccessAdmin from "./ClientGalleryAccessAdmin"
import PortfolioCategoryCreateAdmin from "./PortfolioCategoryCreateAdmin"
import PortfolioCategoryEditAdmin from "./PortfolioCategoryEditAdmin"
import PortfolioCategoryAlbumsAdmin from "./PortfolioCategoryAlbumsAdmin"

function Placeholder({ title }: { title: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                Тази секция още не е свързана.
            </p>
        </div>
    )
}

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminPanel />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="users/:id/albums" element={<UserAlbumsAdmin />} />
                <Route path="contact-requests" element={<ContactRequestsAdmin />} />
                <Route path="testimonials" element={<Placeholder title="Админ отзиви" />} />

                <Route path="client-galleries/new" element={<ClientGalleryEditAdmin />} />
                <Route path="client-galleries/edit" element={<ClientGalleryEditAdmin />} />
                <Route path="client-galleries/access" element={<ClientGalleryAccessAdmin />} />

                <Route path="portfolio-categories/new" element={<PortfolioCategoryCreateAdmin />} />
                <Route path="portfolio-categories/edit" element={<PortfolioCategoryEditAdmin />} />
                <Route path="portfolio-categories/albums" element={<PortfolioCategoryAlbumsAdmin />} />
            </Route>
        </Routes>
    )
}