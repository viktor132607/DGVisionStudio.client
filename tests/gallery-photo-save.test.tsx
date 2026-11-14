import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import ClientGalleryEditAdmin from "../src/pages/admin/galleryPanel/ClientGalleryEditAdmin"
import {
    getAdminClientGalleryById,
    getAdminClientGalleries,
    updateAdminClientGallery,
    updateGalleryPhoto,
    setGalleryCoverImage,
    uploadGalleryPhoto,
    createAdminClientGallery,
    deleteAdminClientGallery,
} from "../src/services/clientGalleries"
import { apiFetch } from "../src/services/api"

const showToast = vi.fn()

vi.mock("../src/services/clientGalleries", () => ({
    getAdminClientGalleryById: vi.fn(),
    getAdminClientGalleries: vi.fn(),
    updateAdminClientGallery: vi.fn(),
    updateGalleryPhoto: vi.fn(),
    setGalleryCoverImage: vi.fn(),
    uploadGalleryPhoto: vi.fn(),
    deleteGalleryPhoto: vi.fn(),
    createAdminClientGallery: vi.fn(),
    deleteAdminClientGallery: vi.fn(),
}))
vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }))
vi.mock("../src/hooks/useAdminToast", () => ({ useAdminToast: () => ({ showToast }) }))
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg" } }) }))

const initialPhoto = {
    id: 51, previewUrl: "/uploads/cover.jpg", originalUrl: null,
    altText: "Стар текст", caption: "Стар надпис", displayOrder: 1,
    isCover: true, isPublished: true, showInPublicGallery: true,
    visibleToAllAuthorizedUsers: true, allowedUserIds: [],
}
const initialGallery = {
    id: 27, title: "Тестов албум", titleEn: "Test album",
    description: "", coverImageUrl: "/uploads/cover.jpg", isPublic: false,
    isPublished: false, isActive: true, galleryType: "Photoshoot",
    userGalleryStatus: "PhotoshootUploaded", photos: [initialPhoto],
    userAccesses: [], availableUsers: [],
}

beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue(new Response("[]", { status: 200 }))
    vi.mocked(getAdminClientGalleries).mockResolvedValue([])
    vi.mocked(getAdminClientGalleryById).mockResolvedValue(initialGallery as unknown as Awaited<ReturnType<typeof getAdminClientGalleryById>>)
    vi.mocked(updateAdminClientGallery).mockResolvedValue({})
    vi.mocked(updateGalleryPhoto).mockResolvedValue(initialPhoto as unknown as Awaited<ReturnType<typeof updateGalleryPhoto>>)
    vi.mocked(setGalleryCoverImage).mockRejectedValue(new Error("Gallery or photo not found."))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

async function mountEditor() {
    render(<MemoryRouter initialEntries={["/admin/client-galleries/edit?id=27"]}><ClientGalleryEditAdmin /></MemoryRouter>)
    await screen.findByDisplayValue("Стар надпис")
}

