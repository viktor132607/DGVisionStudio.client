import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

type Props = {
    children: React.ReactNode
}

export default function RequireAuth({ children }: Props) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user) {
        return <Navigate to="/identity/login" replace />
    }

    return <>{children}</>
}