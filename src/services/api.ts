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

function getUploadFile(body: BodyInit | null | undefined) {
    if (!(body instanceof FormData)) return null
    const file = body.get("file")
    return file instanceof File ? file : null
}

function getFileNameWithoutExtension(file: File) {
    return file.name.replace(/\.[^/.]+$/, "").trim() || file.name.trim()
}

function getAdminGalleryUploadMatch(path: string) {
    return path.match(/^\/admin\/client-galleries\/(\d+)\/(photos|videos)\/upload$/)
}

async function syncUploadedMediaName(
    path: string,
    response: Response,
    body: BodyInit | null | undefined,
    headers: Headers
) {
    if (!response.ok) return

    const match = getAdminGalleryUploadMatch(path)
    if (!match) return

    const file = getUploadFile(body)
    if (!file) return

    const galleryId = Number(match[1])
    if (!Number.isFinite(galleryId) || galleryId <= 0) return

    const data = (await response.clone().json().catch(() => null)) as { id?: number } | null
    const mediaId = Number(data?.id)
    if (!Number.isFinite(mediaId) || mediaId <= 0) return

    await fetch(`${API_BASE_URL}/api/admin/client-galleries/${galleryId}/media/${mediaId}/metadata`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify({
            name: getFileNameWithoutExtension(file),
            clearAltAndCaption: true,
        }),
    }).catch(() => undefined)
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

    const response = await fetch(`${API_BASE_URL}/api${normalizedPath}`, {
        credentials: "include",
        headers: finalHeaders,
        ...rest,
    })

    void syncUploadedMediaName(normalizedPath, response, rest.body, finalHeaders)

    return response
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
