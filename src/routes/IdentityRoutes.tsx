import { Route } from "react-router-dom"

import Login from "../pages/identity/Login"
import Register from "../pages/identity/Register"
import Profile from "../pages/identity/Profile"
import ChangePassword from "../pages/identity/ChangePassword"
import ForgotPassword from "../pages/identity/ForgotPassword"
import ResetPassword from "../pages/identity/ResetPassword"
import ConfirmEmail from "../pages/identity/ConfirmEmail"
import AccessDenied from "../pages/identity/AccessDenied"

import RequireAuth from "../components/RequireAuth"

export const IdentityRoutes = (
    <>
        <Route path="/identity/login" element={<Login />} />
        <Route path="/identity/register" element={<Register />} />
        <Route path="/identity/forgot-password" element={<ForgotPassword />} />
        <Route path="/identity/reset-password" element={<ResetPassword />} />
        <Route path="/identity/confirm-email" element={<ConfirmEmail />} />
        <Route path="/identity/access-denied" element={<AccessDenied />} />

        <Route
            path="/identity/profile"
            element={
                <RequireAuth>
                    <Profile />
                </RequireAuth>
            }
        />

        <Route
            path="/identity/change-password"
            element={
                <RequireAuth>
                    <ChangePassword />
                </RequireAuth>
            }
        />
    </>
)