import { describe, expect, it, vi } from "vitest"
import { uploadPhotoBatch } from "../src/services/clientGalleries/uploadBatch"
import { validatePhotoFile } from "../src/services/clientGalleries/shared"

describe("photo upload batch", () => {
    it("tries every file and only removes confirmed uploads from the retry queue", async () => {
        const files = ["a.jpg", "b.jpg", "c.jpg"].map(name => new File(["photo"], name))
        let pending = [...files]
        const upload = vi.fn(async (file: File) => { if (file === files[1]) throw new Error("offline") })
        const errors = await uploadPhotoBatch(files, upload, file => { pending = pending.filter(item => item !== file) })
        expect(upload).toHaveBeenCalledTimes(3)
        expect(errors).toEqual(["b.jpg: offline"])
        expect(pending).toEqual([files[1]])
    })
    it.each(["", "application/octet-stream", "image/jpeg"])("accepts supported files with MIME %s", type => {
        expect(() => validatePhotoFile(new File(["image"], "PHOTO.JPG", { type }))).not.toThrow()
    })
    it.each(["photo.heic", "photo.gif", "photo.svg"])("rejects unsupported %s before upload", name => {
        expect(() => validatePhotoFile(new File(["image"], name, { type: "image/heic" }))).toThrow()
    })
})
