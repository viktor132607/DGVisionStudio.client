import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPost } from "../services/blogService"

type BlogPostType = {
    id: number
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

export default function BlogPost() {
    const { id } = useParams()
    const [post, setPost] = useState<BlogPostType | null>(null)

    useEffect(() => {
        if (!id) return

        getPost(Number(id)).then((data) => {
            setPost(data)
        })
    }, [id])

    if (!post) {
        return <div className="min-h-screen bg-gray-100 py-10 px-4">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white border rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold mb-4">
                    {post.title}
                </h1>

                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                </p>
            </div>
        </div>
    )
}