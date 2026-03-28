import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            const success = await login(email, password)

            if (success) {
                navigate("/")
            } else {
                setError("Invalid email or password")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-60"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 text-sm flex flex-col gap-2 text-center">
                    <Link
                        to="/identity/forgot-password"
                        className="text-blue-600 hover:underline"
                    >
                        Forgot password?
                    </Link>

                    <Link
                        to="/identity/register"
                        className="text-blue-600 hover:underline"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    )
}