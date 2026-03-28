import { Link } from "react-router-dom"

export default function AccessDenied() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow text-center">

                <h1 className="text-2xl font-bold mb-4">
                    Access Denied
                </h1>

                <p className="text-gray-600 mb-6">
                    You do not have permission to access this page.
                </p>

                <Link
                    to="/"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Go to home
                </Link>

            </div>
        </div>
    )
}