import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"

export default function MobileProfileShortcut() {
    const { user } = useAuth()
    const { i18n } = useTranslation()
    const [target, setTarget] = useState<HTMLElement | null>(null)

    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    useEffect(() => {
        const findTarget = () => {
            const headerRow = document.querySelector("header > div:first-child > div")
            const actions = headerRow?.lastElementChild
            setTarget(actions instanceof HTMLElement ? actions : null)
        }

        findTarget()
        const frame = window.requestAnimationFrame(findTarget)
        return () => window.cancelAnimationFrame(frame)
    }, [])

    if (!user || !target) return null

    return createPortal(
        <Link
            to="/identity/profile"
            aria-label={isBg ? "Моят профил" : "My profile"}
            className="order-first inline-flex h-9 items-center justify-center rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-extrabold text-neutral-900 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900 md:hidden max-[360px]:w-9 max-[360px]:px-0"
        >
            <span className="max-[360px]:hidden">{isBg ? "Профил" : "Profile"}</span>
            <span className="hidden text-base max-[360px]:inline" aria-hidden="true">●</span>
        </Link>,
        target
    )
}
