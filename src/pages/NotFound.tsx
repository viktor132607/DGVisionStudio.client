import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

export default function NotFound() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const bg = !i18n.language?.startsWith("en")
  const title = bg ? "Страницата не е намерена" : "Page not found"
  return <section className="mx-auto max-w-3xl px-4 py-20 text-center">
    <Seo title={title} description={title} canonical={pathname} noindex />
    <h1 className="text-3xl font-bold">404 — {title}</h1>
    <Link to="/" className="mt-8 inline-block underline">{bg ? "Към началната страница" : "Back to home"}</Link>
  </section>
}
