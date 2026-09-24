import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiFetch } from "../src/services/api"
import {
    createAdminClientGallery,
    createMyClientGallery,
    deleteAdminClientGallery,
    deleteAdminPortfolioAlbum,
    deleteGalleryPhoto,
    deleteMyClientGallery,
    getAdminClientGalleries,
    getAdminClientGalleryById,
    getAdminGalleryPhotoDownloadUrl,
    getAdminPortfolioAlbums,
    getClientGalleryDetails,
    getGalleryAccesses,
    getGalleryPhotoDownloadUrl,
    getGalleryZipDownloadUrl,
    getMyClientGalleries,
    grantGalleryAccess,
    removeGalleryAccess,
    reorderGalleryPhotos,
    setGalleryCoverImage,
    updateAdminClientGallery,
    updateGalleryAccess,
    updateGalleryPhoto,
    uploadGalleryPhoto,
    uploadMyClientGalleryPhoto,
} from "../src/services/clientGalleries"

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }))

const ok = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    })

const photo = {
    id: 2,
    galleryId: 1,
    fileName: "photo.jpg",
    previewUrl: "/api/images/preview.jpg",
    originalUrl: "/api/images/original.jpg",
    downloadUrl: "/api/download/photo.jpg",
    displayOrder: 0,
}

const gallery = {
    id: 1,
    title: "Gallery",
    coverImageUrl: "/images/cover.jpg",
    photos: [photo],
}

beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
})

describe("client gallery service modules", () => {
    it("keeps the client gallery read/create/delete API behaviour", async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce(ok([gallery]))
            .mockResolvedValueOnce(ok({ id: 4, message: "created" }))
            .mockResolvedValueOnce(ok({ message: "deleted" }))
            .mockResolvedValueOnce(ok(gallery))

        expect((await getMyClientGalleries())[0].coverImageUrl).toBe("/images/cover.jpg")
        expect(await createMyClientGallery({ title: "New" } as never)).toEqual({ id: 4, message: "created" })
        expect(await deleteMyClientGallery(4)).toEqual({ message: "deleted" })
        expect((await getClientGalleryDetails(1)).photos).toHaveLength(1)
    })

    it("keeps admin gallery CRUD and normalizes enum payloads", async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce(ok([gallery]))
            .mockResolvedValueOnce(ok(gallery))
            .mockResolvedValueOnce(ok({ id: 7, message: "created" }))
            .mockResolvedValueOnce(ok({ message: "updated" }))
            .mockResolvedValueOnce(ok({ message: "deleted" }))

        expect(await getAdminClientGalleries()).toHaveLength(1)
        expect((await getAdminClientGalleryById(1)).id).toBe(1)

        await createAdminClientGallery({
            title: "A",
            galleryType: "Photoshoot",
            userGalleryStatus: "Processed",
        } as never)
        const createBody = JSON.parse(vi.mocked(apiFetch).mock.calls[2][1]!.body as string)
        expect(createBody.galleryType).toBe(1)
        expect(createBody.userGalleryStatus).toBe(2)

        expect(await updateAdminClientGallery(7, {
            galleryType: "ClientPrintUpload",
            userGalleryStatus: "Expired",
        } as never)).toEqual({ message: "updated" })
        expect(await deleteAdminClientGallery(7)).toEqual({ message: "deleted" })
    })

    it("keeps portfolio album pagination and delete behaviour", async () => {
        const album = {
            id: 3,
            portfolioCategoryId: 2,
            slug: "album",
            title: "Album",
            coverImageUrl: "/images/a.jpg",
            displayOrder: 1,
            isPublished: true,
        }
        vi.mocked(apiFetch)
            .mockResolvedValueOnce(ok([album]))
            .mockResolvedValueOnce(ok({ message: "deleted" }))

        const result = await getAdminPortfolioAlbums(2, 20)
        expect(result).toMatchObject({ page: 2, pageSize: 20, total: 1 })
        expect(result.items[0].isPublic).toBe(true)
        await expect(deleteAdminPortfolioAlbum(3)).resolves.toBeUndefined()
    })

    it("keeps access management operations", async () => {
        const access = {
            userId: "u1",
            userEmail: "user@example.com",
            previewEnabled: true,
            downloadEnabled: false,
            isExpired: false,
        }
        vi.mocked(apiFetch)
            .mockResolvedValueOnce(ok([access]))
            .mockResolvedValueOnce(ok({ message: "granted" }))
            .mockResolvedValueOnce(ok({ message: "updated" }))
            .mockResolvedValueOnce(ok({ message: "removed" }))

        expect(await getGalleryAccesses(1)).toEqual([access])
        expect(await grantGalleryAccess(1, {
            userEmail: "user@example.com",
            previewEnabled: true,
            downloadEnabled: false,
        })).toEqual({ message: "granted" })
        expect(await updateGalleryAccess(1, "u1", {
            previewEnabled: false,
            downloadEnabled: true,
        })).toEqual({ message: "updated" })
        expect(await removeGalleryAccess(1, "u1")).toEqual({ message: "removed" })
    })

    it("keeps photo upload/mutation operations and stored cover path normalization", async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce(ok(photo))
            .mockResolvedValueOnce(ok(photo))
            .mockResolvedValueOnce(ok(photo))
            .mockResolvedValueOnce(ok({ message: "deleted" }))
            .mockResolvedValueOnce(ok({ message: "cover" }))
            .mockResolvedValueOnce(ok({ message: "reordered" }))

        const file = new File(["image"], "photo.jpg", { type: "image/jpeg" })
        expect((await uploadMyClientGalleryPhoto(1, file)).id).toBe(2)
        expect((await uploadGalleryPhoto(1, file)).id).toBe(2)
        expect((await updateGalleryPhoto(1, 2, { displayOrder: 3 } as never)).id).toBe(2)
        expect(await deleteGalleryPhoto(1, 2)).toEqual({ message: "deleted" })
        expect(await setGalleryCoverImage(1, { coverImageUrl: "https://cdn.example.com/folder/cover.jpg" }))
            .toEqual({ message: "cover" })
        const coverBody = JSON.parse(vi.mocked(apiFetch).mock.calls[4][1]!.body as string)
        expect(coverBody.coverImageUrl).toBe("folder/cover.jpg")
        expect(await reorderGalleryPhotos(1, { orderedPhotoIds: [2, 1] }))
            .toEqual({ message: "reordered" })
    })

    it("rejects invalid photo uploads before making a request", async () => {
        const invalid = new File(["text"], "file.txt", { type: "text/plain" })
        await expect(uploadGalleryPhoto(1, invalid)).rejects.toThrow("Only image files")
        await expect(uploadMyClientGalleryPhoto(1, invalid)).rejects.toThrow("Only image files")
        expect(apiFetch).not.toHaveBeenCalled()
    })

    it("preserves all download URL helpers", () => {
        expect(getGalleryPhotoDownloadUrl(1, 2)).toContain("/api/client-galleries/1/photos/2/download")
        expect(getAdminGalleryPhotoDownloadUrl(1, 2)).toContain("/api/admin/client-galleries/1/photos/2/download")
        expect(getGalleryZipDownloadUrl(1)).toContain("/api/client-galleries/1/download")
    })

    it("preserves API error details", async () => {
        vi.mocked(apiFetch).mockResolvedValueOnce(ok({ message: "generic", details: "specific" }, 400))
        await expect(deleteAdminClientGallery(1)).rejects.toThrow("specific")
    })
})
