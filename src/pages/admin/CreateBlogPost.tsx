import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { createPost } from "../../services/blogService"

export default function CreateBlogPost() {
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [isPublished, setIsPublished] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        await createPost({
            title,
            excerpt,
            content,
            isPublished
        })

        navigate("/admin/blog")
    }

    return (
        <div className="bg-white rounded-lg shadow border p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Create Blog Post</h1>

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
                    Publish immediately
                </label>

                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Save Post
                </button>
            </form>
        </div>
    )
}