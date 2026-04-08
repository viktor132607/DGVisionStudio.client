import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import PasswordRequirements from "../../components/PasswordRequirements"
import { apiFetch } from "../../services/api"
import {
    parseApiErrorResponse,
    passwordMeetsIdentityRules,
} from "../../utils/identity"

export default function ChangePassword() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [success, setSuccess] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const t = isBg
        ? {
              title: "Смяна на парола",
              description: "Обнови паролата на акаунта си.",
              currentPassword: "Текуща парола",
              newPassword: "Нова парола",
              confirmPassword: "Потвърди нова парола",
              allFieldsRequired: "Всички полета са задължителни.",
              passwordsDoNotMatch: "Паролите не съвпадат.",
              passwordRulesError: "Новата парола не покрива изискванията.",
              save: "Запази",
              saving: "Запазване...",
              success: "Паролата е сменена успешно.",
              failed: "Смяната на паролата беше неуспешна.",
              backToProfile: "Назад към профил",
          }
        : {
              title: "Change password",
              description: "Update your account password.",
              currentPassword: "Current password",
              newPassword: "New password",
              confirmPassword: "Confirm new password",
              allFieldsRequired: "All fields are required.",
              passwordsDoNotMatch: "Passwords do not match.",
              passwordRulesError: "New password does not meet the requirements.",
              save: "Save",
              saving: "Saving...",
              success: "Password changed successfully.",
              failed: "Password change failed.",
              backToProfile: "Back to profile",
          }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-0 focus:outline-none dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-100 dark:focus:ring-0 dark:focus:outline-none"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors([])
        setSuccess("")

        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrors([t.allFieldsRequired])
            return
        }

        if (newPassword !== confirmPassword) {
            setErrors([t.passwordsDoNotMatch])
            return
        }

        if (!passwordMeetsIdentityRules(newPassword)) {
            setErrors([t.passwordRulesError])
            return
        }

        setIsSubmitting(true)

        try {
            const res = await apiFetch("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            })

            if (!res.ok) {
                const { errors: backendErrors } = await parseApiErrorResponse(res)
                setErrors(backendErrors)
                return
            }

            const data = await res.json().catch(() => null)

            setSuccess(data?.message || t.success)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")

            setTimeout(() => {
                navigate("/identity/profile")
            }, 1200)
        } catch {
            setErrors([t.failed])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                        {t.currentPassword}
                    </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value)
                            if (errors.length) setErrors([])
                            if (success) setSuccess("")
                        }}
                        className={inputClassName}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-[14px] font-semibold text-neutral-800 dark:text-zinc-100">
                        {t.newPassword}
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                            if (errors.length) setErrors([])
                            if (success) setSuccess("")
                        }}
                        className={inputClassName}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <PasswordRequirements password={newPassword} />

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

                <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                    {success ? <p>{success}</p> : null}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {isSubmitting ? t.saving : t.save}
                </button>
            </form>

            <div className="mt-7 text-center text-[14px]">
                <Link
                    to="/identity/profile"
                    className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t.backToProfile}
                </Link>
            </div>
        </IdentityLayout>
    )
}