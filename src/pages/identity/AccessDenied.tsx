import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"

export default function AccessDenied() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const t = isBg
        ? {
              title: "Достъпът е отказан",
              description: "Нямаш права за достъп до тази страница.",
              message: "Твоят акаунт няма нужните разрешения.",
              home: "Към началото",
          }
        : {
              title: "Access denied",
              description: "You do not have permission to access this page.",
              message: "Your account does not have the required permissions.",
              home: "Go to home",
          }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            <div className="space-y-5 text-center">
                <p className="text-[15px] leading-7 text-neutral-600 dark:text-zinc-300">
                    {t.message}
                </p>

                <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-zinc-200 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                >
                    {t.home}
                </Link>
            </div>
        </IdentityLayout>
    )
}