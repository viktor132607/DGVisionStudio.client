import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch } from "../../services/api"

type ErrorResponse = {
    errors?: string[]
    message?: string
    error?: string
} & Record<string, unknown>

export default function Register() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [success, setSuccess] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setSuccess("")

        if (password !== confirmPassword) {
            setErrors(["Passwords do not match"])
            return
        }

        try {
            const res = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, confirmPassword }),
            })

            const text = await res.text()
            let data: ErrorResponse | null = null

            try {
                data = text ? (JSON.parse(text) as ErrorResponse) : null
            } catch {
                data = null
            }

            if (!res.ok) {
                const modelStateErrors =
                    data && typeof data === "object"
                        ? Object.values(data)
                            .flat()
                            .filter((x): x is string => typeof x === "string")
                        : []

                const backendErrors =
                    Array.isArray(data?.errors) && data.errors.length > 0
                        ? data.errors
                        : modelStateErrors.length > 0
                            ? modelStateErrors
                            : data?.message
                                ? [data.message]
                                : data?.error
                                    ? [data.error]
                                    : text
                                        ? [text]
                                        : ["Registration failed"]

                setErrors(backendErrors)
                return
            }

            setSuccess(data?.message || "Registration successful. Check your email to confirm your account.")
            setTimeout(() => navigate("/identity/login"), 1500)
        } catch {
            setErrors(["Registration failed"])
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Create account
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

                    {errors.length > 0 && (
                        <div className="text-red-500 text-sm">
                            <ul className="list-disc pl-5 space-y-1">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {success && (
                        <div className="text-green-600 text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-black text-white p-2 rounded hover:bg-gray-800"
                    >
                        Register
                    </button>
                </form>

                <div className="mt-6 text-sm text-center">
                    <Link
                        to="/identity/login"
                        className="text-blue-600 hover:underline"
                    >
                        Already have an account?
                    </Link>
                </div>
            </div>
        </div>
    )
}