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

export async function apiFetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const response = await apiFetch(path, {
        ...options,
        skipJsonContentType: options.skipJsonContentType ?? false,
    })

    if (!response.ok) {
        let message = "Request failed."

        try {
            const contentType = response.headers.get("content-type") || ""

            if (contentType.includes("application/json")) {
                const errorData = await response.json()
                message =
                    errorData?.message ||
                    errorData?.title ||
                    errorData?.error ||
                    JSON.stringify(errorData)
            } else {
                const text = await response.text()
                if (text) {
                    message = text
                }
            }
        } catch {
            message = `${response.status} ${response.statusText}`.trim() || "Request failed."
        }

        throw new Error(message)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}