import { Routes, Route } from "react-router-dom"

import AdminLayout from "./AdminLayout"
import AdminPanel from "./AdminPanel"
import UsersAdmin from "./usersPanel/UsersAdmin"
import UserAlbumsAdmin from "./usersPanel/UserAlbumsAdmin"
import ContactRequestsAdmin from "./ContactRequestsAdmin"
import ContactRequestEditAdmin from "./ContactRequestEditAdmin"
import ClientGalleryEditAdmin from "./galleryPanel/ClientGalleryEditAdmin"
import ClientGalleryAccessAdmin from "./galleryPanel/ClientGalleryAccessAdmin"
import PortfolioCategoryCreateAdmin from "./categoryPanel/PortfolioCategoryCreateAdmin"
import PortfolioCategoryEditAdmin from "./categoryPanel/PortfolioCategoryEditAdmin"
import PortfolioCategoryAlbumsAdmin from "./categoryPanel/PortfolioCategoryAlbumsAdmin"
import PrintRequestsAdmin from "./PrintRequestsAdmin"
import CalendarAdmin from "./CalendarAdmin"

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminPanel />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="users/:id/albums" element={<UserAlbumsAdmin />} />
                <Route path="contact-requests" element={<ContactRequestsAdmin />} />
                <Route path="contact-requests/:id" element={<ContactRequestEditAdmin />} />
                <Route path="contact-requests/:id/edit" element={<ContactRequestEditAdmin />} />
                <Route path="print-requests" element={<PrintRequestsAdmin />} />
                <Route path="calendar" element={<CalendarAdmin />} />

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
