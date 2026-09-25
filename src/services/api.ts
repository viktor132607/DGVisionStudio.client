import { getApiErrorMessage } from "./apiErrors"
import { applyCsrfHeader } from "./apiCsrf"
import {
    API_BASE_URL,
    apiUrl,
    normalizeApiPath,
} from "./apiConfig"
import { syncUploadedMediaName } from "./apiMediaUploadSync"

export { apiUrl }

export type FetchOptions = RequestInit & {
    skipJsonContentType?: boolean
    skipCsrfToken?: boolean
}

export async function apiFetch(
    path: string,
    options: FetchOptions = {}
): Promise<Response> {
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

    await applyCsrfHeader(
        finalHeaders,
        rest.method,
        skipCsrfToken
    )

    const normalizedPath = normalizeApiPath(path)

    const response = await fetch(
        `${API_BASE_URL}/api${normalizedPath}`,
        {
            credentials: "include",
            headers: finalHeaders,
            ...rest,
        }
    )

    void syncUploadedMediaName(
        normalizedPath,
        response,
        rest.body,
        finalHeaders
    )

    return response
}

export async function apiFetchJson<T>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const response = await apiFetch(path, {
        ...options,
        skipJsonContentType:
            options.skipJsonContentType ?? false,
    })

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response))
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}
