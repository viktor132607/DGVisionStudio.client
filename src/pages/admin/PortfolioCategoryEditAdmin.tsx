import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { apiFetch } from "../../services/api"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { ensureUniqueSlug } from "../../utils/slugify"

type CategoryDetails = {
    id: number
    key: string
    name: string
    nameEn?: string | null
    description?: string | null
    displayOrder: number
    isActive: boolean
}

type ExistingCategory = {
    id: number
    key: string
}

export default function PortfolioCategoryEditAdmin() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const categoryIdParam = searchParams.get("id")
    const categoryId = categoryIdParam ? Number(categoryIdParam) : 0

    const [nameBg, setNameBg] = useState("")
    const [nameEn, setNameEn] = useState("")
    const [key, setKey] = useState("")
    const [displayOrder, setDisplayOrder] = useState(1)
    const [isActive, setIsActive] = useState(true)

    const [allCategories, setAllCategories] = useState<ExistingCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [keyTouched, setKeyTouched] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const usedSlugs = useMemo(
        () => allCategories.map((item) => item.key).filter(Boolean),
        [allCategories]
    )

    useEffect(() => {
        const load = async () => {
            if (!categoryId || !Number.isFinite(categoryId)) {
                setError("Невалиден category id.")
                setLoading(false)
                return
            }

            setLoading(true)
            setError("")

            try {
                const [categoryResponse, categoriesResponse] = await Promise.all([
                    apiFetch(`/admin/portfolio/categories/${categoryId}`, {
                        method: "GET",
                        skipJsonContentType: true,
                    }),
                    apiFetch("/portfolio/categories", {
                        method: "GET",
                        skipJsonContentType: true,
                    }),
                ])

                if (!categoryResponse.ok) {
                    throw new Error("Неуспешно зареждане на категорията.")
                }

                const category = (await categoryResponse.json()) as CategoryDetails
                const categories = (await categoriesResponse.json().catch(() => [])) as ExistingCategory[]

                setNameBg(category.name || "")
                setNameEn(category.nameEn || "")
                setKey(category.key || "")
                setDisplayOrder(category.displayOrder || 1)
                setIsActive(category.isActive)
                setAllCategories(Array.isArray(categories) ? categories : [])
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Неуспешно зареждане на категорията."
                )
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [categoryId])

    useEffect(() => {
        if (keyTouched) return
        const source = nameEn.trim() || nameBg.trim()
        setKey(ensureUniqueSlug(source, usedSlugs, key))
    }, [keyTouched, key, nameBg, nameEn, usedSlugs])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        const finalNameBg = nameBg.trim()
        const finalNameEn = nameEn.trim()
        const finalKey = ensureUniqueSlug(key.trim() || finalNameEn || finalNameBg, usedSlugs, key)

        if (!categoryId || !Number.isFinite(categoryId)) {
            setError("Невалиден category id.")
            return
        }

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
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}`, {
                method: "PUT",
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
                throw new Error(message || "Неуспешно обновяване на категория.")
            }

            setSuccess("Категорията беше обновена успешно.")
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Неуспешно обновяване на категория."
            )
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!categoryId || !Number.isFinite(categoryId)) return

        setDeleting(true)
        setError("")
        setSuccess("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || "Неуспешно изтриване на категорията.")
            }

            navigate("/admin")
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Неуспешно изтриване на категорията."
            )
        } finally {
            setDeleting(false)
            setDeleteOpen(false)
        }
    }

    const inputClassName =
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 dark:border-zinc-600 dark:bg-zinc-100 dark:text-black dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link
                        to="/admin"
                        className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Назад към админ
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Редактиране на категория
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        Промяна на име, slug, ред и активност.
                    </p>
                </div>

                {categoryId ? (
                    <Link
                        to={`/admin/portfolio-categories/albums?id=${categoryId}`}
                        className="inline-flex items-center rounded-2xl border border-sky-300 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
                    >
                        Manage albums
                    </Link>
                ) : null}
            </div>

            {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Зареждане...
                </div>
            ) : (
                <>
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
                                {saving ? "Запазване..." : "Запази"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setDeleteOpen(true)}
                                disabled={deleting}
                                className="inline-flex items-center rounded-2xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                            >
                                Delete category
                            </button>
                        </div>
                    </form>
                </>
            )}

            <ConfirmDialog
                open={deleteOpen}
                title="Изтриване на категория"
                description="Сигурен ли си, че искаш да изтриеш тази категория?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteOpen(false)}
            />
        </div>
    )
}