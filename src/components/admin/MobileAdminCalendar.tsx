import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { apiFetch } from "../../services/api"

const API_PATH = "/admin/calendar"
const defaultColor = "#64748b"
const appleRed = "#ff3b30"
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
const weekdayNames = ["П", "В", "С", "Ч", "П", "С", "Н"]

type CalendarEventType = {
    code: string
    name: string
    color: string
}

type CalendarEvent = {
    id: number
    title: string
    eventType?: string | null
    assignedTo?: string | null
    clientName?: string | null
    clientPhone?: string | null
    clientEmail?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    price?: number | null
    remindersEnabled?: boolean
    startAtUtc: string
    endAtUtc: string
}

function getInitialDate() {
    const dateParam = new URLSearchParams(window.location.search).get("date")
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return new Date()

    const parsed = new Date(`${dateParam}T12:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
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

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate()
}

function normalizeText(value?: string | null) {
    return (value || "").replace(/\s+/g, " ").trim()
}

function toTime(value: string) {
    return new Intl.DateTimeFormat("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

function toLongDate(date: Date) {
    return new Intl.DateTimeFormat("bg-BG", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(date)
}

function formatPrice(value?: number | null) {
    if (value === null || value === undefined) return ""
    return `${new Intl.NumberFormat("bg-BG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)} лв.`
}

function escapeIcs(value?: string | null) {
    return (value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;")
}

function toIcsUtc(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value)
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
}

function safeFileName(value: string) {
    const normalized = value
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}._-]+/gu, "-")
        .replace(/^-+|-+$/g, "")
    return normalized || "dg-vision-event"
}

