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
import PrintRequestsAdmin from "./PrintRequestsAdmin"

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminPanel />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="users/:id/albums" element={<UserAlbumsAdmin />} />
                <Route path="contact-requests" element={<ContactRequestsAdmin />} />
                <Route path="print-requests" element={<PrintRequestsAdmin />} />

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