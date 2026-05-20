import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import { useAuth } from "../../context/AuthContext"
import { useMyClientGalleries } from "../../hooks/useMyClientGalleries"
import ProfileTabs, { type ProfileTabKey } from "../../components/profile/ProfileTabs"
import ProfileOverviewTab from "../../components/profile/ProfileOverviewTab"
import ProfileGalleriesTab from "../../components/profile/ProfileGalleriesTab"
import ProfileSecurityTab from "../../components/profile/ProfileSecurityTab"

export default function Profile() {
    const { user, isAdmin, logout } = useAuth()
    const { galleries, loading, error, reload } = useMyClientGalleries()
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [activeTab, setActiveTab] = useState<ProfileTabKey>("galleries")

    const t = isBg
        ? {
              title: "Профил",
              description: "Управлявай достъпа до споделените галерии, преглеждай съдържанието си и настрой сигурността на акаунта.",
              statsTitle: "Статус на акаунта",
              totalGalleries: "Общо галерии",
              downloadable: "С изтегляне",
              previewOnly: "Само преглед",
              expired: "Изтекли",
          }
        : {
              title: "Profile",
              description: "Manage your gallery access, review shared content, and control your account security.",
              statsTitle: "Account status",
              totalGalleries: "Total galleries",
              downloadable: "Download enabled",
              previewOnly: "Preview only",
              expired: "Expired",
          }

    const stats = useMemo(() => {
        const total = galleries.length
        const downloadable = galleries.filter((x) => x.downloadEnabled && !x.isExpired).length
        const previewOnly = galleries.filter((x) => x.previewEnabled && !x.downloadEnabled && !x.isExpired).length
        const expired = galleries.filter((x) => x.isExpired).length

        return { total, downloadable, previewOnly, expired }
    }, [galleries])

    const handleLogout = async () => {
        await logout()
        navigate("/identity/login")
    }

    return (
        <IdentityLayout title={t.title} description={t.description}>
            <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="h-fit rounded-[24px] border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <ProfileTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        isBg={isBg}
                        galleriesCount={stats.total}
                        isAdmin={isAdmin}
                    />
                </aside>

                <div className="min-w-0">
                    {activeTab === "overview" ? (
                        <ProfileOverviewTab
                            email={user?.email}
                            roles={user?.roles}
                            isBg={isBg}
                            extra={
                                <div className="rounded-[24px] border border-neutral-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-zinc-400">
                                        {t.statsTitle}
                                    </p>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                                            <p className="text-[13px] text-neutral-500 dark:text-zinc-400">
                                                {t.totalGalleries}
                                            </p>
                                            <p className="mt-2 text-[28px] font-semibold text-neutral-950 dark:text-white">
                                                {stats.total}
                                            </p>
                                        </div>

                                        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                            <p className="text-[13px] text-emerald-700 dark:text-emerald-300">
                                                {t.downloadable}
                                            </p>
                                            <p className="mt-2 text-[28px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                {stats.downloadable}
                                            </p>
                                        </div>

                                        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
                                            <p className="text-[13px] text-amber-700 dark:text-amber-300">
                                                {t.previewOnly}
                                            </p>
                                            <p className="mt-2 text-[28px] font-semibold text-amber-700 dark:text-amber-300">
                                                {stats.previewOnly}
                                            </p>
                                        </div>

                                        <div className="rounded-[22px] border border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10">
                                            <p className="text-[13px] text-red-700 dark:text-red-300">
                                                {t.expired}
                                            </p>
                                            <p className="mt-2 text-[28px] font-semibold text-red-700 dark:text-red-300">
                                                {stats.expired}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    ) : null}

                    {activeTab === "galleries" ? (
                        <ProfileGalleriesTab
                            galleries={galleries}
                            loading={loading}
                            error={error}
                            isBg={isBg}
                            userEmail={user?.email || ""}
                            onReload={reload}
                        />
                    ) : null}

                    {activeTab === "security" ? (
                        <ProfileSecurityTab
                            isBg={isBg}
                            onLogout={handleLogout}
                            isAdmin={isAdmin}
                        />
                    ) : null}
                </div>
            </div>
        </IdentityLayout>
    )
}