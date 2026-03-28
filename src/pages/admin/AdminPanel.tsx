import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

export default function AdminPanel() {
    const [stats, setStats] = useState({
        users: 0,
        contacts: 0,
        serviceRequests: 0,
        blogPosts: 0
    })

    useEffect(() => {
        fetch("/api/admin/dashboard", {
            credentials: "include"
        })
            .then(r => r.json())
            .then(data => setStats(data))
    }, [])

    const cards = [
        {
            title: "Users",
            value: stats.users,
            link: "/admin/users",
            desc: "Manage users"
        },
        {
            title: "Contact Requests",
            value: stats.contacts,
            link: "/admin/contact-requests",
            desc: "Manage contact messages"
        },
        {
            title: "Service Requests",
            value: stats.serviceRequests,
            link: "/admin/service-requests",
            desc: "Manage client inquiries"
        },
        {
            title: "Blog Posts",
            value: stats.blogPosts,
            link: "/admin/blog",
            desc: "Manage blog posts"
        }
    ]

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map(card => (
                        <Link
                            key={card.title}
                            to={card.link}
                            className="bg-white rounded-lg shadow p-4 border hover:shadow-lg hover:-translate-y-0.5 transition"
                        >
                            <h3 className="text-sm text-gray-500">{card.title}</h3>
                            <p className="text-2xl font-bold mb-2">{card.value}</p>
                            <p className="text-gray-600 text-sm">{card.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}