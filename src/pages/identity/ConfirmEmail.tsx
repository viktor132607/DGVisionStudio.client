import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiFetch } from "../../services/api"

type ConfirmStatus = "loading" | "success" | "error"

export default function ConfirmEmail() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<ConfirmStatus>("loading")
    const [message, setMessage] = useState("")

    const email = searchParams.get("email") ?? ""
    const token = searchParams.get("token") ?? ""

    useEffect(() => {
        const run = async () => {
            if (!email || !token) {
                setStatus("error")
                setMessage("Invalid confirmation link.")
                return
            }

            try {
                const res = await apiFetch(
                    `/auth/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
                    {
                        method: "GET",
                        skipJsonContentType: true,
                    }
                )

                const data = await res.json().catch(() => null)

                if (!res.ok) {
                    setStatus("error")
                    setMessage(data?.message || data?.error || "Email confirmation failed.")
                    return
                }

                setStatus("success")
                setMessage(data?.message || "Your email was confirmed successfully.")
            } catch {
                setStatus("error")
                setMessage("Email confirmation failed.")
            }
        }

        void run()
    }, [email, token])

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                {status === "loading" && (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Confirming email</h1>
                        <p className="mt-3 text-sm text-gray-600">
                            Please wait while we verify your account.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Email confirmed</h1>
                        <p className="mt-3 text-sm text-gray-600">{message}</p>

                        <div className="mt-6">
                            <Link
                                to="/identity/login"
                                className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Go to login
                            </Link>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Confirmation failed</h1>
                        <p className="mt-3 text-sm text-gray-600">{message}</p>

                        <div className="mt-6 flex justify-center gap-3">
                            <Link
                                to="/identity/register"
                                className="inline-flex rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
                            >
                                Register again
                            </Link>

                            <Link
                                to="/identity/login"
                                className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}