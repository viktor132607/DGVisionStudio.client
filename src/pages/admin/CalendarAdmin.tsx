import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"
import { useAdminToast } from "../../hooks/useAdminToast"

const API_PATH = "/admin/calendar"
const monthNames = ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"]
const weekdayNames = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]

const fallbackEventTypes: CalendarEventType[] = [
    { code: "Photoshoot", name: "Фотосесия", color: "#2563eb", isSystem: true },
    { code: "Print", name: "Принт на снимки", color: "#f97316", isSystem: true },
]

type CalendarEventType = {
    code: string
    name: string
    color: string
    isSystem: boolean
}

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

type EventTypeDraft = {
    name: string
    color: string
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

function makeDefaultForm(date: Date, eventType: CalendarEventType): CalendarForm {
    return {
        title: "",
        eventType: eventType.code,
        assignedTo: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        contactRequestId: "",
        location: "",
        description: "",
        color: eventType.color,
        remindersEnabled: true,
        startDate: toDateInputValue(date),
        startTime: "10:00",
        endDate: toDateInputValue(date),
        endTime: "12:00",
    }
}

export default function CalendarAdmin() {
    const initialDate = useMemo(() => getInitialDate(), [])
    const initialContactRequestId = useMemo(() => getInitialContactRequestId(), [])
    const { showToast } = useAdminToast()

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [eventTypes, setEventTypes] = useState<CalendarEventType[]>(fallbackEventTypes)
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
    const [viewDate, setViewDate] = useState(() => initialDate)
    const [selectedDate, setSelectedDate] = useState(() => initialDate)
    const [form, setForm] = useState<CalendarForm>(() => makeDefaultForm(initialDate, fallbackEventTypes[0]))
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState("")
    const [typeDrafts, setTypeDrafts] = useState<Record<string, EventTypeDraft>>({})
    const [newTypeName, setNewTypeName] = useState("")
    const [newTypeColor, setNewTypeColor] = useState("#16a34a")
    const [typeBusy, setTypeBusy] = useState<string | null>(null)

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

    const findEventType = (code?: string | null) =>
        eventTypes.find((type) => type.code.toLowerCase() === (code || "").toLowerCase())

    const getEventTypeLabel = (code?: string | null) => {
        const found = findEventType(code)
        if (found) return found.name
        if (code === "Print") return "Принт на снимки"
        if (code === "Photoshoot" || !code) return "Фотосесия"
        return code
    }

    const getEventColor = (event: CalendarEvent) =>
        findEventType(event.eventType)?.color || event.color || "#2563eb"

    const getHoverDetails = (event: CalendarEvent) => [
        event.title,
        isPastEvent(event) ? "Статус: Минало" : "Статус: Предстоящо",
        `Тип: ${getEventTypeLabel(event.eventType)}`,
        `Начало: ${formatDateTime(event.startAtUtc)}`,
        `Край: ${formatDateTime(event.endAtUtc)}`,
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.clientEmail ? `Email: ${event.clientEmail}` : "",
        event.assignedTo ? `Ангажимент към: ${event.assignedTo}` : "",
        event.location ? `Локация: ${event.location}` : "",
        event.description ? `Бележки: ${event.description}` : "",
    ].filter(Boolean).join("\n")

    const setStringField = (field: Exclude<keyof CalendarForm, "remindersEnabled">, value: string) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const loadEvents = async () => {
        const response = await apiFetch(API_PATH, { method: "GET", skipJsonContentType: true })
        if (!response.ok) throw new Error("Грешка при зареждане на календара.")
        const data: unknown = await response.json().catch(() => [])
        const items = Array.isArray(data) ? data as CalendarEvent[] : []
        setEvents(items)
        return items
    }

    const loadEventTypes = async () => {
        const response = await apiFetch(`${API_PATH}/event-types`, { method: "GET", skipJsonContentType: true })
        if (!response.ok) throw new Error("Грешка при зареждане на типовете.")
        const data: unknown = await response.json().catch(() => [])
        const items = Array.isArray(data) && data.length ? data as CalendarEventType[] : fallbackEventTypes
        setEventTypes(items)
        setTypeDrafts(Object.fromEntries(items.map((type) => [type.code, { name: type.name, color: type.color }])))
        return items
    }

    const loadContactRequests = async () => {
        const response = await apiFetch(`${API_PATH}/contact-requests`, { method: "GET", skipJsonContentType: true })
        if (!response.ok) return [] as ContactRequest[]
        const data: unknown = await response.json().catch(() => [])
        const items = Array.isArray(data) ? data as ContactRequest[] : []
        setContactRequests(items)
        return items
    }

    const loadAll = async () => {
        setLoading(true)
        setError("")
        try {
            const [, types, requests] = await Promise.all([loadEvents(), loadEventTypes(), loadContactRequests()])
            setForm((current) => {
                const selectedType = types.find((type) => type.code === current.eventType) || types[0]
                return selectedType ? { ...current, eventType: selectedType.code, color: selectedType.color } : current
            })
            return requests
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на календара."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
            return [] as ContactRequest[]
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const init = async () => {
            const requests = await loadAll()
            if (!initialContactRequestId) return
            const importedRequest = requests.find((item) => item.id === initialContactRequestId)
            if (importedRequest) applyContactRequestToForm(importedRequest)
        }
        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const applyContactRequestToForm = (request: ContactRequest) => {
        const photoshootType = eventTypes.find((type) => type.code === "Photoshoot") || eventTypes[0]
        setEditingId(null)
        setForm((current) => ({
            ...current,
            title: request.subject?.trim() || `Фотосесия - ${request.name}`,
            eventType: photoshootType?.code || "Photoshoot",
            color: photoshootType?.color || "#2563eb",
            clientName: request.name || "",
            clientPhone: request.phone || "",
            clientEmail: request.email || "",
            contactRequestId: request.id,
            description: request.message || "",
            remindersEnabled: true,
        }))
        showToast({ type: "success", title: "Импорт", message: "Заявката е заредена във формата." })
    }

    const resetForm = (date = selectedDate) => {
        setEditingId(null)
        setForm(makeDefaultForm(date, eventTypes[0] || fallbackEventTypes[0]))
    }

    const startNewEvent = (date = selectedDate) => {
        setSelectedDate(date)
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
        resetForm(date)
    }

    const selectDay = (date: Date) => {
        setSelectedDate(date)
        if (!editingId) {
            setForm((current) => ({ ...current, startDate: toDateInputValue(date), endDate: toDateInputValue(date) }))
        }
    }

    const editEvent = (event: CalendarEvent) => {
        const start = new Date(event.startAtUtc)
        const end = new Date(event.endAtUtc)
        const type = findEventType(event.eventType)
        setEditingId(event.id)
        setSelectedDate(start)
        setViewDate(new Date(start.getFullYear(), start.getMonth(), 1))
        setForm({
            title: event.title || "",
            eventType: event.eventType || eventTypes[0]?.code || "Photoshoot",
            assignedTo: event.assignedTo || "",
            clientName: event.clientName || "",
            clientPhone: event.clientPhone || "",
            clientEmail: event.clientEmail || "",
            contactRequestId: event.contactRequestId || "",
            location: event.location || "",
            description: event.description || "",
            color: type?.color || event.color || "#2563eb",
            remindersEnabled: event.remindersEnabled ?? true,
            startDate: toDateInputValue(start),
            startTime: toTimeInputValue(start),
            endDate: toDateInputValue(end),
            endTime: toTimeInputValue(end),
        })
    }

    const changeEventType = (code: string) => {
        const type = eventTypes.find((item) => item.code === code)
        setForm((current) => ({ ...current, eventType: code, color: type?.color || current.color }))
    }

    const saveEvent = async () => {
        setSaving(true)
        setError("")
        try {
            if (!form.title.trim()) throw new Error("Заглавието е задължително.")
            if (form.remindersEnabled && form.eventType === "Photoshoot" && !form.clientEmail.trim()) {
                throw new Error("За email напомняния е нужен имейл на клиента.")
            }

            const selectedType = findEventType(form.eventType)
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
                color: selectedType?.color || form.color,
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
            showToast({ type: "success", title: "Готово", message: editingId ? "Събитието беше обновено." : "Събитието беше добавено." })
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
        try {
            const response = await apiFetch(`${API_PATH}/${id}`, { method: "DELETE" })
            if (!response.ok && response.status !== 204) throw new Error("Изтриването беше неуспешно.")
            setEvents((current) => current.filter((event) => event.id !== id))
            if (editingId === id) resetForm()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Изтриването беше неуспешно."
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setDeletingId(null)
        }
    }

    const createEventType = async () => {
        setTypeBusy("new")
        try {
            const response = await apiFetch(`${API_PATH}/event-types`, {
                method: "POST",
                body: JSON.stringify({ name: newTypeName, color: newTypeColor }),
            })
            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || "Типът не беше добавен.")
            }
            const created = await response.json() as CalendarEventType
            setNewTypeName("")
            await loadEventTypes()
            setForm((current) => ({ ...current, eventType: created.code, color: created.color }))
            showToast({ type: "success", title: "Готово", message: "Новият тип беше добавен." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Типът не беше добавен."
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setTypeBusy(null)
        }
    }

    const updateEventType = async (type: CalendarEventType) => {
        const draft = typeDrafts[type.code]
        if (!draft) return
        setTypeBusy(type.code)
        try {
            const response = await apiFetch(`${API_PATH}/event-types/${encodeURIComponent(type.code)}`, {
                method: "PUT",
                body: JSON.stringify(draft),
            })
            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || "Типът не беше обновен.")
            }
            const updated = await response.json() as CalendarEventType
            await Promise.all([loadEventTypes(), loadEvents()])
            setForm((current) => current.eventType === type.code
                ? { ...current, eventType: updated.code, color: updated.color }
                : current)
            showToast({ type: "success", title: "Готово", message: "Типът беше обновен." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Типът не беше обновен."
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setTypeBusy(null)
        }
    }

    const deleteEventType = async (type: CalendarEventType) => {
        setTypeBusy(type.code)
        try {
            const response = await apiFetch(`${API_PATH}/event-types/${encodeURIComponent(type.code)}`, { method: "DELETE" })
            if (!response.ok && response.status !== 204) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || "Типът не беше изтрит.")
            }
            const types = await loadEventTypes()
            if (form.eventType === type.code && types[0]) {
                setForm((current) => ({ ...current, eventType: types[0].code, color: types[0].color }))
            }
            showToast({ type: "success", title: "Готово", message: "Типът беше изтрит." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Типът не беше изтрит."
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setTypeBusy(null)
        }
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Календар</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">Управление на събития, типове и цветове.</p>
                </div>
                <button type="button" onClick={() => void loadAll()} className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700">Обнови</button>
            </div>

            {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

            <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">Назад</button>
                            <h2 className="min-w-[170px] text-center text-xl font-bold text-gray-900 dark:text-white">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                            <button type="button" onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">Напред</button>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"><span className="font-bold">Избран ден:</span> {selectedDateLabel}</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                        {weekdayNames.map((name) => <div key={name} className="py-2">{name}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {monthGrid.map((date) => {
                            const dayEvents = events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                            const isSelected = isSameDay(date, selectedDate)
                            const isPast = isPastDate(date)
                            return (
                                <div key={date.toISOString()} role="button" tabIndex={0} onClick={() => selectDay(date)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectDay(date) }} className={`group/day min-h-[118px] cursor-pointer rounded-2xl border p-2 text-left transition ${isSelected ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : isPast ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-200 bg-white"} ${!isCurrentMonth ? "opacity-45" : ""}`}>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="text-sm font-bold">{date.getDate()}</div>
                                        <button type="button" onClick={(event) => { event.stopPropagation(); startNewEvent(date) }} className={`${isSelected ? "inline-flex" : "hidden group-hover/day:inline-flex"} rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white`}>+ Добави</button>
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => {
                                            const past = isPastEvent(event)
                                            return <button key={event.id} type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); editEvent(event) }} className={`block w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-white ${past ? "opacity-60" : ""}`} style={{ backgroundColor: past ? "#9ca3af" : getEventColor(event) }} title={getHoverDetails(event)}>{toTimeInputValue(new Date(event.startAtUtc))} {event.title}</button>
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
                            <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Избран ден</p><h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDateLabel}</h2><p className="mt-1 text-sm text-gray-500">{selectedDateEvents.length ? `${selectedDateEvents.length} събития` : "Няма събития"}</p></div>
                            <button type="button" onClick={() => startNewEvent(selectedDate)} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white">+ Добави</button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Типове събития</h2>
                        <div className="space-y-3">
                            {eventTypes.map((type) => {
                                const draft = typeDrafts[type.code] || { name: type.name, color: type.color }
                                return (
                                    <div key={type.code} className="rounded-xl border border-gray-200 p-3">
                                        <div className="grid gap-2 sm:grid-cols-[1fr_54px_auto]">
                                            <input value={draft.name} disabled={type.isSystem} onChange={(event) => setTypeDrafts((current) => ({ ...current, [type.code]: { ...draft, name: event.target.value } }))} className="h-10 rounded-lg border border-gray-300 px-3 text-sm disabled:bg-gray-100" />
                                            <input type="color" value={draft.color} onChange={(event) => setTypeDrafts((current) => ({ ...current, [type.code]: { ...draft, color: event.target.value } }))} className="h-10 w-full rounded-lg border border-gray-300 p-1" />
                                            <button type="button" onClick={() => void updateEventType(type)} disabled={typeBusy === type.code} className="rounded-lg bg-gray-900 px-3 text-xs font-bold text-white disabled:opacity-50">Запази</button>
                                        </div>
                                        {!type.isSystem ? <button type="button" onClick={() => void deleteEventType(type)} disabled={typeBusy === type.code} className="mt-2 text-xs font-bold text-red-600 disabled:opacity-50">Изтрий типа</button> : null}
                                    </div>
                                )
                            })}
                            <div className="rounded-xl border border-dashed border-gray-300 p-3">
                                <div className="grid gap-2 sm:grid-cols-[1fr_54px_auto]">
                                    <input value={newTypeName} onChange={(event) => setNewTypeName(event.target.value)} placeholder="Нов тип" maxLength={40} className="h-10 rounded-lg border border-gray-300 px-3 text-sm" />
                                    <input type="color" value={newTypeColor} onChange={(event) => setNewTypeColor(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 p-1" />
                                    <button type="button" onClick={() => void createEventType()} disabled={typeBusy === "new" || !newTypeName.trim()} className="rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white disabled:opacity-50">Добави</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? "Редакция" : "Ново събитие"}</h2>{editingId ? <button type="button" onClick={() => resetForm()} className="text-sm font-semibold text-gray-500">Откажи</button> : null}</div>
                        <div className="space-y-4">
                            <label className="block"><span className="mb-1 block text-sm font-semibold">Импорт от заявка</span><select value={form.contactRequestId} onChange={(event) => { const request = contactRequests.find((item) => item.id === event.target.value); if (request) applyContactRequestToForm(request); else setStringField("contactRequestId", "") }} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="">— Без свързана заявка —</option>{contactRequests.map((request) => <option key={request.id} value={request.id}>{request.name} · {request.email} · {request.subject || "Без тема"}</option>)}</select></label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold">Заглавие</span><input value={form.title} onChange={(event) => setStringField("title", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block"><span className="mb-1 block text-sm font-semibold">Тип</span><select value={form.eventType} onChange={(event) => changeEventType(event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm">{eventTypes.map((type) => <option key={type.code} value={type.code}>{type.name}</option>)}</select><span className="mt-2 flex items-center gap-2 text-xs text-gray-500"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: findEventType(form.eventType)?.color || form.color }} /> Цветът се задава от типа</span></label>
                                <label className="block"><span className="mb-1 block text-sm font-semibold">Ангажимент към</span><select value={form.assignedTo} onChange={(event) => setStringField("assignedTo", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="">—</option><option value="Десислав">Десислав</option><option value="Теодор">Теодор</option><option value="Десислав и Теодор">Десислав и Теодор</option></select></label>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Клиент</span><input value={form.clientName} onChange={(event) => setStringField("clientName", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label><span className="mb-1 block text-sm font-semibold">Телефон</span><input value={form.clientPhone} onChange={(event) => setStringField("clientPhone", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold">Email за напомняне</span><input type="email" value={form.clientEmail} onChange={(event) => setStringField("clientEmail", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold"><input type="checkbox" checked={form.remindersEnabled} onChange={(event) => setForm((current) => ({ ...current, remindersEnabled: event.target.checked }))} className="h-4 w-4" /> Прати напомняния</label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold">Локация</span><input value={form.location} onChange={(event) => setStringField("location", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Начало дата</span><input type="date" value={form.startDate} onChange={(event) => setStringField("startDate", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label><span className="mb-1 block text-sm font-semibold">Начало час</span><input type="time" value={form.startTime} onChange={(event) => setStringField("startTime", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Край дата</span><input type="date" value={form.endDate} onChange={(event) => setStringField("endDate", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label><span className="mb-1 block text-sm font-semibold">Край час</span><input type="time" value={form.endTime} onChange={(event) => setStringField("endTime", event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold">Бележки</span><textarea value={form.description} onChange={(event) => setStringField("description", event.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" /></label>
                            <button type="button" onClick={() => void saveEvent()} disabled={saving} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Записване..." : editingId ? "Запази промените" : "Добави събитие"}</button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Събития за {selectedDate.toLocaleDateString("bg-BG")}</h2>
                        {loading ? <div className="text-sm text-gray-500">Зареждане...</div> : null}
                        {!loading && !selectedDateEvents.length ? <div className="text-sm text-gray-500">Няма събития за тази дата.</div> : null}
                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => <div key={event.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4" title={getHoverDetails(event)}><div className="mb-2 flex items-start justify-between gap-3"><div><h3 className="font-bold text-gray-900">{event.title}</h3><p className="text-xs text-gray-500">{getEventTypeLabel(event.eventType)} • {formatDateTime(event.startAtUtc)} - {formatDateTime(event.endAtUtc)}</p></div><span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: isPastEvent(event) ? "#9ca3af" : getEventColor(event) }} /></div>{event.assignedTo ? <p className="text-sm">Ангажимент към: {event.assignedTo}</p> : null}{event.clientName || event.clientPhone ? <p className="text-sm">{event.clientName} {event.clientPhone ? `• ${event.clientPhone}` : ""}</p> : null}{event.location ? <p className="mt-1 text-sm">{event.location}</p> : null}{event.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{event.description}</p> : null}<div className="mt-4 flex gap-2"><button type="button" onClick={() => editEvent(event)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold">Редактирай</button><button type="button" onClick={() => void deleteEvent(event.id)} disabled={deletingId === event.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60">{deletingId === event.id ? "Трие..." : "Изтрий"}</button></div></div>)}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
