const API_BASE_URL = import.meta.env.VITE_API_URL || ""

type FetchOptions = RequestInit & {
    skipJsonContentType?: boolean
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
    const { skipJsonContentType = false, headers, ...rest } = options

    const finalHeaders = new Headers(headers)

    if (!skipJsonContentType && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json")
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    return fetch(`${API_BASE_URL}/api${normalizedPath}`, {
        credentials: "include",
        headers: finalHeaders,
        ...rest,
    })
}

export async function addNumbers(a: number, b: number) {
    const res = await apiFetch(`/test/add?a=${a}&b=${b}`, {
        method: "GET",
        skipJsonContentType: true,
    })

    return res.json()
}