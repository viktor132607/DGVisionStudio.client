import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import { useAuth } from "../../context/AuthContext"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const { i18n } = useTranslation()

    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Вход",
              email: "Имейл",
              password: "Парола",
              login: "Вписване",
              loggingIn: "Вписване...",
              forgotPassword: "Забравена парола?",
              createAccount: "Създай акаунт",
              invalidCredentials: "Невалиден имейл или парола.",
              emailRequired: "Имейлът е задължителен.",
              passwordRequired: "Паролата е задължителна.",
              emailAndPasswordRequired: "Имейлът и паролата са задължителни.",
              accountBlocked: "Този акаунт е блокиран.",
              loginFailed: "Входът беше неуспешен.",
              somethingWentWrong: "Нещо се обърка.",
          }
        : {
              title: "Login",
              email: "Email",
              password: "Password",
              login: "Login",
              loggingIn: "Logging in...",
              forgotPassword: "Forgot password?",
              createAccount: "Create account",
              invalidCredentials: "Invalid email or password.",
              emailRequired: "Email is required.",
              passwordRequired: "Password is required.",
              emailAndPasswordRequired: "Email and password are required.",
              accountBlocked: "This account is blocked.",
              loginFailed: "Login failed.",
              somethingWentWrong: "Something went wrong.",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const mapError = (error: string) => {
        const normalized = error.trim().toLowerCase()

        if (normalized === "invalid email or password.") return t.invalidCredentials
        if (normalized === "your account is blocked.") return t.accountBlocked
        if (normalized === "email and password are required.") return t.emailAndPasswordRequired
        if (normalized === "email is required.") return t.emailRequired
        if (normalized === "password is required.") return t.passwordRequired
        if (normalized === "login failed.") return t.loginFailed
        if (normalized === "something went wrong.") return t.somethingWentWrong

        return error
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setIsSubmitting(true)

        try {
            const result = await login(email, password)

            if (result.success) {
                navigate("/")
                return
            }

            setErrors(result.errors.length ? result.errors.map(mapError) : [t.invalidCredentials])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title}>
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
                        autoComplete="current-password"
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
                    {isSubmitting ? t.loggingIn : t.login}
                </button>
            </form>

            <div className="mt-7 flex flex-col gap-3 text-center text-[14px]">
                <Link
                    to="/identity/forgot-password"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.forgotPassword}
                </Link>

                <Link
                    to="/identity/register"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.createAccount}
                </Link>
            </div>
        </IdentityLayout>
    )
}