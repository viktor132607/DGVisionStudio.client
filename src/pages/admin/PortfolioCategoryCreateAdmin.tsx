import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch } from "../../services/api"
import { ensureUniqueSlug } from "../../utils/slugify"

type ExistingCategory = {
    id: number
    key: string
    name: string
    nameEn?: string | null
    displayOrder: number
}

export default function PortfolioCategoryCreateAdmin() {
    const navigate = useNavigate()

    const [nameBg, setNameBg] = useState("")
    const [nameEn, setNameEn] = useState("")
    const [key, setKey] = useState("")
    const [displayOrder, setDisplayOrder] = useState(1)
    const [isActive, setIsActive] = useState(true)

    const [existingCategories, setExistingCategories] = useState<ExistingCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [keyTouched, setKeyTouched] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError("")

            try {
                const response = await apiFetch("/portfolio/categories", {
                    method: "GET",
                    skipJsonContentType: true,
                })

                if (!response.ok) {
                    throw new Error("Неуспешно зареждане на категориите.")
                }

                const data = (await response.json().catch(() => [])) as ExistingCategory[]
                const categories = Array.isArray(data) ? data : []

                setExistingCategories(categories)

                const maxDisplayOrder = categories.reduce(
                    (max, item) => Math.max(max, item.displayOrder ?? 0),
                    0
                )

                setDisplayOrder(maxDisplayOrder + 1 || 1)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Неуспешно зареждане на категориите."
                )
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [])

    const usedSlugs = useMemo(
        () => existingCategories.map((item) => item.key).filter(Boolean),
        [existingCategories]
    )

    useEffect(() => {
        if (keyTouched) return
        const source = nameEn.trim() || nameBg.trim()
        setKey(ensureUniqueSlug(source, usedSlugs))
    }, [keyTouched, nameBg, nameEn, usedSlugs])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        const finalNameBg = nameBg.trim()
        const finalNameEn = nameEn.trim()
        const finalKey = ensureUniqueSlug(key.trim() || finalNameEn || finalNameBg, usedSlugs)

        if (!finalNameBg) {
            setError("Името на български е задължително.")
            return
        }

        if (!finalNameEn) {
            setError("Името на английски е задължително.")
            return
        }

        if (!finalKey) {
            setError("Ключът е задължителен.")
            return
        }

        setSaving(true)

        try {
            const response = await apiFetch("/admin/portfolio/categories", {
                method: "POST",
                body: JSON.stringify({
                    name: finalNameBg,
                    nameEn: finalNameEn,
                    key: finalKey,
                    displayOrder,
                    isActive,
                }),
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || "Неуспешно създаване на категория.")
            }

            const created = (await response.json().catch(() => null)) as
                | { id?: number }
                | null

            setSuccess("Категорията беше създадена успешно.")

            if (created?.id) {
                navigate(`/admin/portfolio-categories/edit?id=${created.id}`)
                return
            }

            navigate("/admin")
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Неуспешно създаване на категория."
            )
        } finally {
            setSaving(false)
        }
    }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    to="/admin"
                    className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    Назад към админ
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Създаване на категория
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                    Името на английски автоматично генерира slug / key.
                </p>
            </div>

            {loading ? (
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Зареждане...
                </div>
            ) : null}

            {error ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    {success}
                </div>
            ) : null}

            <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                            Име на български
                        </label>
                        <input
                            value={nameBg}
                            onChange={(e) => setNameBg(e.target.value)}
                            placeholder="Пример: Портрети"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                            Име на английски
                        </label>
                        <input
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="Example: Portraits"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                            Key / slug
                        </label>
                        <input
                            value={key}
                            onChange={(e) => {
                                setKeyTouched(true)
                                setKey(e.target.value)
                            }}
                            placeholder="portrait"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">
                            Ред
                        </label>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                            className={inputClassName}
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <label className="inline-flex items-center gap-3 text-sm font-medium text-neutral-800 dark:text-zinc-200">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                        />
                        Активна категория
                    </label>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {saving ? "Запазване..." : "Създай категория"}
                    </button>

                    <Link
                        to="/admin"
                        className="inline-flex items-center rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Отказ
                    </Link>
                </div>
            </form>
        </div>
    )
}