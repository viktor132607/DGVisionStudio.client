import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import { deleteMyAccount } from "../../services/account"
import { useAuth } from "../../context/AuthContext"

export default function DeleteAccount() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Изтриване на акаунт",
              description: "Това действие е необратимо.",
              password: "Парола",
              submit: "Изтрий акаунт",
              submitting: "Изтриване...",
              back: "Назад към профила",
              success: "Акаунтът беше изтрит успешно.",
          }
        : {
              title: "Delete account",
              description: "This action is irreversible.",
              password: "Password",
              submit: "Delete account",
              submitting: "Deleting...",
              back: "Back to profile",
              success: "Account deleted successfully.",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsSubmitting(true)

        try {
            const result = await deleteMyAccount(password)
            setSuccess(result.message || t.success)
            await logout()
            setTimeout(() => navigate("/"), 1000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            <form onSubmit={handleDelete} className="space-y-5">
                <div>
                    <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                        {t.password}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            if (error) setError("")
                        }}
                        className={inputClassName}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div className="min-h-[20px] text-[13px] leading-5 text-red-600 dark:text-red-400">
                    {error ? <p>{error}</p> : null}
                </div>

                <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                    {success ? <p>{success}</p> : null}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full border border-red-600 bg-red-600 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                    {isSubmitting ? t.submitting : t.submit}
                </button>
            </form>

            <div className="mt-7 text-center text-[14px]">
                <Link
                    to="/identity/profile"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.back}
                </Link>
            </div>
        </IdentityLayout>
    )
}