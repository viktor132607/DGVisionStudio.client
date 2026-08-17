import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react"
import { useLocation } from "react-router-dom"
import { apiFetch } from "../../services/api"

const API_PATH = "/admin/calendar"
const defaultColor = "#64748b"
const appleRed = "#ff3b30"
const appleBlue = "#007aff"
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
const shortMonthNames = ["Яну", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Ное", "Дек"]
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

function getNextMonthPreview(viewDate: Date) {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    const startOffset = (nextMonth.getDay() + 6) % 7

    return {
        month: nextMonth,
        cells: Array.from({ length: 7 }, (_, index) => {
            const day = index - startOffset + 1
            if (day < 1) return null
            return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day)
        }),
    }
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
        year: "numeric",
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
    return normalized || "dg-vision-calendar"
}

function buildEventLines(event: CalendarEvent) {
    const details = [
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.clientEmail ? `Email: ${event.clientEmail}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.eventType ? `Тип: ${event.eventType}` : "",
        event.price !== null && event.price !== undefined ? `Цена: ${formatPrice(event.price)}` : "",
        event.description || "",
    ].filter(Boolean).join("\n")

    return [
        "BEGIN:VEVENT",
        `UID:dgvisionstudio-${event.id}@dgvisionstudio.com`,
        `DTSTAMP:${toIcsUtc(new Date())}`,
        `DTSTART:${toIcsUtc(event.startAtUtc)}`,
        `DTEND:${toIcsUtc(event.endAtUtc)}`,
        `SUMMARY:${escapeIcs(event.title)}`,
        event.location ? `LOCATION:${escapeIcs(event.location)}` : "",
        details ? `DESCRIPTION:${escapeIcs(details)}` : "",
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcs(`Напомняне: ${event.title}`)}`,
        "END:VALARM",
        "END:VEVENT",
    ].filter(Boolean)
}

function buildCalendarIcs(calendarEvents: CalendarEvent[]) {
    const sortedEvents = [...calendarEvents].sort(
        (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime(),
    )

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DG Vision Studio//Admin Calendar//BG",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:DG Vision Studio",
        "X-WR-TIMEZONE:Europe/Sofia",
        ...sortedEvents.flatMap(buildEventLines),
        "END:VCALENDAR",
        "",
    ].join("\r\n")
}

async function shareOrDownloadCalendar(calendarEvents: CalendarEvent[], fileName: string) {
    if (!calendarEvents.length) throw new Error("Няма събития за експортиране.")

    const ics = buildCalendarIcs(calendarEvents)
    const file = new File([ics], `${safeFileName(fileName)}.ics`, {
        type: "text/calendar;charset=utf-8",
    })

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: "DG Vision Studio Calendar",
                text: "Импортирай събитията в Apple Calendar.",
            })
            return
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return
        }
    }

    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    const isAppleMobile = /iPad|iPhone|iPod/i.test(navigator.userAgent)

    link.href = url
    link.rel = "noopener"
    link.style.display = "none"
    link.download = file.name

    if (isAppleMobile) link.target = "_blank"

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches)

    useEffect(() => {
        const query = window.matchMedia("(max-width: 900px)")
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

function IconList() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M7 6h12M7 12h12M7 18h12" />
            <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="3" />
        </svg>
    )
}

function IconSearch() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
        </svg>
    )
}

function IconPlus() {
    return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 4v16M4 12h16" />
        </svg>
    )
}

function IconCalendar() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="3" />
        </svg>
    )
}

