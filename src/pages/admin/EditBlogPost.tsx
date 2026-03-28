import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPost, updatePost } from "../../services/blogService"

export default function EditBlogPost() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [isPublished, setIsPublished] = useState(false)

    useEffect(() => {
        if (!id) return

        getPost(Number(id)).then((post) => {
            setTitle(post.title)
            setExcerpt(post.excerpt)
            setContent(post.content)
            setIsPublished(post.isPublished)
        })
    }, [id])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!id) return

        await updatePost(Number(id), {
            title,
            excerpt,
            content,
            isPublished
        })

        navigate("/admin/blog")
    }

    return (
        <div className="bg-white rounded-lg shadow border p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full border p-2 rounded"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full border p-2 rounded"
                        rows={8}
                    />
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    Published
                </label>

                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Update Post
                </button>
            </form>
        </div>
    )
}