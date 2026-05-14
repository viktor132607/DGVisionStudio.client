import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import PasswordRequirements from "../../components/PasswordRequirements"
import { apiFetch } from "../../services/api"
import {
    parseApiErrorResponse,
    passwordMeetsIdentityRules,
} from "../../utils/identity"

export default function Register() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [success, setSuccess] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Създай акаунт",
              description: "Регистрирай нов акаунт.",
              email: "Имейл",
              password: "Парола",
              confirmPassword: "Потвърди парола",
              passwordsDoNotMatch: "Паролите не съвпадат.",
              passwordRulesError: "Паролата не покрива изискванията.",
              register: "Регистрация",
              registering: "Регистрация...",
              alreadyHaveAccount: "Вече имаш акаунт?",
              registrationFailed: "Регистрацията беше неуспешна.",
              successMessage: "Регистрацията е успешна.",
              invalidEmail: "Невалиден имейл адрес.",
          }
        : {
              title: "Create account",
              description: "Register a new account.",
              email: "Email",
              password: "Password",
              confirmPassword: "Confirm password",
              passwordsDoNotMatch: "Passwords do not match.",
              passwordRulesError: "Password does not meet the requirements.",
              register: "Register",
              registering: "Registering...",
              alreadyHaveAccount: "Already have an account?",
              registrationFailed: "Registration failed.",
              successMessage: "Registration successful.",
              invalidEmail: "Invalid email address.",
          }

    const passwordsMatch = useMemo(
        () => !confirmPassword || password === confirmPassword,
        [password, confirmPassword]
    )

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setSuccess("")

        if (password !== confirmPassword) {
            setErrors([t.passwordsDoNotMatch])
            return
        }

        if (!passwordMeetsIdentityRules(password)) {
            setErrors([t.passwordRulesError])
            return
        }

        if (!isValidEmail(email)) {
            setErrors([t.invalidEmail])
            return
        }

        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, confirmPassword }),
            })

            if (!res.ok) {
                const { errors: backendErrors } = await parseApiErrorResponse(res)
                setErrors(backendErrors.length ? backendErrors : [t.registrationFailed])
                return
            }

            const data = await res.json().catch(() => null)
            setSuccess(data?.message || t.successMessage)
            setTimeout(() => navigate("/identity/login"), 1500)
        } catch {
            setErrors([t.registrationFailed])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
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
                            if (success) setSuccess("")
                        }}
                        className={inputClassName}
                        autoComplete="email"
                        required
                    />
                </div>

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
                            if (success) setSuccess("")
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
                            if (success) setSuccess("")
                        }}
                        className={inputClassName}
                        autoComplete="new-password"
                        required
                    />
                    <div className="mt-2 min-h-[20px] text-[13px] leading-5 text-red-600 dark:text-red-400">
                        {!passwordsMatch ? <p>{t.passwordsDoNotMatch}</p> : null}
                    </div>
                </div>

                <div className="min-h-[20px] text-[13px] leading-5 text-red-600 dark:text-red-400">
                    {errors.length > 0 ? (
                        <ul className="space-y-1">
                            {errors.map((err, i) => (
                                <li key={`${err}-${i}`}>{err}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                    {success ? <p>{success}</p> : null}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {isSubmitting ? t.registering : t.register}
                </button>
            </form>

            <div className="mt-7 text-center text-[14px]">
                <Link
                    to="/identity/login"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.alreadyHaveAccount}
                </Link>
            </div>
        </IdentityLayout>
    )
}