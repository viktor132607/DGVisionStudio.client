import { useCallback, useEffect, useRef, useState } from "react"
import { apiFetch, apiFetchJson, apiUrl } from "../services/api"

export type ArchiveJob = {
    id: string
    status: "queued" | "preparing" | "writing" | "verifying" | "ready" | "failed"
    completedFiles: number
    totalFiles: number
    fileName: string | null
    error: string | null
    expiresAt: string
}

const jobsPath = "/admin/portfolio/albums/archive-jobs"
const storageKey = "dgvisionstudio.admin.archiveJob"
const savedJob = () => { try { return sessionStorage.getItem(storageKey) } catch { return null } }
const saveJob = (id: string | null) => {
    try { if (id) sessionStorage.setItem(storageKey, id); else sessionStorage.removeItem(storageKey) } catch { /* Optional resume support. */ }
}
const pause = (signal: AbortSignal) => new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")) }
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve() }, 1500)
    signal.addEventListener("abort", abort, { once: true })
    if (signal.aborted) abort()
})

export function useAlbumArchive() {
    const [job, setJob] = useState<ArchiveJob | null>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const request = useRef<AbortController | null>(null)
    const currentId = useRef<string | null>(null)
    const downloadUrl = job?.status === "ready" ? apiUrl(`${jobsPath}/${job.id}/download`) : null

    const poll = useCallback(async (id: string, signal: AbortSignal) => {
        currentId.current = id
        saveJob(id)
        while (!signal.aborted) {
            const status = await apiFetchJson<ArchiveJob>(`${jobsPath}/${id}`, { signal })
            if (signal.aborted) return
            setJob(status)
            if (status.status === "failed") throw new Error(status.error || "Архивът не можа да бъде създаден.")
            if (status.status === "ready") {
                // Browser streams the response to disk; no multi-gigabyte Blob in JavaScript memory.
                const frame = document.createElement("iframe")
                frame.hidden = true
                frame.title = "Изтегляне на архив"
                frame.src = apiUrl(`${jobsPath}/${id}/download`)
                document.body.appendChild(frame)
                // Keep the frame alive for long downloads, even if the dashboard unmounts.
                setTimeout(() => frame.remove(), 60 * 60 * 1000)
                return
            }
            await pause(signal)
        }
    }, [])

    const run = useCallback(async (ids: number[] | null | undefined) => {
        if (request.current) return
        if (Array.isArray(ids) && ids.length === 0) { setError("Маркирай поне един албум."); return }
        const controller = new AbortController()
        request.current = controller
        setBusy(true)
        setError("")
        try {
            let id = currentId.current || savedJob()
            if (ids !== undefined) {
                // Release an old completed export before preparing a new one.
                if (id) await apiFetch(`${jobsPath}/${id}`, { method: "DELETE", signal: controller.signal })
                setJob(null)
                const created = await apiFetchJson<ArchiveJob>(jobsPath, {
                    method: "POST", body: JSON.stringify({ albumIds: ids }), signal: controller.signal,
                })
                id = created.id
            }
            if (id) await poll(id, controller.signal)
        } catch (err) {
            if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Неуспешно изтегляне. Опитай отново.")
        } finally {
            if (request.current === controller) {
                request.current = null
                if (!controller.signal.aborted) setBusy(false)
            }
        }
    }, [poll])

    useEffect(() => {
        if (savedJob()) void run(undefined)
        return () => { request.current?.abort(); request.current = null }
    }, [run])

    const close = async () => {
        if (request.current) return
        const id = currentId.current || savedJob()
        if (id) {
            try {
                const response = await apiFetch(`${jobsPath}/${id}`, { method: "DELETE" })
                if (!response.ok && response.status !== 404) throw new Error("Архивът не може да бъде затворен. Провери състоянието му отново.")
            } catch (err) { setError(err instanceof Error ? err.message : "Грешка при затваряне."); return }
        }
        currentId.current = null
        saveJob(null)
        setJob(null)
        setError("")
    }

    return { job, busy, error, downloadUrl, start: (ids: number[] | null) => run(ids), resume: () => run(undefined), close }
}
