import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"
import { apiFetchJson } from "../services/api"

type PricingMode = "Fixed" | "Negotiable"

type PricingItem = {
    id: number
    title: string
    description: string
    pricingMode: PricingMode
    priceText?: string | null
    displayOrder: number
    isActive: boolean
}

function normalizePricingMode(value?: string | null): PricingMode {
    return value === "Negotiable" ? "Negotiable" : "Fixed"
}

export default function PriceList() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const [items, setItems] = useState<PricingItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        apiFetchJson<PricingItem[]>("/pricing", {
            method: "GET",
            skipJsonContentType: true,
            skipCsrfToken: true,
        })
            .then((data) => {
                if (!isMounted) return
                setItems(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!isMounted) return
                setItems([])
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const sortedItems = useMemo(() => {
        return [...items]
            .filter((item) => item.isActive !== false)
            .sort(
                (a, b) =>
                    (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                    (a.id ?? 0) - (b.id ?? 0)
            )
    }, [items])

    const t = isBg
        ? {
              seoTitle: "Ценоразпис | DG Vision Studio",
              seoDescription: "Цени за фотографски услуги от DG Vision Studio.",
              eyebrow: "УСЛУГИ И ЦЕНИ",
              title: "Ценоразпис",
              description:
                  "Ясен и изчистен преглед на основните фотографски услуги и началните им цени.",
              includedTitle: "Важно",
              includedText:
                  "При услуги с цена „По договаряне“ офертата се определя според обем, локация, продължителност и конкретни изисквания.",
              ctaTitle: "Имаш конкретно запитване?",
              ctaText:
                  "Свържи се с нас за персонална оферта според твоя проект, събитие или фотосесия.",
              contact: "Изпрати запитване",
              priceLabel: "Цена",
              loading: "Зареждане...",
              empty: "Все още няма добавени цени.",
              negotiable: "По договаряне",
          }
        : {
              seoTitle: "Price List | DG Vision Studio",
              seoDescription: "Photography service prices by DG Vision Studio.",
              eyebrow: "SERVICES & PRICING",
              title: "Price List",
              description:
                  "A clean overview of the main photography services and their starting prices.",
              includedTitle: "Important",
              includedText:
                  "For services marked as “By agreement”, the final offer depends on scope, location, duration, and specific requirements.",
              ctaTitle: "Have a specific request?",
              ctaText:
                  "Get in touch for a custom quote based on your project, event, or photo session.",
              contact: "Send inquiry",
              priceLabel: "Price",
              loading: "Loading...",
              empty: "No pricing items have been added yet.",
              negotiable: "By agreement",
          }

    const getPriceText = (item: PricingItem) => {
        return normalizePricingMode(item.pricingMode) === "Negotiable"
            ? t.negotiable
            : item.priceText || "-"
    }

    return (
        <>
            <Seo title={t.seoTitle} description={t.seoDescription} canonical="/pricing" />

            <section className="bg-neutral-100 py-10 dark:bg-zinc-900 sm:py-12 lg:py-16 xl:py-20">
                <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="overflow-hidden rounded-[28px] border border-neutral-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="border-b border-neutral-300 bg-neutral-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-neutral-500 dark:text-zinc-400 sm:text-[11px] sm:tracking-[0.3em]">
                                {t.eyebrow}
                            </p>

                            <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-neutral-950 dark:text-white sm:text-[40px] lg:text-[52px]">
                                {t.title}
                            </h1>

                            <p className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8 md:text-[16px]">
                                {t.description}
                            </p>
                        </div>

                        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
                            {loading ? (
                                <div className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-8 text-center text-[14px] font-bold text-neutral-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    {t.loading}
                                </div>
                            ) : sortedItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {sortedItems.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-5 dark:border-zinc-700 dark:bg-zinc-800 sm:p-6"
                                        >
                                            <div className="flex h-full flex-col">
                                                <h2 className="text-[20px] font-bold text-neutral-950 dark:text-white">
                                                    {item.title}
                                                </h2>

                                                <p className="mt-4 flex-1 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px]">
                                                    {item.description}
                                                </p>

                                                <div className="mt-6 border-t border-neutral-300 pt-4 dark:border-zinc-700">
                                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-400">
                                                        {t.priceLabel}
                                                    </p>
                                                    <p className="mt-3 text-[18px] font-extrabold text-neutral-950 dark:text-white">
                                                        {getPriceText(item)}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-8 text-center text-[14px] font-bold text-neutral-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    {t.empty}
                                </div>
                            )}

                            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
                                    <h3 className="text-[24px] font-bold text-neutral-950 dark:text-white">
                                        {t.includedTitle}
                                    </h3>
                                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8">
                                        {t.includedText}
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-neutral-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                                    <h3 className="text-[24px] font-bold text-neutral-950 dark:text-white">
                                        {t.ctaTitle}
                                    </h3>
                                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8">
                                        {t.ctaText}
                                    </p>

                                    <Link
                                        to="/contact"
                                        className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                    >
                                        {t.contact}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
