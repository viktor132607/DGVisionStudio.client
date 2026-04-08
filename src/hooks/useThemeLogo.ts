import { useEffect, useState } from "react"

const THEME_KEY = "theme"

function getIsDark() {
    const savedTheme = localStorage.getItem(THEME_KEY)

    if (savedTheme === "dark") return true
    if (savedTheme === "light") return false

    return document.documentElement.classList.contains("dark")
}

export function useThemeLogo() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const updateTheme = () => {
            const dark = getIsDark()
            document.documentElement.classList.toggle("dark", dark)
            setIsDark(dark)
        }

        updateTheme()

        const observer = new MutationObserver(() => {
            updateTheme()
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        window.addEventListener("storage", updateTheme)

        return () => {
            observer.disconnect()
            window.removeEventListener("storage", updateTheme)
        }
    }, [])

    return isDark ? "/images/Pronto100tr.png" : "/images/Pronto101tr.png"
}