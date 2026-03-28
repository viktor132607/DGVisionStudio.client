import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Profile() {
    const { user, isAdmin, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/identity/login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Profile
                </h1>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Roles</p>
                        <p className="font-medium">
                            {user?.roles?.join(", ") || "User"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            to="/identity/change-password"
                            className="bg-black text-white p-2 rounded text-center hover:bg-gray-800"
                        >
                            Change password
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="border border-black p-2 rounded text-center hover:bg-gray-50"
                            >
                                Admin panel
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="border border-red-500 text-red-500 p-2 rounded hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}