import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"
import { useAdminToast } from "../../hooks/useAdminToast"

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

const defaultForm = {
    title: "",
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
    description?: string | null
    location?: string | null
    clientName?: string | null
    clientPhone?: string | null
    color?: string | null
    startAtUtc: string
    endAtUtc: string
    createdAtUtc?: string
    updatedAtUtc?: string | null
}

type CalendarForm = typeof defaultForm

function toDateInputValue(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

function toTimeInputValue(date: Date) {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
}

function toLocalInputValues(event: CalendarEvent): CalendarForm {
    const start = new Date(event.startAtUtc)
    const end = new Date(event.endAtUtc)

    return {
        title: event.title || "",
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

function combineLocalDateTime(date: string, time: string) {
    return new Date(`${date}T${time || "00:00"}`).toISOString()
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

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

export default function CalendarAdmin() {
    const { showToast } = useAdminToast()
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [viewDate, setViewDate] = useState(() => new Date())
    const [selectedDate, setSelectedDate] = useState(() => new Date())
    const [form, setForm] = useState<CalendarForm>(() => ({
        ...defaultForm,
        startDate: toDateInputValue(new Date()),
        endDate: toDateInputValue(new Date()),
    }))
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState("")

    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])

    const selectedDateEvents = useMemo(() => {
        return events
            .filter((event) => isSameDay(new Date(event.startAtUtc), selectedDate))
            .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime())
    }, [events, selectedDate])

    const loadEvents = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await apiFetch("/admin/shooting-calendar", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Грешка при зареждане на календара.")
            }

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

    useEffect(() => {
        void loadEvents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const setField = (field: keyof CalendarForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const selectDay = (date: Date) => {
        setSelectedDate(date)
        setForm((current) => ({
            ...current,
            startDate: toDateInputValue(date),
            endDate: toDateInputValue(date),
        }))
    }

    const resetForm = () => {
        setEditingId(null)
        setForm({
            ...defaultForm,
            startDate: toDateInputValue(selectedDate),
            endDate: toDateInputValue(selectedDate),
        })
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
            if (!form.title.trim()) {
                throw new Error("Заглавието е задължително.")
            }

            const payload = {
                title: form.title.trim(),
                clientName: form.clientName.trim() || null,
                clientPhone: form.clientPhone.trim() || null,
                location: form.location.trim() || null,
                description: form.description.trim() || null,
                color: form.color.trim() || null,
                startAtUtc: combineLocalDateTime(form.startDate, form.startTime),
                endAtUtc: combineLocalDateTime(form.endDate, form.endTime),
            }

            const response = await apiFetch(
                editingId ? `/admin/shooting-calendar/${editingId}` : "/admin/shooting-calendar",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify(payload),
                }
            )

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || "Записът беше неуспешен.")
            }

            await loadEvents()
            resetForm()

            showToast({
                type: "success",
                title: "Готово",
                message: editingId ? "Снимането беше обновено." : "Снимането беше добавено в календара.",
            })
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
            const response = await apiFetch(`/admin/shooting-calendar/${id}`, {
                method: "DELETE",
            })

            if (!response.ok && response.status !== 204) {
                throw new Error("Изтриването беше неуспешно.")
            }

            setEvents((current) => current.filter((event) => event.id !== id))
            if (editingId === id) resetForm()

            showToast({ type: "success", title: "Готово", message: "Снимането беше изтрито." })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Изтриването беше неуспешно."
            setError(message)
            showToast({ type: "error", title: "Грешка", message })
        } finally {
            setDeletingId(null)
        }
    }

    const changeMonth = (offset: number) => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Календар за снимки
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">
                        Добавяне и управление на дати за фотосесии.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadEvents()}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                    Обнови
                </button>
            </div>

            {error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Назад
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
                            const isSelected = isSameDay(date, selectedDate)

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    onClick={() => selectDay(date)}
                                    className={`min-h-[105px] rounded-2xl border p-2 text-left transition hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 ${
                                        isSelected
                                            ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100 dark:border-sky-400 dark:bg-sky-500/10 dark:ring-sky-500/20"
                                            : "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                                    } ${!isCurrentMonth ? "opacity-45" : ""}`}
                                >
                                    <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                                        {date.getDate()}
                                    </div>

                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                className="truncate rounded-lg px-2 py-1 text-[11px] font-semibold text-white"
                                                style={{ backgroundColor: event.color || "#2563eb" }}
                                                title={event.title}
                                            >
                                                {toTimeInputValue(new Date(event.startAtUtc))} {event.title}
                                            </div>
                                        ))}

                                        {dayEvents.length > 3 ? (
                                            <div className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                                                +{dayEvents.length - 3} още
                                            </div>
                                        ) : null}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? "Редакция" : "Ново снимане"}
                            </h2>

                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-sm font-semibold text-gray-500 transition hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    Откажи
                                </button>
                            ) : null}
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Заглавие</span>
                                <input
                                    value={form.title}
                                    onChange={(e) => setField("title", e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    placeholder="Сватба, кръщене, фотосесия..."
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Клиент</span>
                                    <input
                                        value={form.clientName}
                                        onChange={(e) => setField("clientName", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Телефон</span>
                                    <input
                                        value={form.clientPhone}
                                        onChange={(e) => setField("clientPhone", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Локация</span>
                                <input
                                    value={form.location}
                                    onChange={(e) => setField("location", e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Начало дата</span>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => setField("startDate", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Начало час</span>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setField("startTime", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Край дата</span>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => setField("endDate", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Край час</span>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setField("endTime", e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Цвят</span>
                                <input
                                    type="color"
                                    value={form.color}
                                    onChange={(e) => setField("color", e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Бележки</span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setField("description", e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-sky-900/40"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => void saveEvent()}
                                disabled={saving}
                                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {saving ? "Записване..." : editingId ? "Запази промените" : "Добави снимане"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            Събития за {selectedDate.toLocaleDateString("bg-BG")}
                        </h2>

                        {loading ? (
                            <div className="text-sm text-gray-500 dark:text-zinc-400">Зареждане...</div>
                        ) : null}

                        {!loading && !selectedDateEvents.length ? (
                            <div className="text-sm text-gray-500 dark:text-zinc-400">Няма снимки за тази дата.</div>
                        ) : null}

                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{event.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                {formatDateTime(event.startAtUtc)} - {formatDateTime(event.endAtUtc)}
                                            </p>
                                        </div>

                                        <span
                                            className="mt-1 h-4 w-4 rounded-full"
                                            style={{ backgroundColor: event.color || "#2563eb" }}
                                        />
                                    </div>

                                    {event.clientName || event.clientPhone ? (
                                        <p className="text-sm text-gray-700 dark:text-zinc-300">
                                            {event.clientName} {event.clientPhone ? `• ${event.clientPhone}` : ""}
                                        </p>
                                    ) : null}

                                    {event.location ? (
                                        <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300">{event.location}</p>
                                    ) : null}

                                    {event.description ? (
                                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-zinc-400">
                                            {event.description}
                                        </p>
                                    ) : null}

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => editEvent(event)}
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        >
                                            Редактирай
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => void deleteEvent(event.id)}
                                            disabled={deletingId === event.id}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                                        >
                                            {deletingId === event.id ? "Трие..." : "Изтрий"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
