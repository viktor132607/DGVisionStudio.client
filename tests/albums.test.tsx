import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import AdminPanel from "../src/pages/admin/AdminPanel"
import { apiFetch, apiFetchJson } from "../src/services/api"
import { fetchEveryAlbum, toggleVisibleSelection } from "../src/utils/albumSelection"

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn(), apiFetchJson: vi.fn(), apiUrl: (path: string) => `https://api.example.test/api${path}` }))
vi.mock("../src/hooks/useAdminToast", () => ({ useAdminToast: () => ({ showToast: vi.fn() }) }))

const categories = [
    { id: 1, key: "weddings", name: "Сватби", isActive: true, displayOrder: 1 },
    { id: 2, key: "portraits", name: "Портрети", isActive: true, displayOrder: 2 },
    { id: 3, key: "hidden", name: "Скрити", isActive: false, displayOrder: 3 },
]
const originals = [
    { id: 11, title: "Анна и Иван", slug: "anna", portfolioCategoryId: 1, isPublished: true, displayOrder: 1 },
    { id: 12, title: "Елена", slug: "elena", portfolioCategoryId: 2, isPublished: true, displayOrder: 2 },
    { id: 13, title: "Семеен ден", slug: "family", portfolioCategoryId: 1, isPublished: false, displayOrder: 3 },
]
let albums = [...originals]
const ready = { id: "job-1", status: "ready", completedFiles: 3, totalFiles: 3, fileName: "Archive(2026-09-15).zip", error: null, expiresAt: "2026-09-15T15:00:00Z" }
const jsonCalls = () => vi.mocked(apiFetchJson).mock.calls
const posts = () => jsonCalls().filter(([, options]) => options?.method === "POST")

beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    albums = originals.map(a => ({ ...a }))
    vi.mocked(apiFetch).mockImplementation(async path => new Response(JSON.stringify(path.includes("categories") ? categories : {})))
    vi.mocked(apiFetchJson).mockImplementation(async (path, options) => {
        if (path.includes("archive-jobs")) return ready
        if (path.includes("bulk-")) {
            const body = JSON.parse(options?.body as string)
            albums = path.endsWith("bulk-delete") ? albums.filter(a => !body.albumIds.includes(a.id))
                : albums.map(a => body.albumIds.includes(a.id) ? { ...a, portfolioCategoryId: body.categoryId } : a)
            return { count: body.albumIds.length }
        }
        if (path.includes("/albums?")) {
            const page = Number(new URL(path, "https://example.test").searchParams.get("page"))
            return { page, pageSize: 2, total: albums.length, totalPages: Math.ceil(albums.length / 2), items: albums.slice((page - 1) * 2, page * 2) }
        }
        throw new Error(`Unexpected request: ${path}`)
    })
})
afterEach(() => { cleanup(); document.querySelectorAll("iframe").forEach(frame => frame.remove()) })

async function dashboard() {
    render(<MemoryRouter><AdminPanel /></MemoryRouter>)
    await screen.findByRole("checkbox", { name: "Маркирай албум „Семеен ден“" })
}
const selectAlbum = (title: string) => fireEvent.click(screen.getByRole("checkbox", { name: `Маркирай албум „${title}“` }))

