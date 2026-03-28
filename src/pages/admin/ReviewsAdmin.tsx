import { useState } from "react"

type Review = {
    id: number
    name: string
    rating: number
    comment: string
    approved: boolean
}

export default function ReviewsAdmin() {
    const [reviews] = useState<Review[]>([
        {
            id: 1,
            name: "Ivan Petrov",
            rating: 5,
            comment: "Excellent accounting service.",
            approved: true
        },
        {
            id: 2,
            name: "Maria Ivanova",
            rating: 4,
            comment: "Very professional and helpful.",
            approved: false
        }
    ])

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Reviews Admin</h1>

                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4">Name</th>
                                <th className="text-left p-4">Rating</th>
                                <th className="text-left p-4">Comment</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} className="border-b">
                                    <td className="p-4 font-medium">{review.name}</td>
                                    <td className="p-4">{review.rating}/5</td>
                                    <td className="p-4 text-gray-600">{review.comment}</td>
                                    <td className="p-4">
                                        {review.approved ? "Approved" : "Pending"}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="border px-3 py-1 rounded">
                                                Approve
                                            </button>
                                            <button className="border border-red-500 text-red-500 px-3 py-1 rounded">
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
        </div>
    )
}