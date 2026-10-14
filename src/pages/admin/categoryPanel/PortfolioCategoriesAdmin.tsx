import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "../../../services/api"
import ConfirmDialog from "../../../components/admin/ConfirmDialog"
import { useAdminToast } from "../../../hooks/useAdminToast"

type PortfolioCategoryRow = {
    id: number
    key: string
    name: string
    nameEn?: string | null
    description?: string | null
    displayOrder: number
    isActive: boolean
}

export default function PortfolioCategoriesAdmin() {
    const { showToast } = useAdminToast()
    const [categories, setCategories] = useState<PortfolioCategoryRow[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState("")
    const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null)
    const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
    const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(null)
    const [dragOverCategoryId, setDragOverCategoryId] = useState<number | null>(null)

    const loadCategories = async () => {
        setCategoriesLoading(true)
        setCategoriesError("")

        try {
            const response = await apiFetch("/admin/portfolio/categories", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) {
                throw new Error("Грешка при зареждане на категориите.")
            }

            const data = await response.json().catch(() => [])
            const items = Array.isArray(data) ? data : []

            setCategories(
                [...items].sort(
                    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0)
                )
            )
        } catch (err) {
            const message = err instanceof Error ? err.message : "Грешка при зареждане на категориите."
            setCategoriesError(message)
            setCategories([])

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setCategoriesLoading(false)
        }
    }

    useEffect(() => {
        void loadCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleToggleCategory = async (category: PortfolioCategoryRow) => {
        setBusyCategoryId(category.id)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${category.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    key: category.key,
                    name: category.name,
                    nameEn: category.nameEn?.trim() || category.name,
                    description: category.description ?? "",
                    displayOrder: category.displayOrder,
                    isActive: !category.isActive,
                }),
            })

            if (!response.ok) {
                throw new Error("Неуспешна промяна на категорията.")
            }

            setCategories((current) =>
                current.map((x) =>
                    x.id === category.id
                        ? { ...x, isActive: !x.isActive }
                        : x
                )
            )

            showToast({
                type: "success",
                title: "Готово",
                message: !category.isActive
                    ? "Категорията беше активирана."
                    : "Категорията беше направена неактивна.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешна промяна на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
        }
    }

    const handleDeleteCategory = async () => {
        if (!deleteCategoryId) return

        setBusyCategoryId(deleteCategoryId)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${deleteCategoryId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Неуспешно изтриване на категорията.")
            }

            setCategories((current) => current.filter((x) => x.id !== deleteCategoryId))
            setDeleteCategoryId(null)
            await loadCategories()

            showToast({
                type: "success",
                title: "Готово",
                message: "Категорията беше изтрита успешно.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешно изтриване на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
        }
    }

    const moveCategory = async (categoryId: number, newDisplayOrder: number) => {
        setBusyCategoryId(categoryId)
        setCategoriesError("")

        try {
            const response = await apiFetch(`/admin/portfolio/categories/${categoryId}/move`, {
                method: "PUT",
                body: JSON.stringify({
                    displayOrder: newDisplayOrder,
                }),
            })

            if (!response.ok) {
                throw new Error("Неуспешна промяна на реда на категорията.")
            }

            await loadCategories()

            showToast({
                type: "success",
                title: "Готово",
                message: "Редът на категорията беше обновен.",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неуспешна промяна на реда на категорията."
            setCategoriesError(message)

            showToast({
                type: "error",
                title: "Грешка",
                message,
            })
        } finally {
            setBusyCategoryId(null)
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
        }
    }

    const handleDropCategory = async (targetCategory: PortfolioCategoryRow) => {
        if (!draggedCategoryId || draggedCategoryId === targetCategory.id) {
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
            return
        }

        const draggedCategory = categories.find((x) => x.id === draggedCategoryId)
        if (!draggedCategory) {
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
            return
        }

        await moveCategory(draggedCategory.id, targetCategory.displayOrder)
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <section id="categories" className="mb-10 scroll-mt-24">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Категории
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 sm:text-base">
                            Създавай, редактирай, подреждай и управлявай категориите в портфолиото
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void loadCategories()}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        >
                            Обнови категориите
                        </button>

                        <Link
                            to="/admin/portfolio-categories/new"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            Създай нова категория
                        </Link>
                    </div>
                </div>

                {categoriesError ? (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {categoriesError}
                    </div>
                ) : null}

                {categoriesLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Зареждане...
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px]">
                                <thead className="bg-gray-50 dark:bg-zinc-950">
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Ред
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Категория
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Статус
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            draggable={busyCategoryId !== category.id}
                                            onDragStart={() => setDraggedCategoryId(category.id)}
                                            onDragOver={(event) => {
                                                event.preventDefault()
                                                setDragOverCategoryId(category.id)
                                            }}
                                            onDragLeave={() => {
                                                if (dragOverCategoryId === category.id) {
                                                    setDragOverCategoryId(null)
                                                }
                                            }}
                                            onDrop={() => void handleDropCategory(category)}
                                            onDragEnd={() => {
                                                setDraggedCategoryId(null)
                                                setDragOverCategoryId(null)
                                            }}
                                            className={`border-b border-gray-100 align-middle last:border-b-0 dark:border-zinc-800 ${
                                                category.isActive
                                                    ? "bg-green-200 hover:bg-green-300 dark:bg-green-700/60 dark:hover:bg-green-700/75"
                                                    : dragOverCategoryId === category.id
                                                      ? "bg-sky-50 dark:bg-sky-500/10"
                                                      : "bg-white dark:bg-zinc-900"
                                            }`}
                                        >
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="cursor-grab select-none text-base text-gray-400 dark:text-zinc-500">
                                                        ⋮⋮
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                                        {category.displayOrder}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                {category.name}
                                                {category.nameEn ? (
                                                    <span className="font-medium text-gray-500 dark:text-zinc-300">
                                                        {" / "}{category.nameEn}
                                                    </span>
                                                ) : null}
                                            </td>

                                            <td className="p-0">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleToggleCategory(category)}
                                                    disabled={busyCategoryId === category.id}
                                                    className={`flex h-full min-h-[40px] w-full items-center justify-center px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        category.isActive
                                                            ? "bg-green-700 text-white hover:bg-green-800 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                                    }`}
                                                >
                                                    {category.isActive ? "Активна" : "Неактивна"}
                                                </button>
                                            </td>

                                            <td className="p-0">
                                                <div className="flex min-h-[40px] w-full flex-nowrap items-stretch justify-end gap-0">
                                                    <Link
                                                        to={`/admin/portfolio-categories/edit?id=${category.id}`}
                                                        className="flex min-h-[40px] w-[140px] items-center justify-center bg-slate-100 px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                                    >
                                                        Редактирай
                                                    </Link>

                                                    <Link
                                                        to={`/admin/portfolio-categories/albums?id=${category.id}`}
                                                        className="flex min-h-[40px] w-[160px] items-center justify-center bg-slate-100 px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                                    >
                                                        Управление албуми
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteCategoryId(category.id)}
                                                        disabled={busyCategoryId === category.id}
                                                        className="flex min-h-[40px] w-[145px] items-center justify-center bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500"
                                                    >
                                                        Изтрий категория
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            <ConfirmDialog
                open={deleteCategoryId !== null}
                title="Изтриване на категория"
                description="Сигурен ли си, че искаш да изтриеш тази категория?"
                confirmText="Изтрий"
                cancelText="Отказ"
                confirmVariant="danger"
                busy={busyCategoryId === deleteCategoryId}
                onConfirm={() => void handleDeleteCategory()}
                onCancel={() => {
                    if (busyCategoryId !== deleteCategoryId) {
                        setDeleteCategoryId(null)
                    }
                }}
            />

        </div>
    )
}
