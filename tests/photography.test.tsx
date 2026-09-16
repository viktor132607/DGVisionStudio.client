import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import PhotographyPagesAdmin from "../src/pages/admin/PhotographyPagesAdmin"
import PhotographyContent from "../src/components/PhotographyContent"
import Navbar from "../src/components/Navbar"
import { apiFetchJson } from "../src/services/api"
import { invalidatePhotographyPages, type PhotographyPage } from "../src/hooks/usePhotographyPages"

vi.mock("../src/services/api", () => ({ apiFetchJson: vi.fn() }))
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg", changeLanguage: vi.fn() } }) }))
vi.mock("../src/context/AuthContext", () => ({ useAuth: () => ({ user: null, isAdmin: false, logout: vi.fn() }) }))
const overview: PhotographyPage = { id: 1, slug: "", title: "Всички фотографски услуги", titleEn: "Photography services", description: "Въведение", descriptionEn: "", body: "", bodyEn: "", preparation: "", preparationEn: "", portfolioCategoryId: null, displayOrder: 0, isActive: true }
const wedding: PhotographyPage = { ...overview, id: 2, slug: "wedding", title: "Сватбена фотография", titleEn: "Wedding photography", portfolioCategoryId: 4 }
let pages: PhotographyPage[]
beforeEach(() => {
  pages = [{ ...overview }, { ...wedding }]
  vi.mocked(apiFetchJson).mockImplementation(async (path, options) => {
    if (path === "/admin/portfolio/categories") return [{ id: 4, name: "Сватби", isActive: true }]
    if (path.endsWith("/albums")) return [{ id: 7, slug: "anna-ivan", title: "Анна и Иван", coverImageUrl: "/photo.jpg" }]
    if (options?.method === "DELETE") { pages = pages.filter(p => p.id !== Number(path.split("/").at(-1))); return undefined }
    if (options?.method === "PUT") { const draft = JSON.parse(options.body as string); pages = pages.map(p => p.id === draft.id ? draft : p); return draft }
    if (options?.method === "POST") { const draft = { ...JSON.parse(options.body as string), id: 3 }; pages.push(draft); return draft }
    if (path === "/admin/photography-pages") return pages
    if (path === "/photography-pages") return pages.filter(p => p.isActive)
    throw new Error(`Unexpected request ${path}`)
  })
})
afterEach(cleanup)

describe("dynamic photography services", () => {
  it("separates Home and Services and builds dropdown links from records", async () => {
    await invalidatePhotographyPages()
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getAllByRole("link", { name: "Начало" }).every(link => link.getAttribute("href") === "/")).toBe(true)
    expect(screen.getByRole("link", { name: "Услуги" }).getAttribute("href")).toBe("/fotograf-ruse")
    fireEvent.focus(screen.getByRole("link", { name: "Услуги" }))
    expect(screen.getByRole("link", { name: wedding.title }).getAttribute("href")).toBe("/fotograf-ruse/wedding")
    pages[1].isActive = false
    await invalidatePhotographyPages()
    await waitFor(() => expect(screen.queryByRole("link", { name: wedding.title })).toBeNull())
  })

  it("renders category album previews and links to the album", async () => {
    render(<MemoryRouter><PhotographyContent page={wedding} pages={pages} language="bg" /></MemoryRouter>)
    const album = await screen.findByRole("link", { name: /Анна и Иван/ })
    expect(album.getAttribute("href")).toBe("/portfolio/anna-ivan")
    expect(apiFetchJson).toHaveBeenCalledWith("/photography-pages/wedding/albums", expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it("does not fetch unrelated albums for a service without a category", () => {
    render(<MemoryRouter><PhotographyContent page={{ ...wedding, portfolioCategoryId: null }} pages={pages} language="bg" /></MemoryRouter>)
    expect(vi.mocked(apiFetchJson).mock.calls.some(([path]) => path.endsWith("/albums"))).toBe(false)
  })

  it("edits both language content and category then updates public records", async () => {
    render(<MemoryRouter><PhotographyPagesAdmin /></MemoryRouter>)
    const edit = await screen.findAllByRole("button", { name: "Редактирай" })
    fireEvent.click(edit[1])
    fireEvent.change(screen.getByLabelText("Заглавие", { exact: true }), { target: { value: "Ново заглавие" } })
    fireEvent.click(screen.getByRole("button", { name: "English" }))
    fireEvent.change(screen.getByLabelText("Заглавие EN"), { target: { value: "New title" } })
    fireEvent.click(screen.getByRole("button", { name: "Запази" }))
    await screen.findByText("Страницата е запазена.")
    expect(pages[1]).toMatchObject({ title: "Ново заглавие", titleEn: "New title", portfolioCategoryId: 4 })
  })

  it("supports create, deactivate, and confirmed deletion without touching albums", async () => {
    render(<MemoryRouter><PhotographyPagesAdmin /></MemoryRouter>)
    await screen.findByText(wedding.title)
    fireEvent.click(screen.getByRole("button", { name: "Добави услуга" }))
    fireEvent.change(screen.getByLabelText("Заглавие", { exact: true }), { target: { value: "Нова услуга" } })
    fireEvent.change(screen.getByLabelText(/Адрес:/), { target: { value: "new-service" } })
    fireEvent.change(screen.getByLabelText("Категория за портфолио албумите"), { target: { value: "4" } })
    fireEvent.click(screen.getByRole("button", { name: "Запази" }))
    await screen.findByText("Страницата е запазена.")
    expect(pages[2]).toMatchObject({ slug: "new-service", portfolioCategoryId: 4 })
    fireEvent.click(screen.getAllByRole("button", { name: "Деактивирай" })[1])
    await screen.findByText("Услугата е деактивирана.")
    expect(pages[2].isActive).toBe(false)
    fireEvent.click(screen.getAllByRole("button", { name: "Изтрий" })[1])
    expect(pages).toHaveLength(3)
    fireEvent.click(screen.getAllByRole("button", { name: "Изтрий" }).at(-1)!)
    await screen.findByText("Услугата е изтрита.")
    expect(pages).toHaveLength(2)
    expect(vi.mocked(apiFetchJson).mock.calls.filter(([, options]) => options?.method === "DELETE").map(([path]) => path)).toEqual(["/admin/photography-pages/3"])
  })
})
