const API_BASE_URL = import.meta.env.VITE_API_URL || ""

const CSRF_HEADER_NAME = "X-CSRF-TOKEN"

let csrfToken: string | null = null
let csrfTokenPromise: Promise<string> | null = null

type FetchOptions = RequestInit & {
    skipJsonContentType?: boolean
    skipCsrfToken?: boolean
}

type CsrfResponse = {
    csrfToken: string
}

async function getCsrfToken(): Promise<string> {
    if (csrfToken) {
        return csrfToken
    }

    if (csrfTokenPromise) {
        return csrfTokenPromise
    }

    csrfTokenPromise = fetch(`${API_BASE_URL}/api/csrf`, {
        method: "GET",
        credentials: "include",
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error("Failed to get CSRF token.")
            }

            const data = (await response.json()) as CsrfResponse

            if (!data.csrfToken) {
                throw new Error("Invalid CSRF token response.")
            }

            csrfToken = data.csrfToken
            return data.csrfToken
        })
        .finally(() => {
            csrfTokenPromise = null
        })

    return csrfTokenPromise
}

function isUnsafeMethod(method: string | undefined) {
    const normalizedMethod = (method || "GET").toUpperCase()
    return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
    const {
        skipJsonContentType = false,
        skipCsrfToken = false,
        headers,
        ...rest
    } = options

    const finalHeaders = new Headers(headers)

    if (!skipJsonContentType && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json")
    }

    if (!skipCsrfToken && isUnsafeMethod(rest.method)) {
        const token = await getCsrfToken()
        finalHeaders.set(CSRF_HEADER_NAME, token)
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