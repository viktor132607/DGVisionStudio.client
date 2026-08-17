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
const monthNames = ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"]
const desktopWeekdays = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]
const appleWeekdays = ["П", "В", "С", "Ч", "П", "С", "Н"]
const appleRed = "#ff3b30"

function toDateInputValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function toTimeInputValue(date: Date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function getMonthGrid(viewDate: Date) {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1 - startOffset)

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        return date
    })
}

function isSameDay(first: Date, second: Date) {
    return first.getFullYear() === second.getFullYear()
        && first.getMonth() === second.getMonth()
        && first.getDate() === second.getDate()
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

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

function getEventTypeLabel(type?: string | null) {
    if (type === "Print") return "Принт на снимки"
    if (type === "Photoshoot" || !type) return "Фотосесия"
    return type
}

function getHoverDetails(event: CalendarEvent) {
    return [
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
    ].filter(Boolean).join("\n")
}

function detectApplePlatform() {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent || ""
    return /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(ua)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

export default function AdminDashboardCalendarPreview() {
    const location = useLocation()
    const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [viewDate, setViewDate] = useState(() => new Date())
    const [selectedDate, setSelectedDate] = useState(() => new Date())
    const [isApplePlatform, setIsApplePlatform] = useState(detectApplePlatform)
    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
    const selectedDateLabel = selectedDate.toLocaleDateString("bg-BG", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    useEffect(() => {
        setIsApplePlatform(detectApplePlatform())
    }, [])

    useEffect(() => {
        if (location.pathname !== "/admin") return

        const mount = () => {
            const albumsSection = document.querySelector("#albums")
            if (!albumsSection || !albumsSection.parentElement) return false

            const existingRoot = document.getElementById("admin-dashboard-calendar-preview-root") as HTMLDivElement | null
            const root = existingRoot || document.createElement("div")
            root.id = "admin-dashboard-calendar-preview-root"

            if (!existingRoot) albumsSection.parentElement.insertBefore(root, albumsSection)

            const heading = albumsSection.parentElement.querySelector("h1")
            const subtitle = heading?.nextElementSibling as HTMLElement | null
            if (subtitle?.tagName === "P") subtitle.style.display = "none"

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
                const response = await apiFetch(API_PATH, { method: "GET", skipJsonContentType: true })
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

    const appleCalendar = (
        <section
            className="mb-10 overflow-hidden border-y border-black/5 bg-white text-black shadow-sm dark:border-white/10 dark:bg-black dark:text-white sm:rounded-[28px] sm:border"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
        >
            <div className="px-4 pb-3 pt-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 items-center rounded-[20px] bg-[#f2f2f7] px-4 text-[16px] font-semibold dark:bg-[#1c1c1e]">
                        {viewDate.getFullYear()}
                    </div>
                    <Link
                        to={`/admin/calendar?date=${toDateInputValue(selectedDate)}`}
                        className="inline-flex h-10 items-center rounded-[20px] bg-[#f2f2f7] px-4 text-[15px] font-semibold text-[#007aff] active:bg-[#e5e5ea] dark:bg-[#1c1c1e] dark:text-[#0a84ff] dark:active:bg-[#2c2c2e]"
                    >
                        Отвори календара
                    </Link>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <h2 className="text-[34px] font-bold leading-none tracking-[-0.035em] sm:text-[40px]">
                        {monthNames[viewDate.getMonth()]}
                    </h2>
                    <div className="flex items-center gap-1 text-[#007aff] dark:text-[#0a84ff]">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-[32px] font-light leading-none active:bg-black/5 dark:active:bg-white/10"
                            aria-label="Предишен месец"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-[32px] font-light leading-none active:bg-black/5 dark:active:bg-white/10"
                            aria-label="Следващ месец"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-[#e5e5ea] px-1 pb-1 text-center text-[12px] font-semibold dark:border-white/10 sm:px-3">
                {appleWeekdays.map((name, index) => (
                    <div key={`${name}-${index}`} className={index >= 5 ? "py-1 text-[#8e8e93]" : "py-1"}>
                        {name}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {monthGrid.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                    const dayEvents = isCurrentMonth
                        ? events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                        : []
                    const today = new Date()
                    const isToday = isCurrentMonth && isSameDay(date, today)
                    const isSelected = isCurrentMonth && isSameDay(date, selectedDate)
                    const isWeekend = index % 7 >= 5

                    return (
                        <button
                            key={date.toISOString()}
                            type="button"
                            disabled={!isCurrentMonth}
                            onClick={() => setSelectedDate(date)}
                            className="relative h-[76px] border-b border-[#e5e5ea] bg-white text-center active:bg-[#f7f7f7] disabled:cursor-default dark:border-white/10 dark:bg-black dark:active:bg-[#1c1c1e] sm:h-[88px]"
                            aria-label={isCurrentMonth ? date.toLocaleDateString("bg-BG") : undefined}
                        >
                            {isCurrentMonth ? (
                                <>
                                    <span
                                        className={`mx-auto mt-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full text-[17px] font-semibold ${isWeekend && !isToday ? "text-[#8e8e93]" : "text-black dark:text-white"} ${isSelected && !isToday ? "ring-2 ring-[#ff3b30]/45" : ""}`}
                                        style={isToday ? { backgroundColor: appleRed, color: "white" } : undefined}
                                    >
                                        {date.getDate()}
                                    </span>

                                    {dayEvents.length ? (
                                        <span className="absolute inset-x-1 bottom-2 flex flex-col items-center gap-[3px]">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <span
                                                    key={event.id}
                                                    className="h-[4px] w-[28px] max-w-[82%] rounded-full"
                                                    style={{ backgroundColor: event.color || "#0a84ff" }}
                                                />
                                            ))}
                                            {dayEvents.length > 3 ? <span className="h-[3px] w-[16px] rounded-full bg-[#c7c7cc] dark:bg-[#636366]" /> : null}
                                        </span>
                                    ) : null}
                                </>
                            ) : null}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div className="min-w-0 text-[13px] text-[#8e8e93]">
                    <span className="font-semibold capitalize text-black dark:text-white">{selectedDateLabel}</span>
                    {events.some((event) => isSameDay(new Date(event.startAtUtc), selectedDate))
                        ? ` · ${events.filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate)).length} събития`
                        : " · няма събития"}
                </div>
                <Link
                    to={`/admin/calendar?date=${toDateInputValue(selectedDate)}`}
                    className="shrink-0 text-[15px] font-semibold text-[#007aff] dark:text-[#0a84ff]"
                >
                    Детайли
                </Link>
            </div>
        </section>
    )

    const desktopCalendar = (
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => changeMonth(-1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">Назад</button>
                    <h2 className="min-w-[170px] text-center text-xl font-bold text-gray-900 dark:text-white">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                    <button type="button" onClick={() => changeMonth(1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">Напред</button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                        <span className="font-bold">Избран ден:</span> {selectedDateLabel}
                    </div>
                    <Link to="/admin/calendar" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200">Отвори календара</Link>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                {desktopWeekdays.map((name) => <div key={name} className="py-2">{name}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {monthGrid.map((date) => {
                    const dayEvents = events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                    const isSelected = isSameDay(date, selectedDate)
                    const isPast = isPastDate(date)

                    return (
                        <div
                            key={date.toISOString()}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedDate(date)}
                            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedDate(date) }}
                            className={`group/day min-h-[118px] cursor-pointer rounded-2xl border p-2 text-left transition ${isSelected ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : isPast ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-200 bg-white"} ${!isCurrentMonth ? "opacity-45" : ""}`}
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="text-sm font-bold">{date.getDate()}</div>
                                <Link to={`/admin/calendar?date=${toDateInputValue(date)}`} onClick={(event) => event.stopPropagation()} className={`${isSelected ? "inline-flex" : "hidden group-hover/day:inline-flex"} rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white`}>+ Добави</Link>
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event) => {
                                    const past = isPastEvent(event)
                                    return (
                                        <Link
                                            key={event.id}
                                            to={`/admin/calendar?date=${toDateInputValue(date)}`}
                                            onClick={(clickEvent) => clickEvent.stopPropagation()}
                                            className={`block w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-white ${past ? "opacity-60" : ""}`}
                                            style={{ backgroundColor: past ? "#9ca3af" : event.color || "#64748b" }}
                                            title={getHoverDetails(event)}
                                        >
                                            {toTimeInputValue(new Date(event.startAtUtc))} {event.title}
                                        </Link>
                                    )
                                })}
                                {dayEvents.length > 3 ? <div className="text-[11px] font-semibold text-gray-500">+{dayEvents.length - 3} още</div> : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )

    return createPortal(isApplePlatform ? appleCalendar : desktopCalendar, portalRoot)
}