describe("album management", () => {
    it("loads every server page and keeps marked albums when filtering", async () => {
        await dashboard()
        expect(jsonCalls().some(([path]) => path.includes("page=2"))).toBe(true)
        selectAlbum("Елена")
        fireEvent.change(screen.getByLabelText("Категория", { selector: "select" }), { target: { value: "1" } })
        expect(screen.queryByRole("checkbox", { name: "Маркирай албум „Елена“" })).toBeNull()
        expect(screen.getByText("Маркирани: 1 (1 извън филтъра)")).toBeTruthy()
        fireEvent.click(screen.getByRole("checkbox", { name: "Маркирай показаните (2)" }))
        expect(screen.getByText("Маркирани: 3 (1 извън филтъра)")).toBeTruthy()
        fireEvent.click(screen.getByRole("checkbox", { name: "Маркирай показаните (2)" }))
        expect(screen.getByText("Маркирани: 1 (1 извън филтъра)")).toBeTruthy()
    })

    it("downloads exactly the selected albums, including selection outside the filter", async () => {
        await dashboard()
        selectAlbum("Анна и Иван")
        selectAlbum("Елена")
        fireEvent.change(screen.getByLabelText("Категория", { selector: "select" }), { target: { value: "1" } })
        fireEvent.click(screen.getByRole("button", { name: "Изтегли маркираните (2)" }))
        await screen.findByText("Архивът е готов. Изтеглянето е стартирано.")
        expect(JSON.parse(posts()[0][1]!.body as string).albumIds).toEqual([11, 12])
        expect(screen.getByRole("link", { name: "изтегли Archive(2026-09-15).zip" }).getAttribute("href")).toContain("archive-jobs/job-1/download")
    })

    it("downloads all categories independently of filters, and blocks duplicate clicks", async () => {
        await dashboard()
        fireEvent.change(screen.getByLabelText("Търсене"), { target: { value: "Елена" } })
        const button = screen.getByRole("button", { name: "Изтегли всички" })
        fireEvent.click(button)
        fireEvent.click(button)
        await screen.findByText("Архивът е готов. Изтеглянето е стартирано.")
        expect(posts()).toHaveLength(1)
        expect(JSON.parse(posts()[0][1]!.body as string)).toEqual({ albumIds: null })
    })

    it("downloads a single card and shows archive failures instead of a download link", async () => {
        await dashboard()
        vi.mocked(apiFetchJson).mockImplementation(async () => ({ ...ready, status: "failed", error: "Липсва снимка в албума." }))
        fireEvent.click(screen.getByRole("button", { name: "Изтегли архив на албум „Елена“" }))
        expect(await screen.findByText("Липсва снимка в албума.")).toBeTruthy()
        expect(JSON.parse(posts()[0][1]!.body as string)).toEqual({ albumIds: [12] })
        expect(screen.queryByRole("link", { name: /изтегли Archive/ })).toBeNull()
        expect(document.querySelector("iframe")).toBeNull()
    })

    it("moves only marked albums to the selected active category", async () => {
        await dashboard()
        selectAlbum("Анна и Иван")
        selectAlbum("Семеен ден")
        const target = screen.getByLabelText("Премести в категория")
        expect(target.textContent).not.toContain("Скрити")
        fireEvent.change(target, { target: { value: "2" } })
        fireEvent.click(screen.getByRole("button", { name: "Премести маркираните" }))
        await waitFor(() => expect(albums.filter(a => a.portfolioCategoryId === 2)).toHaveLength(3))
        expect(JSON.parse(posts()[0][1]!.body as string)).toEqual({ albumIds: [11, 13], categoryId: 2 })
    })

    it("deletes selected albums only after confirmation, with cancel preserving them", async () => {
        await dashboard()
        selectAlbum("Елена")
        fireEvent.click(screen.getByRole("button", { name: "Изтрий маркираните" }))
        expect(posts()).toHaveLength(0)
        fireEvent.click(screen.getAllByRole("button", { name: "Отказ" })[0])
        expect(posts()).toHaveLength(0)
        fireEvent.click(screen.getByRole("button", { name: "Изтрий маркираните" }))
        fireEvent.click(screen.getByRole("button", { name: "Изтрий 1 албума" }))
        await waitFor(() => expect(screen.queryByRole("checkbox", { name: "Маркирай албум „Елена“" })).toBeNull())
        expect(albums.map(a => a.id)).toEqual([11, 13])
        expect(JSON.parse(posts()[0][1]!.body as string)).toEqual({ albumIds: [12] })
    })

    it("resumes an existing export after the dashboard reloads", async () => {
        sessionStorage.setItem("dgvisionstudio.admin.archiveJob", "job-1")
        await dashboard()
        await screen.findByText("Архивът е готов. Изтеглянето е стартирано.")
        expect(posts()).toHaveLength(0)
    })
})

describe("selection and pagination guards", () => {
    it("does not select everything for an empty visible set", () => {
        expect([...toggleVisibleSelection(new Set([1]), [])]).toEqual([1])
    })
    it("rejects incomplete or repeated pages instead of silently dropping albums", async () => {
        const fetchPage = vi.fn(async (page: number) => ({ page, pageSize: 1, total: 3, totalPages: 3, items: [{ id: 1 }] }))
        await expect(fetchEveryAlbum(fetchPage)).rejects.toThrow("Не всички албуми")
        expect(fetchPage).toHaveBeenCalledTimes(2)
    })
})
