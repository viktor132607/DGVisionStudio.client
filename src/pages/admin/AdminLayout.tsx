import { Link, Outlet } from "react-router-dom"

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-100">

            <div className="bg-gray-900 text-white px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="font-bold text-lg">Admin</h1>

                    <div className="flex gap-6 text-sm">
                        <Link to="/admin">Dashboard</Link>
                        <Link to="/admin/blog">Blog</Link>
                        <Link to="/admin/reviews">Reviews</Link>
                        <Link to="/admin/users">Users</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-10 px-4">
                <Outlet />
            </div>

        </div>
    )
}