describe("admin album photo save feedback", () => {
    it("saves existing photo edits without a redundant cover API request or false 404 message", async () => {
        await mountEditor()
        fireEvent.change(screen.getByDisplayValue("Стар надпис"), { target: { value: "Нов надпис" } })
        fireEvent.click(screen.getByRole("button", { name: "Запази" }))

        await screen.findByText("Албумът беше обновен успешно.")
        expect(updateAdminClientGallery).toHaveBeenCalledWith(27, expect.any(Object))
        expect(updateGalleryPhoto).toHaveBeenCalledWith(27, 51, expect.objectContaining({
            caption: "Нов надпис",
            isCover: true,
        }))
        expect(setGalleryCoverImage).not.toHaveBeenCalled()
        expect(screen.queryByText("Gallery or photo not found.")).toBeNull()
        expect(showToast).not.toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    })

    it("persists metadata and cover selection for a newly uploaded photo", async () => {
        await mountEditor()
        vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:preview") })
        const newPhoto = { ...initialPhoto, id: 52, previewUrl: "/uploads/new-cover.jpg", isCover: false }
        vi.mocked(uploadGalleryPhoto).mockResolvedValue(newPhoto as unknown as Awaited<ReturnType<typeof uploadGalleryPhoto>>)
        vi.mocked(setGalleryCoverImage).mockResolvedValue({})

        const file = new File(["image"], "new.jpg", { type: "image/jpeg" })
        const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')
        expect(fileInput).toBeTruthy()
        fireEvent.change(fileInput!, { target: { files: [file] } })

        await waitFor(() => expect(screen.getAllByRole("button", { name: "Основна" })).toHaveLength(2))
        fireEvent.click(screen.getAllByRole("button", { name: "Основна" })[1])
        fireEvent.click(screen.getByRole("button", { name: "Запази" }))

        await screen.findByText("Албумът беше обновен успешно.")
        expect(uploadGalleryPhoto).toHaveBeenCalledWith(27, file)
        expect(updateGalleryPhoto).toHaveBeenCalledWith(27, 52, expect.objectContaining({ isCover: true }))
        expect(setGalleryCoverImage).not.toHaveBeenCalled()
    })
})

for (const isNew of [false, true]) {
    it(`continues after a failed file and retries without duplicates (${isNew ? "new" : "existing"} album)`, async () => {
        vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:preview") })
        vi.mocked(createAdminClientGallery).mockResolvedValue({ id: 27 } as never)
        if (isNew) {
            render(<MemoryRouter initialEntries={["/admin/client-galleries/create"]}><ClientGalleryEditAdmin /></MemoryRouter>)
            fireEvent.change(await screen.findByPlaceholderText("Пример: Бал Азра"), { target: { value: "New album" } })
        } else {
            await mountEditor()
        }
        const files = ["one.jpg", "bad.jpg", "three.jpg"].map(name => new File(["image"], name, { type: "image/jpeg" }))
        let failed = false
        vi.mocked(uploadGalleryPhoto).mockImplementation(async (_, file) => {
            if (file.name === "bad.jpg" && !failed) { failed = true; throw new Error("Temporary failure") }
            return { ...initialPhoto, id: 100 + files.indexOf(file) } as never
        })
        fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files } })
        fireEvent.submit(document.querySelector("form")!)
        await screen.findByText(/bad.jpg: Temporary failure/)
        expect(uploadGalleryPhoto).toHaveBeenCalledTimes(3)
        expect(deleteAdminClientGallery).not.toHaveBeenCalled()
        fireEvent.submit(document.querySelector("form")!)
        await waitFor(() => expect(uploadGalleryPhoto).toHaveBeenCalledTimes(4))
        expect(vi.mocked(uploadGalleryPhoto).mock.calls.map(call => call[1].name)).toEqual(["one.jpg", "bad.jpg", "three.jpg", "bad.jpg"])
        if (isNew) expect(createAdminClientGallery).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: "success" })))
    })
}

it("does not re-upload a photo when its metadata save fails", async () => {
    await mountEditor()
    vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:preview") })
    vi.mocked(uploadGalleryPhoto).mockResolvedValue({ ...initialPhoto, id: 90 } as never)
    let failed = false
    vi.mocked(updateGalleryPhoto).mockImplementation(async (_, id) => {
        if (id === 90 && !failed) { failed = true; throw new Error("Metadata failed") }
        return initialPhoto as never
    })
    fireEvent.change(document.querySelector('input[type="file"]')!, {
        target: { files: [new File(["photo"], "new.jpg", { type: "image/jpeg" })] },
    })
    fireEvent.submit(document.querySelector("form")!)
    await screen.findByText(/new.jpg: Metadata failed/)
    fireEvent.submit(document.querySelector("form")!)
    await screen.findByText("Албумът беше обновен успешно.")
    expect(uploadGalleryPhoto).toHaveBeenCalledTimes(1)
})
