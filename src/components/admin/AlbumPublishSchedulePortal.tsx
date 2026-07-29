import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
    getAdminAlbumPublishSchedule,
    updateAdminAlbumPublishSchedule,
} from "../../services/albumPublishSchedule"
import { useAdminToast } from "../../hooks/useAdminToast"

function toLocalDateTimeInput(value?: string | null) {
    if (!value) return ""

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return localDate.toISOString().slice(0, 16)
}

function toUtcIso(value: string) {
    if (!value) return null

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function defaultScheduleValue() {
    const date = new Date(Date.now() + 60 * 60 * 1000)
    date.setSeconds(0, 0)
    date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5)
    return toLocalDateTimeInput(date.toISOString())
}

export default function AlbumPublishSchedulePortal() {
    const location = useLocation()
    const { i18n } = useTranslation()
    const { showToast } = useAdminToast()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [host, setHost] = useState<HTMLElement | null>(null)
    const [enabled, setEnabled] = useState(false)
    const [publishAtLocal, setPublishAtLocal] = useState("")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const isGalleryEditor =
        location.pathname === "/admin/client-galleries/new" ||
        location.pathname === "/admin/client-galleries/edit"

    const galleryId = useMemo(() => {
        const value = new URLSearchParams(location.search).get("id")
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null
    }, [location.search])

    useEffect(() => {
        if (!isGalleryEditor) {
            setHost(null)
            return
        }

        let currentHost: HTMLElement | null = null

        const attach = () => {
            const form = document.querySelector<HTMLFormElement>("form")
            if (!form) return

            const existing = document.getElementById("dg-album-publish-schedule-host")
            if (existing) {
                currentHost = existing
                setHost(existing)
                return
            }

            const nextHost = document.createElement("div")
            nextHost.id = "dg-album-publish-schedule-host"

            const visibilitySection = form.querySelector("section")
            if (visibilitySection) {
                visibilitySection.insertAdjacentElement("afterend", nextHost)
            } else {
                form.prepend(nextHost)
            }

            currentHost = nextHost
            setHost(nextHost)
        }

        attach()
        const observer = new MutationObserver(attach)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => {
            observer.disconnect()
            currentHost?.remove()
            setHost(null)
        }
    }, [isGalleryEditor, location.pathname, location.search])

    useEffect(() => {
        if (!isGalleryEditor || !galleryId) {
            setEnabled(false)
            setPublishAtLocal("")
            return
        }

        let cancelled = false
        setLoading(true)

        void getAdminAlbumPublishSchedule(galleryId)
            .then((schedule) => {
                if (cancelled) return

                const value = toLocalDateTimeInput(schedule.publishAtUtc)
                setEnabled(Boolean(value))
                setPublishAtLocal(value)
            })
            .catch((error) => {
                if (cancelled) return
                showToast({
                    type: "error",
                    title: isBg ? "Грешка" : "Error",
                    message:
                        error instanceof Error
                            ? error.message
                            : isBg
                              ? "Неуспешно зареждане на отложеното публикуване."
                              : "Failed to load delayed publishing.",
                })
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [galleryId, isBg, isGalleryEditor, showToast])

    if (!isGalleryEditor || !host) return null

    const text = isBg
        ? {
              title: "Отложено публикуване",
              enabled: "Публикувай албума в определен ден и час",
              date: "Дата и час",
              hint: "Часът е според текущата ти часова зона. Албумът няма да се вижда публично преди него.",
              createHint: "Първо създай албума. След това тази настройка ще се активира автоматично в екрана за редакция.",
              clear: "Изчисти",
              save: "Запази графика",
              saving: "Запазване...",
              loading: "Зареждане...",
              saved: "Графикът за публикуване беше запазен.",
              invalidDate: "Избери валидна дата и час.",
          }
        : {
              title: "Delayed publishing",
              enabled: "Publish the album on a specific date and time",
              date: "Date and time",
              hint: "The time uses your current time zone. The album will remain hidden publicly until then.",
              createHint: "Create the album first. This setting will become available automatically on the edit screen.",
              clear: "Clear",
              save: "Save schedule",
              saving: "Saving...",
              loading: "Loading...",
              saved: "The publication schedule was saved.",
              invalidDate: "Choose a valid date and time.",
          }

    const handleSave = async () => {
        if (!galleryId) return

        const publishAtUtc = enabled ? toUtcIso(publishAtLocal) : null
        if (enabled && !publishAtUtc) {
            showToast({
                type: "error",
                title: isBg ? "Грешка" : "Error",
                message: text.invalidDate,
            })
            return
        }

        setSaving(true)

        try {
            const saved = await updateAdminAlbumPublishSchedule(galleryId, publishAtUtc)
            const value = toLocalDateTimeInput(saved.publishAtUtc)
            setEnabled(Boolean(value))
            setPublishAtLocal(value)

            showToast({
                type: "success",
                title: isBg ? "Готово" : "Done",
                message: text.saved,
            })
        } catch (error) {
            showToast({
                type: "error",
                title: isBg ? "Грешка" : "Error",
                message:
                    error instanceof Error
                        ? error.message
                        : isBg
                          ? "Неуспешно запазване на отложеното публикуване."
                          : "Failed to save delayed publishing.",
            })
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">{text.title}</h2>

            {!galleryId ? (
                <p className="mt-3 text-sm text-neutral-500 dark:text-zinc-400">{text.createHint}</p>
            ) : (
                <>
                    <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                        <input
                            type="checkbox"
                            checked={enabled}
                            disabled={loading || saving}
                            onChange={(event) => {
                                const nextEnabled = event.target.checked
                                setEnabled(nextEnabled)
                                if (nextEnabled && !publishAtLocal) {
                                    setPublishAtLocal(defaultScheduleValue())
                                }
                            }}
                            className="h-4 w-4 rounded border-neutral-300"
                        />
                        {text.enabled}
                    </label>

                    {enabled ? (
                        <div className="mt-5 max-w-xl">
                            <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                                {text.date}
                            </label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="datetime-local"
                                    value={publishAtLocal}
                                    disabled={loading || saving}
                                    onChange={(event) => setPublishAtLocal(event.target.value)}
                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition focus:border-neutral-400 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black"
                                />
                                <button
                                    type="button"
                                    disabled={loading || saving}
                                    onClick={() => {
                                        setEnabled(false)
                                        setPublishAtLocal("")
                                    }}
                                    className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                    {text.clear}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-zinc-400">{text.hint}</p>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        disabled={loading || saving}
                        onClick={() => void handleSave()}
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {saving ? text.saving : text.save}
                    </button>
                </>
            )}

            {loading ? (
                <p className="mt-3 text-sm text-neutral-500 dark:text-zinc-400">{text.loading}</p>
            ) : null}
        </section>,
        host
    )
}
