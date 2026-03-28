import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

type Props = {
    children: React.ReactNode
}

export default function RequireAdmin({ children }: Props) {
    const { user, loading, isAdmin } = useAuth()

    if (loading) return null

    if (!user) {
        return <Navigate to="/identity/login" replace />
    }

    if (!isAdmin) {
        return <Navigate to="/identity/access-denied" replace />
    }

    return <>{children}</>
}