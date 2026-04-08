import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"

export default function ConfirmEmail() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const t = isBg
        ? {
              title: "Потвърждение на имейл",
              disabledMessage: "Потвърждението на имейл е временно изключено.",
              goLogin: "Към вход",
              registerAgain: "Нова регистрация",
          }
        : {
              title: "Email confirmation",
              disabledMessage: "Email confirmation is temporarily disabled.",
              goLogin: "Go to login",
              registerAgain: "Register again",
          }

    return (
        <IdentityLayout title={t.title}>
            <div className="space-y-6 text-center">
                <div className="min-h-[20px] text-[13px] leading-5 text-neutral-600 dark:text-zinc-300">
                    <p>{t.disabledMessage}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/identity/register"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-300 bg-transparent px-5 py-3 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-white/20 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                    >
                        {t.registerAgain}
                    </Link>

                    <Link
                        to="/identity/login"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {t.goLogin}
                    </Link>
                </div>
            </div>
        </IdentityLayout>
    )
}