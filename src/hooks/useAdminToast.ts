import { useContext } from "react"
import {
    AdminToastContext,
    type AdminToastContextValue,
} from "../components/admin/AdminToastProvider"

export function useAdminToast(): AdminToastContextValue {
    const context = useContext(AdminToastContext)

    if (!context) {
        throw new Error("useAdminToast must be used within AdminToastProvider.")
    }

    return context
}