import { API_BASE_URL } from "./apiConfig"

const CSRF_HEADER_NAME = "X-CSRF-TOKEN"

let csrfToken: string | null = null
let csrfTokenPromise: Promise<string> | null = null

type CsrfResponse = {
    csrfToken: string
}

function isUnsafeMethod(method: string | undefined): boolean {
    const normalizedMethod = (method || "GET").toUpperCase()
    return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)
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

export async function applyCsrfHeader(
    headers: Headers,
    method: string | undefined,
    skipCsrfToken: boolean
): Promise<void> {
    if (skipCsrfToken || !isUnsafeMethod(method)) {
        return
    }

    headers.set(CSRF_HEADER_NAME, await getCsrfToken())
}
