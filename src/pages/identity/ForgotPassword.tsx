import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import { apiFetch } from "../../services/api"
import { parseApiErrorResponse } from "../../utils/identity"

export default function ForgotPassword() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [email, setEmail] = useState("")
    const [submittedMessage, setSubmittedMessage] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Забравена парола",
              description: "Въведи имейла си и ако акаунтът съществува, ще бъде изпратен линк за смяна на паролата.",
              email: "Имейл",
              send: "Изпрати линк",
              sending: "Изпращане...",
              backToLogin: "Назад към вход",
              fallbackSuccess: "Ако съществува акаунт с този имейл, е изпратен линк за смяна на паролата.",
              genericError: "Нещо се обърка.",
          }
        : {
              title: "Forgot password",
              description: "Enter your email and if the account exists, a reset link will be sent.",
              email: "Email",
              send: "Send reset link",
              sending: "Sending...",
              backToLogin: "Back to login",
              fallbackSuccess: "If an account with that email exists, a reset link has been sent.",
              genericError: "Something went wrong.",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setSubmittedMessage("")
        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const { errors: backendErrors } = await parseApiErrorResponse(res)
                setErrors(backendErrors)
                return
            }

            const data = await res.json().catch(() => null)
            setSubmittedMessage(data?.message || t.fallbackSuccess)
        } catch {
            setErrors([t.genericError])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            {!submittedMessage ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                            {t.email}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errors.length) setErrors([])
                            }}
                            className={inputClassName}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="min-h-[20px] text-[13px] leading-5 text-red-600 dark:text-red-400">
                        {errors.length > 0 ? (
                            <ul className="space-y-1">
                                {errors.map((error, index) => (
                                    <li key={`${error}-${index}`}>{error}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {isSubmitting ? t.sending : t.send}
                    </button>
                </form>
            ) : (
                <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                    <p>{submittedMessage}</p>
                </div>
            )}

            <div className="mt-7 text-center text-[14px]">
                <Link
                    to="/identity/login"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.backToLogin}
                </Link>
            </div>
        </IdentityLayout>
    )
}