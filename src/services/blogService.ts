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

const API = `${import.meta.env.VITE_API_URL || ""}/api/blog`

export async function getPosts(): Promise<BlogPost[]> {
    const res = await fetch(API)
    return res.json()
}

export async function getPost(id: number): Promise<BlogPost> {
    const res = await fetch(`${API}/${id}`)
    return res.json()
}

export async function createPost(data: BlogPostInput): Promise<BlogPost> {
    const res = await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
    })

    return res.json()
}

export async function updatePost(id: number, data: BlogPostInput): Promise<BlogPost> {
    const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
    })

    return res.json()
}

export async function deletePost(id: number): Promise<void> {
    await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include"
    })
}