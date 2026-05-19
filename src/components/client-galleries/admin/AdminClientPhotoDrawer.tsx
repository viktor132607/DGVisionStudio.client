import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type {
    AdminGalleryUserOptionDto,
    AdminUpdateClientPhotoRequest,
    ClientPhotoDto,
} from "../../../types/clientGallery"

type AdminClientPhotoDrawerProps = {
    open: boolean
    photo: ClientPhotoDto | null
    galleryTitle: string
    coverImageUrl?: string | null
    users: AdminGalleryUserOptionDto[]
    saving?: boolean
    deleting?: boolean
    settingCover?: boolean
    onClose: () => void
    onSave: (payload: AdminUpdateClientPhotoRequest) => Promise<void>
    onDelete: () => Promise<void>
    onSetCover: () => Promise<void>
}

function normalizeImageUrl(value?: string | null) {
    if (!value) return ""

    const trimmed = value.trim().replaceAll("\\", "/")

    try {
        const url = new URL(trimmed)
        return url.pathname.replace(/^\/+/, "")
    } catch {
        return trimmed.replace(/^\/+/, "")
    }
}

export default function AdminClientPhotoDrawer({
    open,
    photo,
    galleryTitle,
    coverImageUrl,
    users,
    saving = false,
    deleting = false,
    settingCover = false,
    onClose,
    onSave,
    onDelete,
    onSetCover,
}: AdminClientPhotoDrawerProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [description, setDescription] = useState("")
    const [isPublished, setIsPublished] = useState(true)
    const [showInPublicGallery, setShowInPublicGallery] = useState(false)
    const [visibleToAllAuthorizedUsers, setVisibleToAllAuthorizedUsers] = useState(true)
    const [allowedUserIds, setAllowedUserIds] = useState<string[]>([])

    useEffect(() => {
        if (!photo) return
        setDescription(photo.description || "")
        setIsPublished(photo.isPublished)
        setShowInPublicGallery(photo.showInPublicGallery)
        setVisibleToAllAuthorizedUsers(photo.visibleToAllAuthorizedUsers)
        setAllowedUserIds(photo.allowedUserIds || [])
    }, [photo])

    const selectedUserEmails = useMemo(() => {
        const map = new Map(users.map((user) => [user.id, user.email]))
        return allowedUserIds.map((id) => map.get(id)).filter(Boolean) as string[]
    }, [allowedUserIds, users])

    const t = isBg
        ? {
              title: "Снимка",
              description: "Описание",
              album: "Албум",
              visibleUsers: "Видима за потребители",
              allUsers: "Всички потребители с достъп",
              onlySelected: "Само избрани потребители",
              published: "Активна снимка",
              publicAlbum: "Показвай в публичните албуми",
              setCover: "Направи cover",
              save: "Запази",
              delete: "Изтрий",
              close: "Затвори",
              saving: "Запазване...",
              deleting: "Изтриване...",
              settingCover: "Запазване...",
          }
        : {
              title: "Photo",
              description: "Description",
              album: "Album",
              visibleUsers: "Visible to users",
              allUsers: "All users with access",
              onlySelected: "Only selected users",
              published: "Published photo",
              publicAlbum: "Show in public albums",
              setCover: "Set as cover",
              save: "Save",
              delete: "Delete",
              close: "Close",
              saving: "Saving...",
              deleting: "Deleting...",
              settingCover: "Saving...",
          }

    if (!open || !photo) return null

    const normalizedCoverImageUrl = normalizeImageUrl(coverImageUrl)
    const normalizedPreviewUrl = normalizeImageUrl(photo.previewUrl)
    const normalizedOriginalUrl = normalizeImageUrl(photo.originalUrl)

    const isCurrentCover =
        normalizedCoverImageUrl === normalizedPreviewUrl ||
        normalizedCoverImageUrl === normalizedOriginalUrl

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
            <div className="flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-white shadow-2xl dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-zinc-800">
                    <h3 className="text-[18px] font-semibold text-neutral-950 dark:text-white">
                        {t.title}
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-neutral-300 px-4 py-2 text-[13px] font-semibold text-neutral-900 dark:border-zinc-700 dark:text-white"
                    >
                        {t.close}
                    </button>
                </div>

                <div className="p-5">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-zinc-800">
                        <img
                            src={photo.previewUrl}
                            alt=""
                            className="h-auto w-full object-cover"
                        />
                    </div>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label className="mb-2 block text-[13px] font-semibold text-neutral-700 dark:text-zinc-300">
                                {t.description}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[14px] text-neutral-950 outline-none focus:border-neutral-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-400">
                                {t.album}
                            </div>
                            <div className="mt-2 text-[14px] font-medium text-neutral-950 dark:text-white">
                                {galleryTitle}
                            </div>
                            {selectedUserEmails.length > 0 ? (
                                <div className="mt-3 text-[13px] text-neutral-600 dark:text-zinc-400">
                                    {selectedUserEmails.join(", ")}
                                </div>
                            ) : null}
                        </div>

                        <label className="flex items-center gap-3 text-[14px] text-neutral-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4"
                            />
                            {t.published}
                        </label>

                        <label className="flex items-center gap-3 text-[14px] text-neutral-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={showInPublicGallery}
                                onChange={(e) => setShowInPublicGallery(e.target.checked)}
                                className="h-4 w-4"
                            />
                            {t.publicAlbum}
                        </label>

                        <div className="space-y-3">
                            <div className="text-[13px] font-semibold text-neutral-700 dark:text-zinc-300">
                                {t.visibleUsers}
                            </div>

                            <label className="flex items-center gap-3 text-[14px] text-neutral-900 dark:text-white">
                                <input
                                    type="radio"
                                    checked={visibleToAllAuthorizedUsers}
                                    onChange={() => setVisibleToAllAuthorizedUsers(true)}
                                    className="h-4 w-4"
                                />
                                {t.allUsers}
                            </label>

                            <label className="flex items-center gap-3 text-[14px] text-neutral-900 dark:text-white">
                                <input
                                    type="radio"
                                    checked={!visibleToAllAuthorizedUsers}
                                    onChange={() => setVisibleToAllAuthorizedUsers(false)}
                                    className="h-4 w-4"
                                />
                                {t.onlySelected}
                            </label>

                            {!visibleToAllAuthorizedUsers ? (
                                <div className="grid gap-2 rounded-2xl border border-neutral-200 p-3 dark:border-zinc-800">
                                    {users.map((user) => {
                                        const checked = allowedUserIds.includes(user.id)

                                        return (
                                            <label
                                                key={user.id}
                                                className="flex items-center gap-3 text-[14px] text-neutral-900 dark:text-white"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setAllowedUserIds((current) => [...current, user.id])
                                                        } else {
                                                            setAllowedUserIds((current) =>
                                                                current.filter((x) => x !== user.id)
                                                            )
                                                        }
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                                {user.email}
                                            </label>
                                        )
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => void onSetCover()}
                                disabled={isCurrentCover || settingCover}
                                className="rounded-full border border-neutral-300 px-4 py-3 text-[13px] font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-white"
                            >
                                {settingCover ? t.settingCover : t.setCover}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void onSave({
                                        description: description.trim() || null,
                                        isPublished,
                                        showInPublicGallery,
                                        visibleToAllAuthorizedUsers,
                                        allowedUserIds: visibleToAllAuthorizedUsers ? [] : allowedUserIds,
                                    })
                                }
                                disabled={saving}
                                className="rounded-full border border-neutral-950 bg-neutral-950 px-4 py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black"
                            >
                                {saving ? t.saving : t.save}
                            </button>

                            <button
                                type="button"
                                onClick={() => void onDelete()}
                                disabled={deleting}
                                className="rounded-full border border-red-300 px-4 py-3 text-[13px] font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:text-red-400"
                            >
                                {deleting ? t.deleting : t.delete}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}