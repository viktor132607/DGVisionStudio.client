export const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://api.dgvisionstudio.com"
).replace(/\/+$/, "")

export function normalizeApiPath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`
}

export function apiUrl(path: string): string {
    return `${API_BASE_URL}/api${normalizeApiPath(path)}`
}
