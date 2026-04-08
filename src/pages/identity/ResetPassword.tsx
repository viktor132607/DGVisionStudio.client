import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import PasswordRequirements from "../../components/PasswordRequirements"
import { apiFetch } from "../../services/api"
import {
    parseApiErrorResponse,
    passwordMeetsIdentityRules,
} from "../../utils/identity"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const email = searchParams.get("email") ?? ""
    const token = searchParams.get("token") ?? ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [successMessage, setSuccessMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Нова парола",
              description: "Задай нова парола за акаунта си.",
              password: "Нова парола",
              confirmPassword: "Потвърди парола",
              passwordsDoNotMatch: "Паролите не съвпадат.",
              passwordRulesError: "Паролата не покрива изискванията.",
              invalidLink: "Невалиден линк за смяна на паролата.",
              reset: "Смени паролата",
              resetting: "Смяна...",
              success: "Паролата е сменена успешно. Пренасочване към вход...",
              fallbackError: "Смяната на паролата беше неуспешна.",
              backToLogin: "Назад към вход",
          }
        : {
              title: "Reset password",
              description: "Set a new password for your account.",
              password: "New password",
              confirmPassword: "Confirm password",
              passwordsDoNotMatch: "Passwords do not match.",
              passwordRulesError: "Password does not meet the requirements.",
              invalidLink: "Invalid reset link.",
              reset: "Reset password",
              resetting: "Resetting...",
              success: "Password reset successful. Redirecting to login...",
              fallbackError: "Reset failed.",
              backToLogin: "Back to login",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setSuccessMessage("")

        if (!email || !token) {
            setErrors([t.invalidLink])
            return
        }

        if (password !== confirmPassword) {
            setErrors([t.passwordsDoNotMatch])
            return
        }

        if (!passwordMeetsIdentityRules(password)) {
            setErrors([t.passwordRulesError])
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
                    confirmPassword,
                }),
            })

            if (!res.ok) {
                const { errors: backendErrors } = await parseApiErrorResponse(res)
                setErrors(backendErrors)
                return
            }

            const data = await res.json().catch(() => null)
            setSuccessMessage(data?.message || t.success)

            setTimeout(() => navigate("/identity/login"), 2000)
        } catch {
            setErrors([t.fallbackError])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            {!successMessage ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                            {t.password}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.length) setErrors([])
                            }}
                            className={inputClassName}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <PasswordRequirements password={password} />

                    <div>
                        <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                            {t.confirmPassword}
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                if (errors.length) setErrors([])
                            }}
                            className={inputClassName}
                            autoComplete="new-password"
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
                        {isSubmitting ? t.resetting : t.reset}
                    </button>
                </form>
            ) : (
                <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                    <p>{successMessage}</p>
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