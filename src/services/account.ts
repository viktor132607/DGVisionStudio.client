import { apiFetch } from "./api"

export async function deleteMyAccount(password: string): Promise<{ message: string }> {
    const response = await apiFetch("/account/delete", {
        method: "DELETE",
        body: JSON.stringify({ password }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.message || "Account deletion failed.")
    }

    return data as { message: string }
}