import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"
import { useAdminToast } from "../../hooks/useAdminToast"

const API_PATH = "/admin/calendar"
const monthNames = ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"]
const weekdayNames = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]

type CalendarEvent = {
    id: number
    title: string
    eventType?: string | null
    assignedTo?: string | null
    clientName?: string | null
    clientPhone?: string | null
    clientEmail?: string | null
    contactRequestId?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    remindersEnabled?: boolean
    reminder24hSentAtUtc?: string | null
    reminder2hSentAtUtc?: string | null
    startAtUtc: string
    endAtUtc: string
}

type ContactRequest = {
    id: string
    name: string
    email: string
    phone?: string | null
    subject?: string | null
    message: string
    createdAtUtc?: string | null
}

type CalendarForm = {
    title: string
    eventType: string
    assignedTo: string
    clientName: string
    clientPhone: string
    clientEmail: string
    contactRequestId: string
    location: string
    description: string
    color: string
    remindersEnabled: boolean
    startDate: string
    startTime: string
    endDate: string
    endTime: string
}

const defaultForm: CalendarForm = {
    title: "",
    eventType: "Photoshoot",
    assignedTo: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    contactRequestId: "",
    location: "",
    description: "",
    color: "#2563eb",
    remindersEnabled: true,
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "12:00",
}

function getInitialDate() {
    if (typeof window === "undefined") return new Date()

    const dateParam = new URLSearchParams(window.location.search).get("date")
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return new Date()

    const parsedDate = new Date(`${dateParam}T12:00:00`)
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
}

function getInitialContactRequestId() {
    if (typeof window === "undefined") return ""
    return new URLSearchParams(window.location.search).get("contactRequestId") || ""
}

function toDateInputValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function toTimeInputValue(date: Date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function combineLocalDateTime(date: string, time: string) {
    return new Date(`${date}T${time || "00:00"}`).toISOString()
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
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
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
    return type === "Print" ? "Принт на снимки" : "Фотосесия"
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
        event.clientEmail ? `Email: ${event.clientEmail}` : "",
        event.clientEmail ? `Напомняния: ${event.remindersEnabled ? "включени" : "изключени"}` : "",
        event.contactRequestId ? `Свързана заявка: ${event.contactRequestId}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.location ? `Локация: ${event.location}` : "",
        event.description ? `Бележки: ${event.description}` : "",
    ].filter(Boolean).join("\n")
}

function toLocalInputValues(event: CalendarEvent): CalendarForm {
    const start = new Date(event.startAtUtc)
    const end = new Date(event.endAtUtc)

    return {
        title: event.title || "",
        eventType: event.eventType || "Photoshoot",
        assignedTo: event.assignedTo || "",
        clientName: event.clientName || "",
        clientPhone: event.clientPhone || "",
        clientEmail: event.clientEmail || "",
        contactRequestId: event.contactRequestId || "",
        location: event.location || "",
        description: event.description || "",
        color: event.color || "#2563eb",
        remindersEnabled: event.remindersEnabled ?? true,
        startDate: toDateInputValue(start),
        startTime: toTimeInputValue(start),
        endDate: toDateInputValue(end),
        endTime: toTimeInputValue(end),
    }
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
                {event.clientEmail ? <div>Email: {event.clientEmail}</div> : null}
                {event.clientEmail ? <div>Напомняния: {event.remindersEnabled ? "включени" : "изключени"}</div> : null}
                {event.location ? <div>Локация: {event.location}</div> : null}
                {event.description ? <div className="border-t border-gray-100 pt-2 dark:border-zinc-800">{event.description}</div> : null}
            </div>
        </div>
    )
}

export default function CalendarAdmin() {
    const initialDate = useMemo(() => getInitialDate(), [])
    const initialContactRequestId = useMemo(() => getInitialContactRequestId(), [])
    const { showToast } = useAdminToast()

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
    const [viewDate, setViewDate] = useState(() => initialDate)
    const [selectedDate, setSelectedDate] = useState(() => initialDate)
    const [form, setForm] = useState<CalendarForm>(() => ({
        ...defaultForm,
        startDate: toDateInputValue(initialDate),
        endDate: toDateInputValue(initialDate),
    }))
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState("")

    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
    const selectedDateEvents = useMemo(
        () => events
            .filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate))
            .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()),
        [events, selectedDate]
    )
    const selectedDateLabel = selectedDate.toLocaleDateString("bg-BG", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const setStringField = (field: Exclude<keyof CalendarForm, "remindersEnabled">, value: string) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const setReminderField = (value: boolean) => {
        setForm((current) => ({ ...current, remindersEnabled: value }))
    }

    const applyContactRequestToForm = (request: ContactRequest) => {
        setEditingId(null)
        setForm((current) => ({
            ...current,
            title: request.subject?.trim() || `Фотосесия - ${request.name}`,
            eventType: "Photoshoot",
            clientName: request.name || "",
            clientPhone: request.phone || "",
            clientEmail: request.email || "",
            contactRequestId: request.id,
            description: request.message || "",
            remindersEnabled: true,
        }))
        showToast({ type: "success", title: "Импорт", message: "Заявката е заредена във формата. Избери дата/час и запази събитието." })
    }

    const loadEvents = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await apiFetch(API_PATH, { method: "GET", skipJsonContentType: true })
            if (!response.ok) throw new Error("Грешка при зареждане на календара.")

            const data: unknown = await response.json().catch(() => [])
            setEvents(Array.isArray(data) ? data as CalendarEvent[] : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на календара."
            setError(message)
            setEvents([])
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setLoading(false)
        }
    }

    const loadContactRequests = async () => {
        const response = await apiFetch(`${API_PATH}/contact-requests`, { method: "GET", skipJsonContentType: true })
        if (!response.ok) return [] as ContactRequest[]

        const data: unknown = await response.json().catch(() => [])
        const items = Array.isArray(data) ? data as ContactRequest[] : []
        setContactRequests(items)
        return items
    }

    useEffect(() => {
        const init = async () => {
            await loadEvents()
            const items = await loadContactRequests()

            if (!initialContactRequestId) return

            const importedRequest = items.find((item) => item.id === initialContactRequestId)
            if (importedRequest) applyContactRequestToForm(importedRequest)
        }

        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startNewEvent = (date = selectedDate) => {
        setEditingId(null)
        setSelectedDate(date)
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
        setForm({ ...defaultForm, startDate: toDateInputValue(date), endDate: toDateInputValue(date) })
    }

    const selectDay = (date: Date) => {
        setSelectedDate(date)

        if (!editingId) {
            setForm((current) => ({ ...current, startDate: toDateInputValue(date), endDate: toDateInputValue(date) }))
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setForm({ ...defaultForm, startDate: toDateInputValue(selectedDate), endDate: toDateInputValue(selectedDate) })
    }

    const editEvent = (event: CalendarEvent) => {
        const start = new Date(event.startAtUtc)
        setEditingId(event.id)
        setSelectedDate(start)
        setViewDate(new Date(start.getFullYear(), start.getMonth(), 1))
        setForm(toLocalInputValues(event))
    }

    const saveEvent = async () => {
        setSaving(true)
        setError("")

        try {
            if (!form.title.trim()) throw new Error("Заглавието е задължително.")
            if (form.remindersEnabled && form.eventType === "Photoshoot" && !form.clientEmail.trim()) {
                throw new Error("За email напомняния е нужен имейл на клиента.")
            }

            const payload = {
                title: form.title.trim(),
                eventType: form.eventType,
                assignedTo: form.assignedTo.trim() || null,
                clientName: form.clientName.trim() || null,
                clientPhone: form.clientPhone.trim() || null,
                clientEmail: form.clientEmail.trim() || null,
                contactRequestId: form.contactRequestId || null,
                location: form.location.trim() || null,
                description: form.description.trim() || null,
                color: form.color.trim() || null,
                remindersEnabled: form.remindersEnabled,
                startAtUtc: combineLocalDateTime(form.startDate, form.startTime),
                endAtUtc: combineLocalDateTime(form.endDate, form.endTime),
            }

            const response = await apiFetch(editingId ? `${API_PATH}/${editingId}` : API_PATH, {
                method: editingId ? "PUT" : "POST",
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || "Записът беше неуспешен.")
            }

            await loadEvents()
            resetForm()
            showToast({ type: "success", title: "Готово", message: editingId ? "Събитието беше обновено." : "Събитието беше добавено в календара." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Записът беше неуспешен."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setSaving(false)
        }
    }

    const deleteEvent = async (id: number) => {
        setDeletingId(id)
        setError("")

        try {
            const response = await apiFetch(`${API_PATH}/${id}`, { method: "DELETE" })
            if (!response.ok && response.status !== 204) throw new Error("Изтриването беше неуспешно.")

            setEvents((current) => current.filter((event) => event.id !== id))
            if (editingId === id) resetForm()
            showToast({ type: "success", title: "Готово", message: "Събитието беше изтрито." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Изтриването беше неуспешно."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setDeletingId(null)
        }
    }

    const changeMonth = (offset: number) => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Календар</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">Управление на фотосесии, принт заявки и email напомняния.</p>
                </div>
                <button type="button" onClick={() => { void loadEvents(); void loadContactRequests() }} className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">Обнови</button>
            </div>

            {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

            <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => changeMonth(-1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Назад</button>
                            <h2 className="min-w-[170px] text-center text-xl font-bold text-gray-900 dark:text-white">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                            <button type="button" onClick={() => changeMonth(1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Напред</button>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                            <span className="font-bold">Избран ден:</span> {selectedDateLabel}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                        {weekdayNames.map((name) => <div key={name} className="py-2">{name}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {monthGrid.map((date) => {
                            const dayEvents = events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                            const isSelected = isSameDay(date, selectedDate)
                            const isPast = isPastDate(date)

                            return (
                                <div key={date.toISOString()} role="button" tabIndex={0} onClick={() => selectDay(date)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectDay(date) }} className={`group/day min-h-[118px] cursor-pointer rounded-2xl border p-2 text-left transition hover:border-sky-400 hover:bg-sky-50 ${isSelected ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : isPast ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-200 bg-white"} ${!isCurrentMonth ? "opacity-45" : ""}`} title={dayEvents.length ? `${dayEvents.length} събития` : "Няма събития"}>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className={`text-sm font-bold ${isPast ? "text-gray-400" : "text-gray-900"}`}>{date.getDate()}</div>
                                        <button type="button" onClick={(event) => { event.stopPropagation(); startNewEvent(date) }} className={`${isSelected ? "inline-flex" : "hidden group-hover/day:inline-flex"} rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white`}>+ Добави</button>
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => {
                                            const eventIsPast = isPastEvent(event)

                                            return (
                                                <button key={event.id} type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); editEvent(event) }} className={`group/event relative block w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-semibold ${eventIsPast ? "bg-gray-400 text-white opacity-70" : "text-white"}`} style={eventIsPast ? undefined : { backgroundColor: event.color || "#2563eb" }} title={getHoverDetails(event)}>
                                                    {toTimeInputValue(new Date(event.startAtUtc))} {event.title}{event.assignedTo ? ` • ${event.assignedTo}` : ""}{event.clientEmail && event.remindersEnabled ? " ✉" : ""}
                                                    <EventTooltip event={event} />
                                                </button>
                                            )
                                        })}
                                        {dayEvents.length > 3 ? <div className="text-[11px] font-semibold text-gray-500">+{dayEvents.length - 3} още</div> : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Избран ден</p>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDateLabel}</h2>
                                <p className="mt-1 text-sm text-gray-500">{selectedDateEvents.length ? `${selectedDateEvents.length} събития` : "Няма събития"}</p>
                            </div>
                            <button type="button" onClick={() => startNewEvent(selectedDate)} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white">+ Добави събитие</button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? "Редакция" : "Ново събитие"}</h2>
                            {editingId ? <button type="button" onClick={resetForm} className="text-sm font-semibold text-gray-500">Откажи</button> : null}
                        </div>

                        <div className="space-y-4">
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Импорт от заявка</span><select value={form.contactRequestId} onChange={(event) => { const request = contactRequests.find((item) => item.id === event.target.value); if (request) applyContactRequestToForm(request); else setStringField("contactRequestId", "") }} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="">— Без свързана заявка —</option>{contactRequests.map((request) => <option key={request.id} value={request.id}>{request.name} · {request.email} · {request.subject || "Без тема"}</option>)}</select></label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Заглавие</span><input value={form.title} onChange={(event) => setStringField("title", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Тип</span><select value={form.eventType} onChange={(event) => setStringField("eventType", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="Photoshoot">Фотосесия</option><option value="Print">Принт на снимки</option></select></label>
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Ангажимент към</span><select value={form.assignedTo} onChange={(event) => setStringField("assignedTo", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="">—</option><option value="Десислав">Десислав</option><option value="Теодор">Теодор</option><option value="Десислав и Теодор">Десислав и Теодор</option></select></label>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Клиент</span><input value={form.clientName} onChange={(event) => setStringField("clientName", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Телефон</span><input value={form.clientPhone} onChange={(event) => setStringField("clientPhone", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Email за напомняне</span><input type="email" value={form.clientEmail} onChange={(event) => setStringField("clientEmail", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" placeholder="client@email.com" /></label>
                            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.remindersEnabled} onChange={(event) => setReminderField(event.target.checked)} className="h-4 w-4" /> Прати напомняния 24 часа и 2 часа преди фотосесията</label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Локация</span><input value={form.location} onChange={(event) => setStringField("location", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" placeholder="Търговски комплекс Ялта, Русе" /></label>
                            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Начало дата</span><input type="date" value={form.startDate} onChange={(event) => setStringField("startDate", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Начало час</span><input type="time" value={form.startTime} onChange={(event) => setStringField("startTime", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Край дата</span><input type="date" value={form.endDate} onChange={(event) => setStringField("endDate", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Край час</span><input type="time" value={form.endTime} onChange={(event) => setStringField("endTime", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Цвят</span><input type="color" value={form.color} onChange={(event) => setStringField("color", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-2 py-1" /></label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Бележки</span><textarea value={form.description} onChange={(event) => setStringField("description", event.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" /></label>
                            <button type="button" onClick={() => void saveEvent()} disabled={saving} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Записване..." : editingId ? "Запази промените" : "Добави събитие"}</button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Събития за {selectedDate.toLocaleDateString("bg-BG")}</h2>
                        {loading ? <div className="text-sm text-gray-500">Зареждане...</div> : null}
                        {!loading && !selectedDateEvents.length ? <div className="text-sm text-gray-500">Няма събития за тази дата.</div> : null}
                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => {
                                const eventIsPast = isPastEvent(event)

                                return <div key={event.id} className={`rounded-2xl border p-4 ${eventIsPast ? "border-gray-200 bg-gray-100 opacity-70" : "border-gray-200 bg-gray-50"}`} title={getHoverDetails(event)}><div className="mb-2 flex items-start justify-between gap-3"><div><h3 className={eventIsPast ? "font-bold text-gray-500" : "font-bold text-gray-900"}>{event.title}</h3><p className="text-xs text-gray-500">{getEventTypeLabel(event.eventType)} • {formatDateTime(event.startAtUtc)} - {formatDateTime(event.endAtUtc)}</p></div><span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: eventIsPast ? "#9ca3af" : event.color || "#2563eb" }} /></div>{eventIsPast ? <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">Минало</p> : null}{event.assignedTo ? <p className="text-sm text-gray-700">Ангажимент към: {event.assignedTo}</p> : null}{event.clientName || event.clientPhone ? <p className="text-sm text-gray-700">{event.clientName} {event.clientPhone ? `• ${event.clientPhone}` : ""}</p> : null}{event.clientEmail ? <p className="text-sm text-gray-700">Email: {event.clientEmail} {event.remindersEnabled ? "• напомняния включени" : "• напомняния изключени"}</p> : null}{event.location ? <p className="mt-1 text-sm text-gray-700">{event.location}</p> : null}{event.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{event.description}</p> : null}<div className="mt-4 flex gap-2"><button type="button" onClick={() => editEvent(event)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">Редактирай</button><button type="button" onClick={() => void deleteEvent(event.id)} disabled={deletingId === event.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60">{deletingId === event.id ? "Трие..." : "Изтрий"}</button></div></div>
                            })}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
