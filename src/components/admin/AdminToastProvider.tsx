import {
    createContext,
    type ReactNode,
    useCallback,
    useMemo,
    useState,
} from "react"

export type AdminToastType = "success" | "error" | "info" | "warning"

export type AdminToastInput = {
    type?: AdminToastType
    title?: string
    message: string
    durationMs?: number
}

type AdminToastItem = {
    id: string
    type: AdminToastType
    title?: string
    message: string
    durationMs: number
}

export type AdminToastContextValue = {
    showToast: (toast: AdminToastInput) => void
    dismissToast: (id: string) => void
    clearToasts: () => void
}

export const AdminToastContext = createContext<AdminToastContextValue | null>(null)

type AdminToastProviderProps = {
    children: ReactNode
}

const DEFAULT_DURATION_MS = 4000

function createToastId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getToastClasses(type: AdminToastType) {
    switch (type) {
        case "success":
            return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
        case "error":
            return "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
        case "warning":
            return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
        case "info":
        default:
            return "border-neutral-200 bg-white text-neutral-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
    }
}

function getDotClasses(type: AdminToastType) {
    switch (type) {
        case "success":
            return "bg-emerald-500"
        case "error":
            return "bg-red-500"
        case "warning":
            return "bg-amber-500"
        case "info":
        default:
            return "bg-sky-500"
    }
}

export default function AdminToastProvider({ children }: AdminToastProviderProps) {
    const [toasts, setToasts] = useState<AdminToastItem[]>([])

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const clearToasts = useCallback(() => {
        setToasts([])
    }, [])

    const showToast = useCallback(
        (toast: AdminToastInput) => {
            const id = createToastId()

            const nextToast: AdminToastItem = {
                id,
                type: toast.type ?? "info",
                title: toast.title,
                message: toast.message,
                durationMs: toast.durationMs ?? DEFAULT_DURATION_MS,
            }

            setToasts((current) => [...current, nextToast])

            window.setTimeout(() => {
                dismissToast(id)
            }, nextToast.durationMs)
        },
        [dismissToast]
    )

    const value = useMemo<AdminToastContextValue>(
        () => ({
            showToast,
            dismissToast,
            clearToasts,
        }),
        [showToast, dismissToast, clearToasts]
    )

    return (
        <AdminToastContext.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-[420px] flex-col gap-3 sm:right-6 sm:top-6">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur ${getToastClasses(
                            toast.type
                        )}`}
                    >
                        <div className="flex items-start gap-3">
                            <span
                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getDotClasses(
                                    toast.type
                                )}`}
                            />

                            <div className="min-w-0 flex-1">
                                {toast.title ? (
                                    <p className="text-[14px] font-semibold leading-5">
                                        {toast.title}
                                    </p>
                                ) : null}

                                <p className="text-[13px] leading-5 opacity-90">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => dismissToast(toast.id)}
                                className="ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[18px] leading-none opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                                aria-label="Close notification"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminToastContext.Provider>
    )
}