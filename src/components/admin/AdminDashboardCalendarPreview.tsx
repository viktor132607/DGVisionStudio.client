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

const API_PATH = "/admin/calendar"

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

function toDateInputValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

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

function isPastDate(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkedDate = new Date(date)
    checkedDate.setHours(0, 0, 0, 0)

    return checkedDate < today
}

function isPastEvent(event: CalendarEvent) {
    return new Date(event.endAtUtc).getTime() < Date.now()
}

function toTimeInputValue(date: Date) {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function getEventTypeLabel(type?: string | null) {
    return type === "Print" ? "Принт на снимки" : "Фотосесия"
}

function getHoverDetails(event: CalendarEvent) {
    const details = [
        event.title,
        isPastEvent(event) ? "Статус: Минало" : "Статус: Предстоящо",
        `Тип: ${getEventTypeLabel(event.eventType)}`,
        `Начало: ${formatDateTime(event.startAtUtc)}`,
        `Край: ${formatDateTime(event.endAtUtc)}`,
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.location ? `Локация: ${event.location}` : "",
        event.description ? `Бележки: ${event.description}` : "",
    ]

    return details.filter(Boolean).join("\n")
}

function EventTooltip({ event }: { event: CalendarEvent }) {
    return (
        <div className="pointer-events-none absolute left-0 top-full z-40 mt-2 hidden w-72 rounded-2xl border border-gray-200 bg-white p-3 text-left text-xs font-medium text-gray-700 shadow-xl group-hover/event:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{event.title}</div>
            <div className="space-y-1">
                <div>{getEventTypeLabel(event.eventType)}</div>
                <div>{formatDateTime(event.startAtUtc)} — {formatDateTime(event.endAtUtc)}</div>
                {event.assignedTo ? <div>Ангажимент към: {event.assignedTo}</div> : null}
                {event.clientName ? <div>Клиент: {event.clientName}</div> : null}
                {event.clientPhone ? <div>Телефон: {event.clientPhone}</div> : null}
                {event.location ? <div>Локация: {event.location}</div> : null}
                {event.description ? <div className="border-t border-gray-100 pt-2 dark:border-zinc-800">{event.description}</div> : null}
            </div>
        </div>
    )
}

export default function AdminDashboardCalendarPreview() {
    const location = useLocation()
    const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [viewDate, setViewDate] = useState(() => new Date())
    const [selectedDate, setSelectedDate] = useState(() => new Date())
    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
    const selectedDateEvents = useMemo(() => events.filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate)).sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()), [events, selectedDate])
    const selectedDateLabel = selectedDate.toLocaleDateString("bg-BG", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })

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
                const response = await apiFetch(API_PATH, {
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

    const addEventUrl = `/admin/calendar?date=${toDateInputValue(selectedDate)}`

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

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to={addEventUrl}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                        + Добави събитие
                    </Link>
                    <Link
                        to="/admin/calendar"
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        Отвори календара
                    </Link>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide">Избран ден</p>
                        <h3 className="text-lg font-bold">{selectedDateLabel}</h3>
                        <p className="mt-1">{selectedDateEvents.length ? `${selectedDateEvents.length} събития` : "Няма събития"}</p>
                    </div>
                    <Link to={addEventUrl} className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-bold text-white">
                        + Добави събитие
                    </Link>
                </div>
                {selectedDateEvents.length ? (
                    <div className="mt-3 grid gap-2 lg:grid-cols-2">
                        {selectedDateEvents.slice(0, 4).map((event) => (
                            <div key={event.id} className="rounded-xl bg-white/80 p-3 text-xs text-gray-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200" title={getHoverDetails(event)}>
                                <div className="font-bold text-gray-900 dark:text-white">{toTimeInputValue(new Date(event.startAtUtc))} {event.title}</div>
                                {event.assignedTo ? <div>Ангажимент към: {event.assignedTo}</div> : null}
                            </div>
                        ))}
                    </div>
                ) : null}
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
                    const isPast = isPastDate(date)
                    const isSelected = isSameDay(date, selectedDate)

                    return (
                        <div
                            key={date.toISOString()}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedDate(date)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedDate(date) }}
                            className={`group/day min-h-[98px] cursor-pointer rounded-2xl border p-2 text-left transition hover:border-sky-400 hover:bg-sky-50 dark:border-zinc-800 ${
                                isSelected
                                    ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100 dark:bg-sky-950/40"
                                    : isPast
                                        ? "border-gray-200 bg-gray-100 text-gray-400 dark:bg-zinc-950/70"
                                        : "border-gray-200 bg-white dark:bg-zinc-950"
                            } ${!isCurrentMonth ? "opacity-45" : ""}`}
                            title={dayEvents.length ? `${dayEvents.length} събития` : "Няма събития"}
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className={`text-sm font-bold ${isPast ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                    {date.getDate()}
                                </div>
                                <Link
                                    to={`/admin/calendar?date=${toDateInputValue(date)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`${isSelected ? "inline-flex" : "hidden group-hover/day:inline-flex"} rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white`}
                                >
                                    + Добави
                                </Link>
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => {
                                    const eventIsPast = isPastEvent(event)

                                    return (
                                        <div
                                            key={event.id}
                                            className={`group/event relative truncate rounded-lg px-2 py-1 text-[11px] font-semibold ${eventIsPast ? "bg-gray-400 text-white opacity-70" : "text-white"}`}
                                            style={eventIsPast ? undefined : { backgroundColor: event.color || "#2563eb" }}
                                            title={getHoverDetails(event)}
                                        >
                                            {toTimeInputValue(new Date(event.startAtUtc))} {event.title}
                                            <EventTooltip event={event} />
                                        </div>
                                    )
                                })}

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
