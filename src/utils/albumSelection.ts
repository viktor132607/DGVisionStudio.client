export type AlbumPage<T> = { page: number; pageSize: number; total: number; totalPages: number; items: T[] }

export async function fetchEveryAlbum<T extends { id: number }>(
    fetchPage: (page: number) => Promise<AlbumPage<T> | T[]>
): Promise<T[]> {
    const items = new Map<number, T>()
    for (let page = 1; ; page++) {
        const result = await fetchPage(page)
        if (Array.isArray(result)) return result
        if (!Array.isArray(result.items) || result.page !== page || !Number.isInteger(result.totalPages)) {
            throw new Error("Невалиден отговор при зареждане на албумите.")
        }
        const before = items.size
        for (const album of result.items) items.set(album.id, album)
        if (page >= result.totalPages) {
            if (items.size !== result.total) throw new Error("Списъкът с албуми е променен. Обнови го и опитай отново.")
            return [...items.values()]
        }
        if (items.size === before) throw new Error("Не всички албуми бяха заредени. Обнови списъка.")
    }
}

export function toggleVisibleSelection(selected: Set<number>, visibleIds: number[]): Set<number> {
    const next = new Set(selected)
    const remove = visibleIds.length > 0 && visibleIds.every(id => next.has(id))
    for (const id of visibleIds) {
        if (remove) next.delete(id)
        else next.add(id)
    }
    return next
}
