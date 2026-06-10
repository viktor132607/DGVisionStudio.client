import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"
import { useAdminToast } from "../../hooks/useAdminToast"

const monthNames = ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"]
const weekdayNames = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]

const defaultForm = {
    title: "",
    eventType: "Photoshoot",
    assignedTo: "",
    clientName: "",
    clientPhone: "",
    location: "",
    description: "",
    color: "#2563eb",
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "12:00",
}

type CalendarEvent = {
    id: number
    title: string
    eventType?: string | null
    assignedTo?: string | null
    description?: string | null
    location?: string | null
    clientName?: string | null
    clientPhone?: string | null
    color?: string | null
    startAtUtc: string
    endAtUtc: string
}

type CalendarForm = typeof defaultForm

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

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function getEventTypeLabel(type?: string | null) {
    return type === "Print" ? "Принт на снимки" : "Фотосесия"
}

function getHoverDetails(event: CalendarEvent) {
    return [
        event.title,
        `Тип: ${getEventTypeLabel(event.eventType)}`,
        `Начало: ${formatDateTime(event.startAtUtc)}`,
        `Край: ${formatDateTime(event.endAtUtc)}`,
        event.clientName ? `Клиент: ${event.clientName}` : "",
        event.clientPhone ? `Телефон: ${event.clientPhone}` : "",
        event.assignedTo ? `Отговорник: ${event.assignedTo}` : "",
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
        location: event.location || "",
        description: event.description || "",
        color: event.color || "#2563eb",
        startDate: toDateInputValue(start),
        startTime: toTimeInputValue(start),
        endDate: toDateInputValue(end),
        endTime: toTimeInputValue(end),
    }
}

