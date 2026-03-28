import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getPosts } from "../services/blogService"

type BlogPost = {
    id: number
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

export default function Blog() {
    const [posts, setPosts] = useState<BlogPost[]>([])

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
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Blog</h1>

                <div className="grid gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.id}`}
                            className="bg-white border rounded-lg p-6 shadow hover:shadow-md"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                {post.title}
                            </h2>

                            <p className="text-gray-600 mb-2">
                                {post.excerpt}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}