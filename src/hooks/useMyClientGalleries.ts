import { useCallback, useEffect, useState } from "react"
import { getMyClientGalleries } from "../services/clientGalleries"
import type { MyClientGalleryDto } from "../types/clientGallery"

export function useMyClientGalleries() {
    const [galleries, setGalleries] = useState<MyClientGalleryDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const reload = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const data = await getMyClientGalleries()
            setGalleries(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load galleries.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            setLoading(true)
            setError("")

            try {
                const data = await getMyClientGalleries()
                if (!cancelled) {
                    setGalleries(data)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load galleries.")
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
    }, [])

    return {
        galleries,
        loading,
        error,
        reload,
    }
}