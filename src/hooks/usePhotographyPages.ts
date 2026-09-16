import { useEffect, useSyncExternalStore } from "react"
import { apiFetchJson } from "../services/api"

export type PhotographyPage = {
  id: number; slug: string; title: string; titleEn: string; description: string; descriptionEn: string;
  body: string; bodyEn: string; preparation: string; preparationEn: string;
  portfolioCategoryId: number | null; displayOrder: number; isActive: boolean
}
type State = { pages: PhotographyPage[]; loading: boolean; error: string }
let state: State = { pages: [], loading: true, error: "" }
let pending: Promise<void> | null = null
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const snapshot = () => state
function publish(next: State) { state = next; listeners.forEach(listener => listener()) }
export function refreshPhotographyPages() {
  if (pending) return pending
  pending = apiFetchJson<PhotographyPage[]>("/photography-pages", { cache: "no-store" })
    .then(pages => publish({ pages, loading: false, error: "" }))
    .catch(() => publish({ pages: [], loading: false, error: "Unable to load services" }))
    .finally(() => { pending = null })
  return pending
}
export async function invalidatePhotographyPages() {
  if (pending) await pending
  await refreshPhotographyPages()
}
export function usePhotographyPages() {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot)
  useEffect(() => {
    void refreshPhotographyPages()
    const refresh = () => { void refreshPhotographyPages() }
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [])
  return { ...current, refresh: refreshPhotographyPages }
}
export function pageCopy(page: PhotographyPage, language: "bg" | "en") {
  const en = language === "en"
  return {
    title: en && page.titleEn ? page.titleEn : page.title,
    description: en && page.descriptionEn ? page.descriptionEn : page.description,
    paragraphs: (en && page.bodyEn ? page.bodyEn : page.body).split(/\n\s*\n/).filter(Boolean),
    preparation: (en && page.preparationEn ? page.preparationEn : page.preparation).split(/\r?\n/).filter(Boolean),
  }
}
