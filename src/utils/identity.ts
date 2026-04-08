export type ApiErrorResponse = {
    message?: string
    error?: string
    errors?: string[]
} & Record<string, unknown>

export const identityPasswordRules = {
    requiredLength: 8,
    requireDigit: true,
    requireLowercase: true,
    requireUppercase: true,
    requireNonAlphanumeric: true,
}

export function getPasswordRuleChecks(password: string) {
    const rules = [
        {
            key: "length",
            label: `At least ${identityPasswordRules.requiredLength} characters`,
            valid: password.length >= identityPasswordRules.requiredLength,
        },
        {
            key: "lowercase",
            label: "At least one lowercase letter",
            valid: !identityPasswordRules.requireLowercase || /[a-z]/.test(password),
        },
        {
            key: "uppercase",
            label: "At least one uppercase letter",
            valid: !identityPasswordRules.requireUppercase || /[A-Z]/.test(password),
        },
        {
            key: "digit",
            label: "At least one number",
            valid: !identityPasswordRules.requireDigit || /\d/.test(password),
        },
    ]

    if (identityPasswordRules.requireNonAlphanumeric) {
        rules.push({
            key: "special",
            label: "At least one special character",
            valid: /[^A-Za-z0-9]/.test(password),
        })
    }

    return rules
}

export function passwordMeetsIdentityRules(password: string) {
    return getPasswordRuleChecks(password).every((rule) => rule.valid)
}

export async function parseApiErrorResponse(response: Response) {
    const text = await response.text()
    let data: ApiErrorResponse | null = null

    try {
        data = text ? (JSON.parse(text) as ApiErrorResponse) : null
    } catch {
        data = null
    }

    const modelStateErrors =
        data && typeof data === "object"
            ? Object.values(data)
                  .flat()
                  .filter((value): value is string => typeof value === "string")
            : []

    const errors =
        Array.isArray(data?.errors) && data.errors.length > 0
            ? data.errors
            : modelStateErrors.length > 0
              ? modelStateErrors
              : data?.message
                ? [data.message]
                : data?.error
                  ? [data.error]
                  : text
                    ? [text]
                    : ["Something went wrong."]

    return {
        data,
        errors,
    }
}