export async function getApiErrorMessage(response: Response): Promise<string> {
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

    return message
}
