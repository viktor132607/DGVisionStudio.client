import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch } from "../../services/api"

export default function ChangePassword() {
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.")
            return
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                }),
            })

            const data = await res.json().catch(() => null)

            if (!res.ok) {
                setError(data?.message || data?.error || "Password change failed.")
                return
            }

            setSuccess(data?.message || "Password changed successfully.")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")

            setTimeout(() => {
                navigate("/identity/profile")
            }, 1200)
        } catch {
            setError("Password change failed.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Change password</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update your account password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Current password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            New password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Saving..." : "Change password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/identity/profile"
                        className="text-sm text-gray-600 transition hover:text-black"
                    >
                        Back to profile
                    </Link>
                </div>
            </div>
        </div>
    )
}