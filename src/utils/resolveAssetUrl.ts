const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "")

export function resolveAssetUrl(url?: string | null): string {
    if (!url) return ""

    const trimmed = url.trim()
    if (!trimmed) return ""

    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (/^data:/i.test(trimmed)) return trimmed
    if (/^blob:/i.test(trimmed)) return trimmed

    if (trimmed.startsWith("/images/")) return trimmed
    if (trimmed.startsWith("images/")) return `/${trimmed}`

    if (trimmed.startsWith("/api/")) {
        return `${API_ROOT}${trimmed.replace(/^\/api/, "")}`
    }

    if (trimmed.startsWith("/")) {
        return `${API_ROOT}${trimmed}`
    }

    return `${API_ROOT}/${trimmed}`
}