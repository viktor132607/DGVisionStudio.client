import { apiFetchJson } from "./api"

type BlogPost = {
    id: number
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

type BlogPostInput = {
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

export async function getPosts(): Promise<BlogPost[]> {
    return await apiFetchJson<BlogPost[]>("/blog", {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function getPost(id: number): Promise<BlogPost> {
    return await apiFetchJson<BlogPost>(`/blog/${id}`, {
        method: "GET",
        skipJsonContentType: true,
    })
}

export async function createPost(data: BlogPostInput): Promise<BlogPost> {
    return await apiFetchJson<BlogPost>("/blog", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export async function updatePost(id: number, data: BlogPostInput): Promise<BlogPost> {
    return await apiFetchJson<BlogPost>(`/blog/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}

export async function deletePost(id: number): Promise<void> {
    await apiFetchJson<void>(`/blog/${id}`, {
        method: "DELETE",
    })
}