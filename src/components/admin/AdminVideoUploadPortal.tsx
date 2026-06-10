import { ChangeEvent, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { apiFetch } from "../../services/api"

const MAX_VIDEO_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"])

function getGalleryId(search: string) {
    const params = new URLSearchParams(search)
    const id = Number(params.get("id"))
    return Number.isFinite(id) && id > 0 ? id : null
}

export default function AdminVideoUploadPortal() {
    const location = useLocation()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [portalRoot, setPortalRoot] = useState<HTMLSpanElement | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const galleryId = getGalleryId(location.search)

    useEffect(() => {
        if (!location.pathname.endsWith("/admin/client-galleries/edit")) return

        const mount = () => {
            const fileInput = document.querySelector('input[type="file"][accept="image/*"]')
            const fileLabel = fileInput?.closest("label")
            if (!fileLabel || !fileLabel.parentElement) return false

            const existingRoot = document.getElementById("admin-video-upload-portal-root") as HTMLSpanElement | null
            const root = existingRoot || document.createElement("span")
            root.id = "admin-video-upload-portal-root"
            root.className = "inline-flex"

            if (!existingRoot) {
                fileLabel.parentElement.insertBefore(root, fileLabel.nextSibling)
            }

            setPortalRoot(root)
            return true
        }

        if (mount()) return

        const intervalId = window.setInterval(() => {
            if (mount()) window.clearInterval(intervalId)
        }, 150)

        return () => window.clearInterval(intervalId)
    }, [location.pathname, location.search])

    if (!location.pathname.endsWith("/admin/client-galleries/edit") || !portalRoot) return null

    const uploadVideo = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""

        if (!file) return

        if (!galleryId) {
            alert("Първо запази/създай албума, после качи видео.")
            return
        }

        if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
            alert("Можеш да качваш само MP4, MOV или WEBM видео.")
            return
        }

        if (file.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
            alert("Видеото е над 100 MB.")
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await apiFetch(`/admin/client-galleries/${galleryId}/photos/upload`, {
                method: "POST",
                body: formData,
                skipJsonContentType: true,
            })

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.details || data?.message || "Качването на видеото беше неуспешно.")
            }

            window.location.reload()
        } catch (err) {
            alert(err instanceof Error ? err.message : "Качването на видеото беше неуспешно.")
        } finally {
            setIsUploading(false)
        }
    }

    return createPortal(
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="ml-2 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isUploading ? "Качване..." : "Качи видео"}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={uploadVideo}
            />
        </>,
        portalRoot
    )
}
