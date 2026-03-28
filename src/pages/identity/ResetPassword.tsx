import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { apiFetch } from "../../services/api"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const email = searchParams.get("email") ?? ""
    const token = searchParams.get("token") ?? ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !token) {
            setError("Invalid reset link")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    token,
                    password,
                    confirmPassword
                })
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => navigate("/identity/login"), 2000)
            } else {
                const data = await res.json().catch(() => null)
                setError(data?.message || data?.error || "Reset failed")
            }
        } catch {
            setError("Reset failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Reset password
                </h1>

                {!success ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm mb-1">New password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Confirm password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isSubmitting ? "Resetting..." : "Reset password"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-gray-700">
                        Password reset successful. Redirecting to login...
                    </div>
                )}

                <div className="mt-6 text-sm text-center">
                    <Link
                        to="/identity/login"
                        className="text-blue-600 hover:underline"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}