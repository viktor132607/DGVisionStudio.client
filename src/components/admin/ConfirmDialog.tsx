import { useEffect } from "react"

type ConfirmDialogProps = {
    open: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: "danger" | "primary"
    busy?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmText = "Потвърди",
    cancelText = "Отказ",
    confirmVariant = "danger",
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) {
                onCancel()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [busy, onCancel, open])

    if (!open) return null

    const confirmClassName =
        confirmVariant === "primary"
            ? "border-sky-300 text-sky-700 hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10"
            : "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 bg-black/45"
                onClick={() => {
                    if (!busy) onCancel()
                }}
            />

            <div className="relative z-[101] w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white">{title}</h3>
                    {description ? (
                        <p className="text-sm leading-6 text-neutral-600 dark:text-zinc-400">
                            {description}
                        </p>
                    ) : null}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
                    >
                        {busy ? "Моля изчакай..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}