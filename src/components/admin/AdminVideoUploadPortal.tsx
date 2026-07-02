import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { apiFetch } from "../../services/api"

const MAX_VIDEO_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"])
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"]
const VIDEO_EXTENSION_PATTERN = /\.(mp4|mov|webm|m4v)(\?|#|$)/i

type GalleryMedia = {
    id: number
    previewUrl?: string | null
    originalUrl?: string | null
    name?: string | null
    altText?: string | null
    caption?: string | null
}

function getGalleryId(search: string) {
    const params = new URLSearchParams(search)
    const id = Number(params.get("id"))
    return Number.isFinite(id) && id > 0 ? id : null
}

function isAllowedVideo(file: File) {
    const name = file.name.toLowerCase()
    const hasAllowedExtension = ALLOWED_VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension))
    const hasAllowedType = !file.type || ALLOWED_VIDEO_TYPES.has(file.type) || file.type.startsWith("video/")

    return hasAllowedExtension && hasAllowedType
}

function normalizePath(value?: string | null) {
    if (!value) return ""

    try {
        return new URL(value, window.location.origin).pathname.replace(/^\/+/, "")
    } catch {
        return value.replace(/^\/+/, "")
    }
}

function mediaKey(value?: string | null) {
    return normalizePath(value).toLowerCase()
}

function findMediaBySrc(media: GalleryMedia[], src: string) {
    const key = mediaKey(src)
    if (!key) return null

    return media.find((item) => mediaKey(item.previewUrl) === key || mediaKey(item.originalUrl) === key) || null
}

function getCardRoot(element: Element) {
    let current: Element | null = element

    while (current && current.parentElement) {
        const className = current.getAttribute("class") || ""
        if (className.includes("overflow-hidden") && className.includes("rounded-2xl") && className.includes("border")) {
            return current as HTMLElement
        }

        current = current.parentElement
    }

    return null
}

function getCardControls(card: HTMLElement) {
    return Array.from(card.querySelectorAll<HTMLElement>("div")).find((node) => {
        const className = node.getAttribute("class") || ""
        return className.includes("space-y-3") && className.includes("p-3")
    }) || null
}

async function saveMediaName(galleryId: number, mediaId: number, name: string) {
    await apiFetch(`/admin/client-galleries/${galleryId}/media/${mediaId}/metadata`, {
        method: "PUT",
        body: JSON.stringify({ name }),
    })
}

function insertNameField(card: HTMLElement, controls: HTMLElement, galleryId: number, media: GalleryMedia) {
    if (card.querySelector(`[data-media-name-field="${media.id}"]`)) return

    const wrapper = document.createElement("div")
    wrapper.dataset.mediaNameField = String(media.id)

    const label = document.createElement("label")
    label.className = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-zinc-400"
    label.textContent = "Име"

    const input = document.createElement("input")
    input.value = media.name || ""
    input.className = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"

    input.addEventListener("click", (event) => event.stopPropagation())
    input.addEventListener("change", () => {
        void saveMediaName(galleryId, media.id, input.value).catch(() => undefined)
    })
    input.addEventListener("blur", () => {
        void saveMediaName(galleryId, media.id, input.value).catch(() => undefined)
    })

    wrapper.append(label, input)
    controls.insertBefore(wrapper, controls.firstChild)
}

function patchVideoCards(media: GalleryMedia[], galleryId: number | null) {
    const mediaElements = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video"))

    mediaElements.forEach((element) => {
        const src = element.getAttribute("src") || ""
        const mediaItem = findMediaBySrc(media, src)
        const card = getCardRoot(element)
        const controls = card ? getCardControls(card) : null

        if (card && controls && galleryId && mediaItem) {
            insertNameField(card, controls, galleryId, mediaItem)
        }

        if (!(element instanceof HTMLImageElement)) return
        if (!VIDEO_EXTENSION_PATTERN.test(src)) return
        if (element.dataset.videoPatched === "true") return

        const video = document.createElement("video")
        video.src = src
        video.controls = true
        video.playsInline = true
        video.preload = "metadata"
        video.className = element.className || "h-full w-full object-contain"
        video.style.backgroundColor = "black"
        video.dataset.videoPatched = "true"
        video.setAttribute("aria-label", mediaItem?.name || element.getAttribute("alt") || "Video")

        element.dataset.videoPatched = "true"
        element.replaceWith(video)
    })
}

export default function AdminVideoUploadPortal() {
    const location = useLocation()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [portalRoot, setPortalRoot] = useState<HTMLSpanElement | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [media, setMedia] = useState<GalleryMedia[]>([])
    const galleryId = getGalleryId(location.search)

    useEffect(() => {
        if (!location.pathname.endsWith("/admin/client-galleries/edit") || !galleryId) return

        const loadMedia = async () => {
            const response = await apiFetch(`/admin/client-galleries/${galleryId}`, {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!response.ok) return

            const data = await response.json().catch(() => null)
            setMedia(Array.isArray(data?.photos) ? data.photos : [])
        }

        void loadMedia()
    }, [galleryId, location.pathname, location.search])

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

    useEffect(() => {
        if (!location.pathname.endsWith("/admin/client-galleries/edit")) return

        patchVideoCards(media, galleryId)
        const intervalId = window.setInterval(() => patchVideoCards(media, galleryId), 500)

        return () => window.clearInterval(intervalId)
    }, [galleryId, location.pathname, location.search, media])

    if (!location.pathname.endsWith("/admin/client-galleries/edit") || !portalRoot) return null

    const uploadVideo = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""

        if (!file) return

        if (!galleryId) {
            alert("Първо запази/създай албума, после качи видео.")
            return
        }

        if (!isAllowedVideo(file)) {
            alert("Можеш да качваш само MP4, MOV, WEBM или M4V видео.")
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

            const response = await apiFetch(`/admin/client-galleries/${galleryId}/videos/upload`, {
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
                accept="video/*,.mp4,.mov,.webm,.m4v"
                className="hidden"
                onChange={uploadVideo}
            />
        </>,
        portalRoot
    )
}
