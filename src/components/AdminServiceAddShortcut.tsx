import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const servicesGridSelector =
    "main .min-h-screen > section:nth-of-type(2) > div > div.grid"

export default function AdminServiceAddShortcut() {
    const { isAdmin, loading } = useAuth()
    const location = useLocation()
    const [target, setTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const isHomePage = location.pathname === "/" || location.pathname === "/services"

        if (loading || !isAdmin || !isHomePage) {
            setTarget(null)
            return
        }

        const locateGrid = () => {
            setTarget(document.querySelector<HTMLElement>(servicesGridSelector))
        }

        locateGrid()

        const observer = new MutationObserver(locateGrid)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [isAdmin, loading, location.pathname])

    if (!isAdmin || !target) return null

    return createPortal(
        <Link
            to="/admin/services"
            aria-label="Добави нова услуга"
            title="Добави нова услуга"
            className="group flex min-h-[420px] items-center justify-center border-2 border-dashed border-neutral-300 bg-neutral-50 [font-family:Messenger,sans-serif] text-neutral-950 transition hover:-translate-y-1 hover:border-neutral-950 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-white dark:hover:bg-zinc-900"
        >
            <span className="flex flex-col items-center gap-5 text-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-neutral-950 transition group-hover:scale-105 dark:border-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        className="h-12 w-12"
                        aria-hidden="true"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </span>
                <span className="text-sm font-black uppercase tracking-[0.14em]">
                    Добави услуга
                </span>
            </span>
        </Link>,
        target,
    )
}
