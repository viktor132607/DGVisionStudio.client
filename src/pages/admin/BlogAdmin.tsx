import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { deletePost, getPosts } from "../../services/blogService"

type BlogPost = {
    id: number
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

export default function BlogAdmin() {
    const [posts, setPosts] = useState<BlogPost[]>([])

    const handleDelete = async (id: number) => {
        await deletePost(id)

        const refreshedPosts = await getPosts()
        setPosts(refreshedPosts)
    }

    useEffect(() => {
        let isMounted = true

        getPosts().then((data) => {
            if (isMounted) {
                setPosts(data)
            }
        })

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Blog Admin</h1>

                <Link
                    to="/admin/blog/create"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Create Post
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4">Title</th>
                            <th className="text-left p-4">Excerpt</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="border-b">
                                <td className="p-4 font-medium">{post.title}</td>
                                <td className="p-4 text-gray-600">{post.excerpt}</td>
                                <td className="p-4">
                                    {post.isPublished ? "Published" : "Draft"}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/blog/edit/${post.id}`}
                                            className="border px-3 py-1 rounded"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() => void handleDelete(post.id)}
                                            className="border border-red-500 text-red-500 px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}