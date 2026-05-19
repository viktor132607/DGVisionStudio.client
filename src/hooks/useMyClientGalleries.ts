import { useCallback, useEffect, useRef, useState } from "react"
import { getMyClientGalleries } from "../services/clientGalleries"
import type { MyClientGalleryDto } from "../types/clientGallery"

export function useMyClientGalleries() {
    const [galleries, setGalleries] = useState<MyClientGalleryDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const mountedRef = useRef(true)

    const reload = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const data = await getMyClientGalleries()

            if (mountedRef.current) {
                setGalleries(data)
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof Error ? err.message : "Failed to load galleries.")
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        mountedRef.current = true

        void reload()

        return () => {
            mountedRef.current = false
        }
    }, [reload])

    return {
        galleries,
        loading,
        error,
        reload,
    }
}