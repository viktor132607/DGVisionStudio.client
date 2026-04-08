import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "../services/api"
import { parseApiErrorResponse } from "../utils/identity"

type User = {
    email: string
    roles: string[]
}

type LoginResult = {
    success: boolean
    errors: string[]
}

type AuthContextType = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<LoginResult>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    clearUser: () => void
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const clearUser = () => {
        setUser(null)
    }

    const refreshUser = async () => {
        try {
            const res = await apiFetch("/auth/me", {
                method: "GET",
                skipJsonContentType: true,
            })

            if (!res.ok) {
                setUser(null)
                return
            }

            const data = await res.json()

            if (data?.isAuthenticated) {
                setUser({
                    email: data.email ?? "",
                    roles: Array.isArray(data.roles) ? data.roles : [],
                })
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        }
    }

    useEffect(() => {
        refreshUser().finally(() => setLoading(false))
    }, [])

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            const res = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                const { errors } = await parseApiErrorResponse(res)
                return { success: false, errors }
            }

            await refreshUser()
            return { success: true, errors: [] }
        } catch {
            return { success: false, errors: ["Login failed."] }
        }
    }

    const logout = async () => {
        try {
            await apiFetch("/auth/logout", {
                method: "POST",
            })
        } finally {
            setUser(null)
        }
    }

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        clearUser,
        isAdmin: !!user?.roles?.includes("Admin"),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context
}