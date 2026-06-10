import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation } from "react-router-dom"
import { apiFetch } from "../../services/api"

type CalendarEvent = {
    id: number
    title: string
    description?: string | null
    location?: string | null
    clientName?: string | null
    clientPhone?: string | null
    assignedTo?: string | null
    eventType?: string | null
    color?: string | null
    startAtUtc: string
    endAtUtc: string
}

const monthNames = [
    "Януари",
    "Февруари",
    "Март",
    "Април",
    "Май",
    "Юни",
    "Юли",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
]

const weekdayNames = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]

function getMonthGrid(viewDate: Date) {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const startDate = new Date(year, month, 1 - startOffset)

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        return date
    })
}

function isSameDay(first: Date, second: Date) {
    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    )
}

function toTimeInputValue(date: Date) {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
}

function getEventTypeLabel(type?: string | null) {
    return type === "Print" ? "Принт на снимки" : "Фотосесия"
}

function getHoverDetails(event: CalendarEvent) {
    const details = [
        event.title,
        `Тип: ${getEventTypeLabel(event.eventType)}`,
        `Начало: ${new Date(event.startAtUtc).toLocaleString("bg-BG")}`,
        `Край: ${new Date(event.endAtUtc).toLocaleString("bg-BG")}`,
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.location ? `Локация: ${event.location}` : "",
        event.description ? `Бележки: ${event.description}` : "",
    ]

    return details.filter(Boolean).join("\n")
}

export default function AdminDashboardCalendarPreview() {
    const location = useLocation()
    const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [viewDate, setViewDate] = useState(() => new Date())
    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])

    useEffect(() => {
        if (location.pathname !== "/admin") return

        const mount = () => {
            const albumsSection = document.querySelector("#albums")
            if (!albumsSection || !albumsSection.parentElement) return false

            const existingRoot = document.getElementById("admin-dashboard-calendar-preview-root") as HTMLDivElement | null
            const root = existingRoot || document.createElement("div")
            root.id = "admin-dashboard-calendar-preview-root"

            if (!existingRoot) {
                albumsSection.parentElement.insertBefore(root, albumsSection)
            }

            const heading = albumsSection.parentElement.querySelector("h1")
            const subtitle = heading?.nextElementSibling as HTMLElement | null
            if (subtitle?.tagName === "P") {
                subtitle.style.display = "none"
            }

            setPortalRoot(root)
            return true
        }

        if (mount()) return

        const timeoutId = window.setTimeout(mount, 100)
        return () => window.clearTimeout(timeoutId)
    }, [location.pathname])

    useEffect(() => {
        if (location.pathname !== "/admin") return

        const loadEvents = async () => {
            try {
                const response = await apiFetch("/admin/shooting-calendar", {
                    method: "GET",
                    skipJsonContentType: true,
                })

                if (!response.ok) return

                const data = await response.json().catch(() => [])
                setEvents(Array.isArray(data) ? data : [])
            } catch {
                setEvents([])
            }
        }

        void loadEvents()
    }, [location.pathname])

    if (location.pathname !== "/admin" || !portalRoot) return null

    const changeMonth = (offset: number) => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
    }

    return createPortal(
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Назад
                    </button>

                    <h2 className="min-w-[170px] text-center text-xl font-bold text-gray-900 dark:text-white">
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </h2>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Напред
                    </button>
                </div>

                <Link
                    to="/admin/calendar"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    Отвори календара
                </Link>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                {weekdayNames.map((name) => (
                    <div key={name} className="py-2">
                        {name}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {monthGrid.map((date) => {
                    const dayEvents = events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth()

                    return (
                        <div
                            key={date.toISOString()}
                            className={`min-h-[88px] rounded-2xl border border-gray-200 bg-white p-2 text-left dark:border-zinc-800 dark:bg-zinc-950 ${
                                !isCurrentMonth ? "opacity-45" : ""
                            }`}
                        >
                            <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                                {date.getDate()}
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                    <div
                                        key={event.id}
                                        className="truncate rounded-lg px-2 py-1 text-[11px] font-semibold text-white"
                                        style={{ backgroundColor: event.color || "#2563eb" }}
                                        title={getHoverDetails(event)}
                                    >
                                        {toTimeInputValue(new Date(event.startAtUtc))} {event.title}
                                    </div>
                                ))}

                                {dayEvents.length > 2 ? (
                                    <div className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                                        +{dayEvents.length - 2} още
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>,
        portalRoot
    )
}
