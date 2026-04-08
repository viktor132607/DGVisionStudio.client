import { Link } from "react-router-dom"

type ProfileSecurityTabProps = {
    isBg: boolean
    onLogout: () => void | Promise<void>
    isAdmin?: boolean
}

export default function ProfileSecurityTab({
    isBg,
    onLogout,
    isAdmin = false,
}: ProfileSecurityTabProps) {
    return (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                <h2 className="text-[20px] font-semibold text-neutral-950 dark:text-white">
                    {isBg ? "Сигурност и достъп" : "Security and access"}
                </h2>
                <p className="mt-2 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300">
                    {isBg
                        ? "Управлявай паролата си, отвори админ панела при нужда и прекрати текущата сесия."
                        : "Manage your password, open the admin panel when needed, and end your current session."}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Link
                    to="/identity/change-password"
                    className="rounded-[24px] border border-neutral-950 bg-neutral-950 p-5 text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    <div className="text-[18px] font-semibold">
                        {isBg ? "Смени парола" : "Change password"}
                    </div>
                    <div className="mt-2 text-[14px] leading-6 text-white/80 dark:text-black/70">
                        {isBg ? "Обнови паролата на акаунта си." : "Update your account password."}
                    </div>
                </Link>

                {isAdmin ? (
                    <Link
                        to="/admin"
                        className="rounded-[24px] border border-neutral-200 bg-white p-5 text-neutral-950 transition hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                    >
                        <div className="text-[18px] font-semibold">
                            {isBg ? "Админ панел" : "Admin panel"}
                        </div>
                        <div className="mt-2 text-[14px] leading-6 text-neutral-600 dark:text-zinc-300">
                            {isBg ? "Отвори административните функции." : "Open administrative functions."}
                        </div>
                    </Link>
                ) : null}

                <Link
                    to="/identity/delete-account"
                    className="rounded-[24px] border border-red-300 bg-white p-5 text-red-600 transition hover:bg-red-50 dark:border-red-500/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <div className="text-[18px] font-semibold">
                        {isBg ? "Изтрий акаунт" : "Delete account"}
                    </div>
                    <div className="mt-2 text-[14px] leading-6 text-red-500 dark:text-red-300">
                        {isBg ? "Премахни профила си окончателно." : "Permanently remove your profile."}
                    </div>
                </Link>
            </div>

            <div className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                    {isBg ? "Изход от акаунта" : "Logout"}
                </button>
            </div>
        </div>
    )
}