function IconShare() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V3" />
            <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
            <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
        </svg>
    )
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
    const [exporting, setExporting] = useState(false)
    const [agendaOpen, setAgendaOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
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
    const nextMonthPreview = useMemo(() => getNextMonthPreview(viewDate), [viewDate])
    const selectedEvents = useMemo(
        () => events
            .filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate))
            .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()),
        [events, selectedDate],
    )
    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLocaleLowerCase("bg-BG")
        if (!query) return [] as CalendarEvent[]

        return events
            .filter((event) => [
                event.title,
                event.clientName,
                event.clientPhone,
                event.clientEmail,
                event.location,
                event.eventType,
                event.description,
            ].some((value) => (value || "").toLocaleLowerCase("bg-BG").includes(query)))
            .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime())
            .slice(0, 40)
    }, [events, searchQuery])

    const syncDesktopMonth = (delta: number) => {
        if (delta === 0) return
        const label = delta < 0 ? "Назад" : "Напред"

        for (let index = 0; index < Math.abs(delta); index += 1) {
            const section = getDesktopCalendarSection()
            const navigationButton = section
                ? Array.from(section.querySelectorAll<HTMLButtonElement>("button"))
                    .find((button) => normalizeText(button.textContent) === label)
                : null
            navigationButton?.click()
        }
    }

    const syncSelectedDay = (date: Date, grid = monthGrid) => {
        const cells = getDesktopDayCells()
        const index = grid.findIndex((item) => isSameDay(item, date))
        cells[index]?.click()
    }

    const selectDay = (date: Date) => {
        setSelectedDate(date)
        syncSelectedDay(date)
        setAgendaOpen(true)
    }

    const moveMonth = (delta: number) => {
        syncDesktopMonth(delta)
        setViewDate((current) => {
            const next = new Date(current.getFullYear(), current.getMonth() + delta, 1)
            const nextSelected = new Date(next.getFullYear(), next.getMonth(), 1)
            setSelectedDate(nextSelected)
            window.setTimeout(() => syncSelectedDay(nextSelected, getMonthGrid(next)), 0)
            return next
        })
    }

    const jumpToDate = (date: Date, openAgenda = true) => {
        const delta = (date.getFullYear() - viewDate.getFullYear()) * 12 + date.getMonth() - viewDate.getMonth()
        syncDesktopMonth(delta)
        const nextViewDate = new Date(date.getFullYear(), date.getMonth(), 1)
        setViewDate(nextViewDate)
        setSelectedDate(date)
        window.setTimeout(() => syncSelectedDay(date, getMonthGrid(nextViewDate)), 0)
        if (openAgenda) setAgendaOpen(true)
    }

    const goToday = () => jumpToDate(new Date(), false)

    const exportWholeCalendar = async () => {
        setExporting(true)
        setError("")
        try {
            await shareOrDownloadCalendar(events, "DG-Vision-Studio-Calendar")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Експортът беше неуспешен.")
        } finally {
            setExporting(false)
        }
    }

    const exportSingleEvent = async (calendarEvent: CalendarEvent) => {
        setError("")
        try {
            await shareOrDownloadCalendar([calendarEvent], calendarEvent.title)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Експортът беше неуспешен.")
        }
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

        setAgendaOpen(false)
        addButton.click()
    }

    const openEditEvent = (calendarEvent: CalendarEvent) => {
        const eventDate = new Date(calendarEvent.startAtUtc)
        const eventMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
        const delta = (eventMonth.getFullYear() - viewDate.getFullYear()) * 12 + eventMonth.getMonth() - viewDate.getMonth()

        if (delta !== 0) {
            syncDesktopMonth(delta)
            setViewDate(eventMonth)
            setSelectedDate(eventDate)
        }

        window.setTimeout(() => {
            const grid = getMonthGrid(eventMonth)
            const cells = getDesktopDayCells()
            const index = grid.findIndex((date) => isSameDay(date, eventDate))
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

            setAgendaOpen(false)
            setSearchOpen(false)
            eventButton.click()
        }, delta === 0 ? 0 : 80)
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

    const onTouchStart = (event: TouchEvent<HTMLElement>) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
    }

    const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
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
            className="fixed inset-x-0 bottom-0 top-[73px] z-[60] overflow-y-auto bg-white text-black md:hidden"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
        >
            <div className="mx-auto min-h-full w-full max-w-[520px] bg-white pb-28">
                <header className="sticky top-0 z-20 bg-white/95 px-4 pb-2 pt-3 backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex h-11 items-center gap-1 rounded-[22px] border border-black/5 bg-[#f7f7f7] px-3 text-[18px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                            <span className="text-[32px] font-light leading-none">‹</span>
                            <span>{viewDate.getFullYear()}</span>
                        </div>

                        <div className="flex h-11 items-center rounded-[22px] border border-black/5 bg-[#f7f7f7] px-1 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                            <button type="button" onClick={() => setAgendaOpen(true)} className="flex h-10 w-11 items-center justify-center rounded-full active:bg-black/5" aria-label="Събития за избрания ден">
                                <IconList />
                            </button>
                            <button type="button" onClick={() => setSearchOpen(true)} className="flex h-10 w-11 items-center justify-center rounded-full active:bg-black/5" aria-label="Търси в календара">
                                <IconSearch />
                            </button>
                            <button type="button" onClick={openAddEvent} className="flex h-10 w-11 items-center justify-center rounded-full active:bg-black/5" aria-label="Добави събитие">
                                <IconPlus />
                            </button>
                        </div>
                    </div>

                    <h1 className="mt-7 px-1 text-[38px] font-bold leading-none tracking-[-0.035em]">
                        {monthNames[viewDate.getMonth()]}
                    </h1>
                </header>

                {error ? (
                    <div className="mx-4 mb-2 mt-1 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="px-4 pb-3 pt-2">
                    <button
                        type="button"
                        onClick={() => void exportWholeCalendar()}
                        disabled={loading || exporting || events.length === 0}
                        className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-[#f2f2f7] px-4 text-left active:bg-[#e5e5ea] disabled:opacity-45"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: appleBlue }}>
                                <IconShare />
                            </span>
                            <span>
                                <strong className="block text-[15px] font-semibold">{exporting ? "Експортиране..." : "Експортирай към Apple Calendar"}</strong>
                                <span className="block text-[12px] text-[#8e8e93]">Всички {events.length} събития · напомняне 1 час по-рано</span>
                            </span>
                        </span>
                        <span className="text-[25px] font-light text-[#c7c7cc]">›</span>
                    </button>
                </div>

                <section onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    <div className="grid grid-cols-7 border-b border-[#dedede] px-2 pb-1 pt-2 text-center text-[12px] font-semibold">
                        {weekdayNames.map((name, index) => (
                            <div key={`${name}-${index}`} className={index >= 5 ? "py-1 text-[#8e8e93]" : "py-1"}>
                                {name}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {monthGrid.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                            const dayEvents = isCurrentMonth
                                ? events.filter((calendarEvent) => isSameDay(new Date(calendarEvent.startAtUtc), date))
                                : []
                            const isToday = isCurrentMonth && isSameDay(date, today)
                            const isSelected = isCurrentMonth && isSameDay(date, selectedDate)
                            const isWeekend = index % 7 >= 5

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    disabled={!isCurrentMonth}
                                    onClick={() => selectDay(date)}
                                    className="relative h-[86px] border-b border-[#e5e5ea] bg-white text-center active:bg-[#f7f7f7] disabled:cursor-default"
                                    aria-label={isCurrentMonth ? date.toLocaleDateString("bg-BG") : undefined}
                                >
                                    {isCurrentMonth ? (
                                        <>
                                            <span
                                                className={`mx-auto mt-3 flex h-[35px] w-[35px] items-center justify-center rounded-full text-[18px] font-semibold ${isWeekend && !isToday ? "text-[#8e8e93]" : "text-black"} ${isSelected && !isToday ? "ring-1 ring-[#ff3b30]/35" : ""}`}
                                                style={isToday ? { backgroundColor: appleRed, color: "white" } : undefined}
                                            >
                                                {date.getDate()}
                                            </span>

                                            {dayEvents.length ? (
                                                <span className="absolute inset-x-1 bottom-2 flex flex-col items-center gap-[3px]">
                                                    {dayEvents.slice(0, 2).map((calendarEvent) => (
                                                        <span key={calendarEvent.id} className="h-[4px] w-[30px] max-w-[82%] rounded-full" style={{ backgroundColor: getEventColor(calendarEvent) }} />
                                                    ))}
                                                    {dayEvents.length > 2 ? <span className="h-[3px] w-[18px] rounded-full bg-[#c7c7cc]" /> : null}
                                                </span>
                                            ) : null}
                                        </>
                                    ) : null}
                                </button>
                            )
                        })}
                    </div>

                    <div className="px-4 pt-7">
                        <h2 className="text-[28px] font-bold tracking-[-0.025em]">{shortMonthNames[nextMonthPreview.month.getMonth()]}</h2>
                    </div>
                    <div className="mt-1 grid grid-cols-7 border-y border-[#e5e5ea]">
                        {nextMonthPreview.cells.map((date, index) => (
                            <div key={index} className="relative h-[82px] bg-white text-center">
                                {date ? (
                                    <span className={`mt-3 inline-flex h-9 w-9 items-center justify-center text-[18px] font-semibold ${index >= 5 ? "text-[#8e8e93]" : "text-black"}`}>
                                        {date.getDate()}
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>

                {loading ? <div className="px-4 py-6 text-center text-sm text-[#8e8e93]">Зареждане...</div> : null}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[86px] max-w-[520px] items-center justify-between border-t border-black/5 bg-white/88 px-5 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl">
                <button type="button" onClick={goToday} className="rounded-[24px] border border-black/5 bg-[#f7f7f7] px-5 py-3 text-[16px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    Днес
                </button>
                <div className="flex items-center rounded-[25px] border border-black/5 bg-[#f7f7f7] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    <button type="button" onClick={() => setAgendaOpen(true)} className="flex h-11 w-14 items-center justify-center rounded-[22px] active:bg-black/5" aria-label="Календар">
                        <IconCalendar />
                    </button>
                    <button type="button" onClick={() => setAgendaOpen(true)} className="flex h-11 w-14 items-center justify-center rounded-[22px] active:bg-black/5" aria-label="Списък със събития">
                        <IconList />
                    </button>
                </div>
            </div>

            {agendaOpen ? (
                <div className="fixed inset-0 z-[80] flex items-end bg-black/20" onClick={() => setAgendaOpen(false)}>
                    <section className="max-h-[76dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#f2f2f7] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.16)]" onClick={(event) => event.stopPropagation()}>
                        <div className="sticky top-0 z-10 bg-[#f2f2f7]/95 px-4 pb-3 pt-2 backdrop-blur-xl">
                            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15" />
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">Избран ден</p>
                                    <h2 className="mt-0.5 text-[21px] font-bold capitalize">{toLongDate(selectedDate)}</h2>
                                </div>
                                <button type="button" onClick={openAddEvent} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff3b30] shadow-sm" aria-label="Добави събитие">
                                    <IconPlus />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 px-4">
                            {!loading && selectedEvents.length === 0 ? (
                                <button type="button" onClick={openAddEvent} className="w-full rounded-2xl bg-white px-4 py-7 text-center">
                                    <span className="block text-sm text-[#8e8e93]">Няма събития за този ден</span>
                                    <span className="mt-2 block text-sm font-semibold text-[#ff3b30]">Добави събитие</span>
                                </button>
                            ) : null}

                            {selectedEvents.map((calendarEvent) => (
                                <article key={calendarEvent.id} className="overflow-hidden rounded-2xl bg-white">
                                    <button type="button" onClick={() => openEditEvent(calendarEvent)} className="flex w-full gap-3 px-4 py-4 text-left active:bg-black/5">
                                        <span className="mt-1 h-12 w-1 shrink-0 rounded-full" style={{ backgroundColor: getEventColor(calendarEvent) }} />
                                        <span className="min-w-0 flex-1">
                                            <strong className="block truncate text-[17px] font-semibold">{calendarEvent.title}</strong>
                                            <span className="mt-1 block text-[13px] text-[#8e8e93]">
                                                {toTime(calendarEvent.startAtUtc)} – {toTime(calendarEvent.endAtUtc)}
                                                {calendarEvent.eventType ? ` · ${calendarEvent.eventType}` : ""}
                                            </span>
                                            {calendarEvent.clientName ? <span className="mt-2 block text-sm">{calendarEvent.clientName}</span> : null}
                                            {calendarEvent.location ? <span className="mt-1 block text-sm text-[#636366]">{calendarEvent.location}</span> : null}
                                            {calendarEvent.price !== null && calendarEvent.price !== undefined ? <span className="mt-1 block text-sm font-semibold">{formatPrice(calendarEvent.price)}</span> : null}
                                        </span>
                                    </button>
                                    <div className="grid grid-cols-3 border-t border-[#e5e5ea]">
                                        <button type="button" onClick={() => openEditEvent(calendarEvent)} className="min-h-12 border-r border-[#e5e5ea] px-2 text-xs font-semibold text-[#007aff]">Редактирай</button>
                                        <button type="button" onClick={() => void exportSingleEvent(calendarEvent)} className="min-h-12 border-r border-[#e5e5ea] px-2 text-xs font-semibold text-[#007aff]">Apple Calendar</button>
                                        <button type="button" onClick={() => void deleteEvent(calendarEvent)} disabled={deletingId === calendarEvent.id} className="min-h-12 px-2 text-xs font-semibold text-[#ff3b30] disabled:opacity-40">
                                            {deletingId === calendarEvent.id ? "Триене..." : "Изтрий"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            ) : null}

            {searchOpen ? (
                <div className="fixed inset-0 z-[90] bg-white">
                    <div className="sticky top-0 border-b border-[#e5e5ea] bg-white px-4 pb-3 pt-[calc(0.8rem+env(safe-area-inset-top))]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-[#f2f2f7] px-3">
                                <IconSearch />
                                <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Търси" className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#8e8e93]" />
                            </div>
                            <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery("") }} className="text-[16px] font-medium text-[#007aff]">Отказ</button>
                        </div>
                    </div>

                    <div className="divide-y divide-[#e5e5ea] px-4">
                        {searchQuery.trim() && !searchResults.length ? <div className="py-10 text-center text-sm text-[#8e8e93]">Няма намерени събития</div> : null}
                        {searchResults.map((calendarEvent) => (
                            <button
                                key={calendarEvent.id}
                                type="button"
                                onClick={() => {
                                    const date = new Date(calendarEvent.startAtUtc)
                                    setSearchOpen(false)
                                    setSearchQuery("")
                                    jumpToDate(date, true)
                                }}
                                className="flex w-full items-start gap-3 py-4 text-left"
                            >
                                <span className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: getEventColor(calendarEvent) }} />
                                <span className="min-w-0 flex-1">
                                    <strong className="block truncate text-[16px]">{calendarEvent.title}</strong>
                                    <span className="mt-1 block text-[13px] text-[#8e8e93]">
                                        {new Date(calendarEvent.startAtUtc).toLocaleDateString("bg-BG")} · {toTime(calendarEvent.startAtUtc)}
                                    </span>
                                    {calendarEvent.clientName ? <span className="mt-1 block truncate text-sm text-[#636366]">{calendarEvent.clientName}</span> : null}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