function buildIcs(event: CalendarEvent) {
    const details = [
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.clientEmail ? `Email: ${event.clientEmail}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.price !== null && event.price !== undefined ? `Цена: ${formatPrice(event.price)}` : "",
        event.description || "",
    ].filter(Boolean).join("\n")

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DG Vision Studio//Admin Calendar//BG",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:dgvisionstudio-${event.id}@dgvisionstudio.com`,
        `DTSTAMP:${toIcsUtc(new Date())}`,
        `DTSTART:${toIcsUtc(event.startAtUtc)}`,
        `DTEND:${toIcsUtc(event.endAtUtc)}`,
        `SUMMARY:${escapeIcs(event.title)}`,
        event.location ? `LOCATION:${escapeIcs(event.location)}` : "",
        details ? `DESCRIPTION:${escapeIcs(details)}` : "",
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcs(`Напомняне: ${event.title}`)}`,
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
    ].filter((line) => line !== "").join("\r\n")
}

function exportToAppleCalendar(event: CalendarEvent) {
    const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const isAppleMobile = /iPad|iPhone|iPod/i.test(navigator.userAgent)

    link.href = url
    link.rel = "noopener"
    link.style.display = "none"

    if (isAppleMobile) {
        link.target = "_blank"
    } else {
        link.download = `${safeFileName(event.title)}.ics`
    }

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches)

    useEffect(() => {
        const query = window.matchMedia("(max-width: 767px)")
        const update = () => setIsMobile(query.matches)
        update()
        query.addEventListener("change", update)
        return () => query.removeEventListener("change", update)
    }, [])

    return isMobile
}

function getDesktopCalendarSection() {
    const prepared = document.querySelector<HTMLElement>('section[data-dg-calendar-main="true"]')
    if (prepared) return prepared

    return Array.from(document.querySelectorAll<HTMLElement>("section")).find((section) => {
        const hasSevenColumnGrids = section.querySelectorAll('[class*="grid-cols-7"]').length >= 2
        const hasBackButton = Array.from(section.querySelectorAll("button"))
            .some((button) => normalizeText(button.textContent) === "Назад")
        return hasSevenColumnGrids && hasBackButton
    }) || null
}

function getDesktopDayCells() {
    const section = getDesktopCalendarSection()
    if (!section) return [] as HTMLElement[]

    const grids = Array.from(section.querySelectorAll<HTMLElement>('[class*="grid-cols-7"]'))
    const dayGrid = grids.at(-1)
    if (!dayGrid) return [] as HTMLElement[]

    return Array.from(dayGrid.children)
        .filter((element): element is HTMLElement => element instanceof HTMLElement && element.getAttribute("role") === "button")
}

export default function MobileAdminCalendar() {
    const location = useLocation()
    const isMobile = useIsMobile()
    const isCalendarPage = location.pathname === "/admin/calendar" || location.pathname === "/admin/calendar/"
    const initialDate = useMemo(() => getInitialDate(), [])
    const [viewDate, setViewDate] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
    const [selectedDate, setSelectedDate] = useState(() => initialDate)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [eventTypes, setEventTypes] = useState<CalendarEventType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const touchStartX = useRef<number | null>(null)

    const loadData = useCallback(async () => {
        if (!isCalendarPage) return

        try {
            setError("")
            const [eventsResponse, typesResponse] = await Promise.all([
                apiFetch(API_PATH, { method: "GET", skipJsonContentType: true }),
                apiFetch(`${API_PATH}/event-types`, { method: "GET", skipJsonContentType: true }),
            ])

            if (!eventsResponse.ok) throw new Error("Календарът не можа да се зареди.")

            const eventData: unknown = await eventsResponse.json().catch(() => [])
            const typeData: unknown = typesResponse.ok
                ? await typesResponse.json().catch(() => [])
                : []

            setEvents(Array.isArray(eventData) ? eventData as CalendarEvent[] : [])
            setEventTypes(Array.isArray(typeData) ? typeData as CalendarEventType[] : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Календарът не можа да се зареди.")
        } finally {
            setLoading(false)
        }
    }, [isCalendarPage])

    useEffect(() => {
        if (!isCalendarPage || !isMobile) return
        setLoading(true)
        void loadData()
    }, [isCalendarPage, isMobile, loadData])

    useEffect(() => {
        if (!isCalendarPage || !isMobile) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isCalendarPage, isMobile])

    useEffect(() => {
        if (!isCalendarPage || !isMobile) return

        const onDocumentClick = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target.closest("button") : null
            if (!target) return

            const text = normalizeText(target.textContent)
            if (text === "Добави събитие" || text === "Запази промените") {
                window.setTimeout(() => void loadData(), 700)
                window.setTimeout(() => void loadData(), 1_800)
            }
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") void loadData()
        }

        document.addEventListener("click", onDocumentClick, true)
        document.addEventListener("visibilitychange", onVisibilityChange)
        return () => {
            document.removeEventListener("click", onDocumentClick, true)
            document.removeEventListener("visibilitychange", onVisibilityChange)
        }
    }, [isCalendarPage, isMobile, loadData])

    const typeColors = useMemo(
        () => new Map(eventTypes.map((type) => [type.code.toLowerCase(), type.color])),
        [eventTypes],
    )

    const getEventColor = (event: CalendarEvent) =>
        typeColors.get((event.eventType || "").toLowerCase()) || event.color || defaultColor

    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
    const selectedEvents = useMemo(
        () => events
            .filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate))
            .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()),
        [events, selectedDate],
    )

    const syncSelectedDay = (date: Date) => {
        const cells = getDesktopDayCells()
        const index = monthGrid.findIndex((item) => isSameDay(item, date))
        cells[index]?.click()
    }

    const selectDay = (date: Date) => {
        setSelectedDate(date)
        syncSelectedDay(date)
    }

    const moveMonth = (delta: number) => {
        const section = getDesktopCalendarSection()
        const label = delta < 0 ? "Назад" : "Напред"
        const navigationButton = section
            ? Array.from(section.querySelectorAll<HTMLButtonElement>("button"))
                .find((button) => normalizeText(button.textContent) === label)
            : null

        navigationButton?.click()

        setViewDate((current) => {
            const next = new Date(current.getFullYear(), current.getMonth() + delta, 1)
            const nextSelected = new Date(next.getFullYear(), next.getMonth(), 1)
            setSelectedDate(nextSelected)

            window.setTimeout(() => {
                const nextGrid = getMonthGrid(next)
                const cells = getDesktopDayCells()
                const index = nextGrid.findIndex((date) => isSameDay(date, nextSelected))
                cells[index]?.click()
            }, 0)

            return next
        })
    }

    const openAddEvent = () => {
        const cells = getDesktopDayCells()
        const index = monthGrid.findIndex((date) => isSameDay(date, selectedDate))
        const cell = cells[index]
        if (!cell) {
            setError("Формата за ново събитие не е готова. Натисни отново след секунда.")
            return
        }

        const addButton = Array.from(cell.querySelectorAll<HTMLButtonElement>("button"))
            .find((button) => normalizeText(button.textContent) === "+ Добави")

        if (!addButton) {
            setError("Формата за ново събитие не е намерена.")
            return
        }

        addButton.click()
    }

    const openEditEvent = (calendarEvent: CalendarEvent) => {
        const eventDate = new Date(calendarEvent.startAtUtc)
        const cells = getDesktopDayCells()
        const index = monthGrid.findIndex((date) => isSameDay(date, eventDate))
        const cell = cells[index]
        const expectedText = `${toTime(calendarEvent.startAtUtc)} ${calendarEvent.title}`

        const eventButton = cell
            ? Array.from(cell.querySelectorAll<HTMLButtonElement>("button"))
                .find((button) => normalizeText(button.textContent) === normalizeText(expectedText))
            : null

        if (!eventButton) {
            setError("Събитието не можа да се отвори за редакция. Обнови календара и опитай пак.")
            return
        }

        eventButton.click()
    }

    const deleteEvent = async (calendarEvent: CalendarEvent) => {
        if (!window.confirm(`Да изтрия ли „${calendarEvent.title}“?`)) return

        setDeletingId(calendarEvent.id)
        try {
            const response = await apiFetch(`${API_PATH}/${calendarEvent.id}`, { method: "DELETE" })
            if (!response.ok && response.status !== 204) throw new Error("Изтриването беше неуспешно.")
            setEvents((current) => current.filter((item) => item.id !== calendarEvent.id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Изтриването беше неуспешно.")
        } finally {
            setDeletingId(null)
        }
    }

    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
    }

    const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
        const distance = endX - touchStartX.current
        touchStartX.current = null

        if (Math.abs(distance) < 55) return
        moveMonth(distance > 0 ? -1 : 1)
    }

    if (!isCalendarPage || !isMobile) return null

    const today = new Date()

    return (
        <div
            className="fixed inset-x-0 bottom-0 top-[73px] z-30 overflow-y-auto bg-[#f2f2f7] text-[#1c1c1e] dark:bg-black dark:text-white md:hidden"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
        >
            <div className="mx-auto min-h-full w-full max-w-lg bg-[#f2f2f7] pb-[calc(2rem+env(safe-area-inset-bottom))] dark:bg-black">
                <header className="sticky top-0 z-10 border-b border-black/5 bg-[#f2f2f7]/95 px-4 pb-2 pt-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/90">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => moveMonth(-1)}
                            aria-label="Предишен месец"
                            className="flex h-11 w-11 items-center justify-start text-[34px] font-light leading-none"
                            style={{ color: appleRed }}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date()
                                const monthDelta = (now.getFullYear() - viewDate.getFullYear()) * 12 + now.getMonth() - viewDate.getMonth()
                                if (monthDelta !== 0) moveMonth(monthDelta)
                                setSelectedDate(now)
                            }}
                            className="rounded-full px-3 py-2 text-sm font-semibold"
                            style={{ color: appleRed }}
                        >
                            Днес
                        </button>
                        <button
                            type="button"
                            onClick={() => moveMonth(1)}
                            aria-label="Следващ месец"
                            className="flex h-11 w-11 items-center justify-end text-[34px] font-light leading-none"
                            style={{ color: appleRed }}
                        >
                            ›
                        </button>
                    </div>
                    <div className="flex items-end justify-between gap-4 px-1">
                        <h1 className="text-[30px] font-bold tracking-tight">
                            {monthNames[viewDate.getMonth()]} <span className="font-normal text-black/45 dark:text-white/45">{viewDate.getFullYear()}</span>
                        </h1>
                        <button
                            type="button"
                            onClick={openAddEvent}
                            className="mb-1 flex h-9 w-9 items-center justify-center rounded-full text-[28px] font-light leading-none"
                            style={{ color: appleRed, backgroundColor: "rgba(255,59,48,0.10)" }}
                            aria-label="Добави събитие"
                        >
                            +
                        </button>
                    </div>
                </header>

                {error ? (
                    <div className="mx-4 mt-3 rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                <section className="bg-white px-3 pb-3 pt-2 dark:bg-[#1c1c1e]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-black/35 dark:text-white/35">
                        {weekdayNames.map((name, index) => <div key={`${name}-${index}`} className="py-2">{name}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1">
                        {monthGrid.map((date) => {
                            const dayEvents = events.filter((calendarEvent) => isSameDay(new Date(calendarEvent.startAtUtc), date))
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                            const isSelected = isSameDay(date, selectedDate)
                            const isToday = isSameDay(date, today)

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    onClick={() => selectDay(date)}
                                    className={`relative flex min-h-[58px] flex-col items-center rounded-xl py-1 transition active:bg-black/5 dark:active:bg-white/10 ${!isCurrentMonth ? "opacity-25" : ""}`}
                                    aria-label={date.toLocaleDateString("bg-BG")}
                                >
                                    <span
                                        className="flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-[17px] font-medium"
                                        style={isSelected
                                            ? { backgroundColor: appleRed, color: "white" }
                                            : isToday
                                                ? { color: appleRed, fontWeight: 700 }
                                                : undefined}
                                    >
                                        {date.getDate()}
                                    </span>
                                    <span className="mt-1 flex min-h-2 items-center justify-center gap-[3px]">
                                        {dayEvents.slice(0, 3).map((calendarEvent) => (
                                            <span
                                                key={calendarEvent.id}
                                                className="h-[5px] w-[5px] rounded-full"
                                                style={{ backgroundColor: getEventColor(calendarEvent) }}
                                            />
                                        ))}
                                        {dayEvents.length > 3 ? <span className="text-[8px] font-bold text-black/35 dark:text-white/35">+</span> : null}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </section>

                <section className="mt-3 px-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[13px] font-semibold uppercase tracking-wide text-black/35 dark:text-white/35">Програма</p>
                            <h2 className="text-xl font-bold capitalize">{toLongDate(selectedDate)}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => void loadData()}
                            className="rounded-full bg-white px-3 py-2 text-xs font-semibold shadow-sm dark:bg-[#1c1c1e]"
                            style={{ color: appleRed }}
                        >
                            Обнови
                        </button>
                    </div>

                    {loading ? (
                        <div className="rounded-3xl bg-white px-4 py-6 text-center text-sm text-black/40 dark:bg-[#1c1c1e] dark:text-white/40">
                            Зареждане...
                        </div>
                    ) : null}

                    {!loading && selectedEvents.length === 0 ? (
                        <button
                            type="button"
                            onClick={openAddEvent}
                            className="w-full rounded-3xl bg-white px-5 py-8 text-center shadow-sm dark:bg-[#1c1c1e]"
                        >
                            <span className="block text-sm text-black/40 dark:text-white/40">Няма събития за този ден</span>
                            <span className="mt-2 block text-sm font-semibold" style={{ color: appleRed }}>Добави събитие</span>
                        </button>
                    ) : null}

                    <div className="space-y-3">
                        {selectedEvents.map((calendarEvent) => {
                            const color = getEventColor(calendarEvent)
                            return (
                                <article key={calendarEvent.id} className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[#1c1c1e]">
                                    <button
                                        type="button"
                                        onClick={() => openEditEvent(calendarEvent)}
                                        className="flex w-full gap-3 px-4 pb-3 pt-4 text-left active:bg-black/5 dark:active:bg-white/5"
                                    >
                                        <span className="mt-1 h-12 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-baseline justify-between gap-3">
                                                <strong className="truncate text-[17px] font-semibold">{calendarEvent.title}</strong>
                                                <span className="shrink-0 text-[13px] font-semibold" style={{ color: appleRed }}>
                                                    {toTime(calendarEvent.startAtUtc)}
                                                </span>
                                            </span>
                                            <span className="mt-1 block text-[13px] text-black/45 dark:text-white/45">
                                                {toTime(calendarEvent.startAtUtc)} – {toTime(calendarEvent.endAtUtc)}
                                                {calendarEvent.eventType ? ` · ${calendarEvent.eventType}` : ""}
                                            </span>
                                            {calendarEvent.clientName ? <span className="mt-2 block text-sm">{calendarEvent.clientName}</span> : null}
                                            {calendarEvent.location ? <span className="mt-1 block text-sm text-black/55 dark:text-white/55">{calendarEvent.location}</span> : null}
                                            {calendarEvent.price !== null && calendarEvent.price !== undefined ? <span className="mt-1 block text-sm font-semibold">{formatPrice(calendarEvent.price)}</span> : null}
                                        </span>
                                    </button>

                                    <div className="grid grid-cols-3 border-t border-black/5 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => openEditEvent(calendarEvent)}
                                            className="min-h-12 border-r border-black/5 px-2 text-xs font-semibold dark:border-white/10"
                                            style={{ color: appleRed }}
                                        >
                                            Редактирай
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => exportToAppleCalendar(calendarEvent)}
                                            className="min-h-12 border-r border-black/5 px-2 text-xs font-semibold dark:border-white/10"
                                            style={{ color: appleRed }}
                                        >
                                            Apple Calendar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void deleteEvent(calendarEvent)}
                                            disabled={deletingId === calendarEvent.id}
                                            className="min-h-12 px-2 text-xs font-semibold text-red-600 disabled:opacity-40"
                                        >
                                            {deletingId === calendarEvent.id ? "Триене..." : "Изтрий"}
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    )
}
