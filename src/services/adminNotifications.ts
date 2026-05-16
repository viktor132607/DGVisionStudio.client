import { apiFetchJson } from "./api"
import type { AdminNotificationCountsDto } from "../types/adminNotification"

export async function getAdminNotificationCounts() {
    return apiFetchJson<AdminNotificationCountsDto>("/admin/notifications", {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function markAdminUsersSeen() {
    return apiFetchJson<void>("/admin/users/seen", {
        method: "PUT",
    })
}

export async function markAdminContactRequestsSeen() {
    return apiFetchJson<void>("/admin/contact-requests/seen", {
        method: "PUT",
    })
}

export async function markAdminPrintRequestsSeen() {
    return apiFetchJson<void>("/admin/print-requests/seen", {
        method: "PUT",
    })
}