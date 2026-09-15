import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPost } from "../services/blogService"
import Seo from "../components/Seo"
import NotFound from "./NotFound"

type BlogPostType = {
    id: number
    title: string
    excerpt: string
    content: string
    isPublished: boolean
}

export default function BlogPost() {
    const { slug } = useParams()
    const [post, setPost] = useState<BlogPostType | null>(null)
    const [failed, setFailed] = useState(false)
    const validId = Boolean(slug && /^[1-9]\d*$/.test(slug))

    useEffect(() => {
        let active = true
        setPost(null)
        setFailed(false)
        if (!validId) return
        getPost(Number(slug)).then((data) => {
            if (!active) return
            if (data.isPublished) setPost(data)
            else setFailed(true)
        }).catch(() => { if (active) setFailed(true) })
        return () => { active = false }
    }, [slug, validId])

    if (!validId || failed) return <NotFound />

    if (!post) {
        return <div className="min-h-screen bg-gray-100 py-10 px-4"><Seo title="Блог за фотография" description="Публикация от DG Vision Studio." canonical={`/blog/${slug}`} />Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <Seo language="bg" title={post.title} description={post.excerpt || post.content.slice(0, 160)} canonical={`/blog/${post.id}`} type="article" jsonLd={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, url: `https://dgvisionstudio.com/blog/${post.id}`, publisher: { "@type": "Organization", name: "DG Vision Studio", url: "https://dgvisionstudio.com/" } }} />
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
