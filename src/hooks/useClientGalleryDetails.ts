import { useEffect, useState } from "react"
import { getClientGalleryDetails } from "../services/clientGalleries"
import type { ClientGalleryDetailsDto } from "../types/clientGallery"

export function useClientGalleryDetails(galleryId?: number) {
    const [gallery, setGallery] = useState<ClientGalleryDetailsDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false

        if (!galleryId) {
            setGallery(null)
            setLoading(false)
            setError("Invalid gallery id.")
            return
        }

        const load = async () => {
            setLoading(true)
            setError("")

            try {
                const data = await getClientGalleryDetails(galleryId)
                if (!cancelled) {
                    setGallery(data)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load gallery.")
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [galleryId])

    return {
        gallery,
        loading,
        error,
    }
}