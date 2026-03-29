export const COOKIE_CONSENT_KEY = "cookie-consent-v1"
export const COOKIE_CONSENT_EVENT = "cookie-consent-updated"

export type CookieConsentStatus = "accepted" | "declined"

export function getCookieConsent(): CookieConsentStatus | null {
    if (typeof window === "undefined") return null

    const value = localStorage.getItem(COOKIE_CONSENT_KEY)

    if (value === "accepted" || value === "declined") {
        return value
    }

    return null
}

export function setCookieConsent(status: CookieConsentStatus) {
    if (typeof window === "undefined") return

    localStorage.setItem(COOKIE_CONSENT_KEY, status)
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: status }))
}

export function hasAcceptedOptionalCookies() {
    return getCookieConsent() === "accepted"
}