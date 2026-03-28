import { useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../services/api"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email })
            })

            if (!res.ok) {
                setError("Something went wrong.")
                return
            }

            setSubmitted(true)
        } catch {
            setError("Something went wrong.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Forgot password
                </h1>

                {!submitted ? (
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
                            {isSubmitting ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-sm text-center text-gray-700">
                        If an account with that email exists, a reset link has been sent.
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