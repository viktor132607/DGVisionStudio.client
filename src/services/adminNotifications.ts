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

export const ADMIN_CONTACT_REQUESTS_SEEN_EVENT = "dgvisionstudio:admin-contact-requests-seen"

export async function markAdminContactRequestsSeen() {
    await apiFetchJson<void>("/admin/contact-requests/seen", {
        method: "PUT",
    })

    // Update the sidebar after the database confirms that requests were seen.
    window.dispatchEvent(new Event(ADMIN_CONTACT_REQUESTS_SEEN_EVENT))
}

export async function markAdminPrintRequestsSeen() {
    return apiFetchJson<void>("/admin/print-requests/seen", {
        method: "PUT",
    })
}