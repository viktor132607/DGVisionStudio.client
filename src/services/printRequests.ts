import { apiFetchJson } from "./api"
import type {
    CreatePrintRequestDto,
    PrintRequestDto,
    UpdatePrintRequestStatusDto,
} from "../types/printRequest"

export async function createPrintRequest(payload: CreatePrintRequestDto) {
    return apiFetchJson<{ id: number }>("/client/print-requests", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export async function getMyPrintRequests() {
    return apiFetchJson<PrintRequestDto[]>("/client/print-requests", {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function getMyPrintRequestById(id: number) {
    return apiFetchJson<PrintRequestDto>(`/client/print-requests/${id}`, {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function getAdminPrintRequests() {
    return apiFetchJson<PrintRequestDto[]>("/admin/print-requests", {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function getAdminPrintRequestById(id: number) {
    return apiFetchJson<PrintRequestDto>(`/admin/print-requests/${id}`, {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function updatePrintRequestStatus(id: number, status: string) {
    const payload: UpdatePrintRequestStatusDto = { status }

    return apiFetchJson<void>(`/admin/print-requests/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })
}

export async function markPrintRequestSeen(id: number) {
    return apiFetchJson<void>(`/admin/print-requests/${id}/seen`, {
        method: "PUT",
    })
}

export async function deletePrintRequest(id: number) {
    return apiFetchJson<void>(`/admin/print-requests/${id}`, {
        method: "DELETE",
    })
}