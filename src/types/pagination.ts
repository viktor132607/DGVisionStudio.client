export type PagedResultDto<T> = {
    page: number
    pageSize: number
    total: number
    totalPages: number
    items: T[]
}

export type PagedQueryDto = {
    page?: number
    pageSize?: number
}