export default function CalendarAdmin() {
    const { showToast } = useAdminToast()
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [viewDate, setViewDate] = useState(() => new Date())
    const [selectedDate, setSelectedDate] = useState(() => new Date())
    const [form, setForm] = useState<CalendarForm>(() => ({ ...defaultForm, startDate: toDateInputValue(new Date()), endDate: toDateInputValue(new Date()) }))
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState("")

    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
    const selectedDateEvents = useMemo(() => events.filter((e) => isSameDay(new Date(e.startAtUtc), selectedDate)).sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()), [events, selectedDate])

    const loadEvents = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await apiFetch("/admin/shooting-calendar", { method: "GET", skipJsonContentType: true })
            if (!response.ok) throw new Error("Грешка при зареждане на календара.")
            const data = await response.json().catch(() => [])
            setEvents(Array.isArray(data) ? data : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на календара."
            setError(message)
            setEvents([])
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { void loadEvents() }, [])

    const setField = (field: keyof CalendarForm, value: string) => setForm((current) => ({ ...current, [field]: value }))

    const selectDay = (date: Date) => {
        setSelectedDate(date)
        setForm((current) => ({ ...current, startDate: toDateInputValue(date), endDate: toDateInputValue(date) }))
    }

    const resetForm = () => {
        setEditingId(null)
        setForm({ ...defaultForm, startDate: toDateInputValue(selectedDate), endDate: toDateInputValue(selectedDate) })
    }

    const editEvent = (event: CalendarEvent) => {
        const start = new Date(event.startAtUtc)
        setEditingId(event.id)
        setSelectedDate(start)
        setViewDate(start)
        setForm(toLocalInputValues(event))
    }

    const saveEvent = async () => {
        setSaving(true)
        setError("")
        try {
            if (!form.title.trim()) throw new Error("Заглавието е задължително.")
            const payload = {
                title: form.title.trim(),
                eventType: form.eventType,
                assignedTo: form.assignedTo.trim() || null,
                clientName: form.clientName.trim() || null,
                clientPhone: form.clientPhone.trim() || null,
                location: form.location.trim() || null,
                description: form.description.trim() || null,
                color: form.color.trim() || null,
                startAtUtc: combineLocalDateTime(form.startDate, form.startTime),
                endAtUtc: combineLocalDateTime(form.endDate, form.endTime),
            }
            const response = await apiFetch(editingId ? `/admin/shooting-calendar/${editingId}` : "/admin/shooting-calendar", { method: editingId ? "PUT" : "POST", body: JSON.stringify(payload) })
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
            const response = await apiFetch(`/admin/shooting-calendar/${id}`, { method: "DELETE" })
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
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">Управление на фотосесии и принт заявки.</p>
                </div>
                <button type="button" onClick={() => void loadEvents()} className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">Обнови</button>
            </div>

            {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <button type="button" onClick={() => changeMonth(-1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Назад</button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                        <button type="button" onClick={() => changeMonth(1)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Напред</button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                        {weekdayNames.map((name) => <div key={name} className="py-2">{name}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {monthGrid.map((date) => {
                            const dayEvents = events.filter((event) => isSameDay(new Date(event.startAtUtc), date))
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                            const isSelected = isSameDay(date, selectedDate)
                            return (
                                <button key={date.toISOString()} type="button" onClick={() => selectDay(date)} className={`min-h-[105px] rounded-2xl border p-2 text-left transition hover:border-sky-400 hover:bg-sky-50 ${isSelected ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-gray-200 bg-white"} ${!isCurrentMonth ? "opacity-45" : ""}`}>
                                    <div className="mb-2 text-sm font-bold text-gray-900">{date.getDate()}</div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div key={event.id} className="truncate rounded-lg px-2 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: event.color || "#2563eb" }} title={getHoverDetails(event)}>
                                                {toTimeInputValue(new Date(event.startAtUtc))} {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 ? <div className="text-[11px] font-semibold text-gray-500">+{dayEvents.length - 3} още</div> : null}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? "Редакция" : "Ново събитие"}</h2>
                            {editingId ? <button type="button" onClick={resetForm} className="text-sm font-semibold text-gray-500">Откажи</button> : null}
                        </div>

                        <div className="space-y-4">
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Заглавие</span><input value={form.title} onChange={(e) => setField("title", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Тип</span><select value={form.eventType} onChange={(e) => setField("eventType", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"><option value="Photoshoot">Фотосесия</option><option value="Print">Принт на снимки</option></select></label>
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Отговорник</span><input value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" placeholder="Кой се занимава" /></label>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Клиент</span><input value={form.clientName} onChange={(e) => setField("clientName", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                                <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Телефон</span><input value={form.clientPhone} onChange={(e) => setField("clientPhone", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            </div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Локация</span><input value={form.location} onChange={(e) => setField("location", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
                            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Начало дата</span><input type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Начало час</span><input type="time" value={form.startTime} onChange={(e) => setField("startTime", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Край дата</span><input type="date" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label><label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Край час</span><input type="time" value={form.endTime} onChange={(e) => setField("endTime", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label></div>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Цвят</span><input type="color" value={form.color} onChange={(e) => setField("color", e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-2 py-1" /></label>
                            <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Бележки</span><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" /></label>
                            <button type="button" onClick={() => void saveEvent()} disabled={saving} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Записване..." : editingId ? "Запази промените" : "Добави събитие"}</button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Събития за {selectedDate.toLocaleDateString("bg-BG")}</h2>
                        {loading ? <div className="text-sm text-gray-500">Зареждане...</div> : null}
                        {!loading && !selectedDateEvents.length ? <div className="text-sm text-gray-500">Няма събития за тази дата.</div> : null}
                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => (
                                <div key={event.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4" title={getHoverDetails(event)}>
                                    <div className="mb-2 flex items-start justify-between gap-3"><div><h3 className="font-bold text-gray-900">{event.title}</h3><p className="text-xs text-gray-500">{getEventTypeLabel(event.eventType)} • {formatDateTime(event.startAtUtc)} - {formatDateTime(event.endAtUtc)}</p></div><span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: event.color || "#2563eb" }} /></div>
                                    {event.assignedTo ? <p className="text-sm text-gray-700">Отговорник: {event.assignedTo}</p> : null}
                                    {event.clientName || event.clientPhone ? <p className="text-sm text-gray-700">{event.clientName} {event.clientPhone ? `• ${event.clientPhone}` : ""}</p> : null}
                                    {event.location ? <p className="mt-1 text-sm text-gray-700">{event.location}</p> : null}
                                    {event.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{event.description}</p> : null}
                                    <div className="mt-4 flex gap-2"><button type="button" onClick={() => editEvent(event)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">Редактирай</button><button type="button" onClick={() => void deleteEvent(event.id)} disabled={deletingId === event.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60">{deletingId === event.id ? "Трие..." : "Изтрий"}</button></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
