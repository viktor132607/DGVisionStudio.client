import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    getCookieConsent,
    setCookieConsent,
    type CookieConsentStatus,
} from "../utils/cookieConsent"

export default function CookieBanner() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const [consent, setConsent] = useState<CookieConsentStatus | null>(null)

    useEffect(() => {
        setConsent(getCookieConsent())
    }, [])

    if (consent !== null) return null

    const accept = () => {
        setCookieConsent("accepted")
        setConsent("accepted")
    }

    const decline = () => {
        setCookieConsent("declined")
        setConsent("declined")
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] sm:bottom-6 sm:left-6 sm:right-6 lg:left-auto lg:max-w-[480px]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:p-6">
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-white sm:text-[20px]">
                    {isBg ? "Бисквитки" : "Cookies"}
                </h3>

                <p className="mt-3 text-[14px] leading-7 text-slate-600 dark:text-zinc-200 sm:text-[15px] sm:leading-8">
                    {isBg
                        ? "Сайтът използва само нужни настройки в браузъра и може да зареди Google Maps карта само ако приемете незадължителното съдържание."
                        : "This website uses only necessary browser storage and can load the Google Maps embed only if you accept optional content."}
                </p>

                <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-zinc-400 sm:text-[14px]">
                    {isBg
                        ? "При отказ картата няма да се зареди и ще остане само бутон за отваряне в Google Maps."
                        : "If you decline, the map will not load and only a button for opening Google Maps will remain visible."}
                </p>

                <div className="mt-4">
                    <Link
                        to="/cookies"
                        className="text-[13px] font-semibold text-slate-700 underline underline-offset-4 transition hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white"
                    >
                        {isBg ? "Прочети политиката за бисквитките" : "Read the cookies policy"}
                    </Link>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={accept}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
                    >
                        {isBg ? "Приемам" : "Accept"}
                    </button>

                    <button
                        type="button"
                        onClick={decline}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-300 bg-transparent px-6 py-3 text-center text-sm font-bold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-zinc-600 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
                    >
                        {isBg ? "Отказвам" : "Decline"}
                    </button>
                </div>
            </div>
        </div>
    )
}