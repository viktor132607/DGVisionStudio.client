import { Route } from "react-router-dom"
import RequireAdmin from "../../components/RequireAdmin"

import AdminLayout from "./AdminLayout"
import AdminPanel from "./AdminPanel"
import BlogAdmin from "./BlogAdmin"
import CreateBlogPost from "./CreateBlogPost"
import EditBlogPost from "./EditBlogPost"
import UsersAdmin from "./UsersAdmin"
import ContactRequestsAdmin from "./ContactRequestsAdmin"
import ServiceRequestsAdmin from "./ServiceRequestsAdmin"

export const AdminRoutes = (
    <Route
        path="/admin"
        element={
            <RequireAdmin>
                <AdminLayout />
            </RequireAdmin>
        }
    >
        <Route index element={<AdminPanel />} />

        <Route path="blog" element={<BlogAdmin />} />
        <Route path="blog/create" element={<CreateBlogPost />} />
        <Route path="blog/edit/:id" element={<EditBlogPost />} />

        <Route path="users" element={<UsersAdmin />} />

        <Route path="contact-requests" element={<ContactRequestsAdmin />} />

        <Route path="service-requests" element={<ServiceRequestsAdmin />} />
    </Route>
)