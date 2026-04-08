import { Routes, Route, useLocation } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"

import Home from "./pages/Home"
import About from "./pages/About"
import Services from "./pages/Portfolio"
import Contact from "./pages/Contact"
import Privacy from "./pages/Privacy"
import Cookies from "./pages/Cookies"
import Terms from "./pages/Terms"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"
import PriceList from "./pages/PriceList"

import Login from "./pages/identity/Login"
import Register from "./pages/identity/Register"
import ForgotPassword from "./pages/identity/ForgotPassword"
import ResetPassword from "./pages/identity/ResetPassword"
// import ConfirmEmail from "./pages/identity/ConfirmEmail"
import Profile from "./pages/identity/Profile"
import ChangePassword from "./pages/identity/ChangePassword"
import AccessDenied from "./pages/identity/AccessDenied"
import MyGalleryDetails from "./pages/identity/MyGalleryDetails"
import DeleteAccount from "./pages/identity/DeleteAccount"

import RequireAuth from "./components/RequireAuth"
import RequireAdmin from "./components/RequireAdmin"

import AdminRoutes from "./pages/admin/AdminRoutes"

function AppContent() {
  const location = useLocation()
  const isPortfolioPage = location.pathname === "/portfolio"

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
      <ScrollToTop />
      <Navbar />

      <div className="h-16 shrink-0 lg:h-20" />

      <main className="w-full flex-1">
        <div className={isPortfolioPage ? "w-full max-w-none" : "mx-auto w-full max-w-[1700px]"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Home />} />
            <Route path="/portfolio" element={<Services />} />
            <Route path="/pricing" element={<PriceList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/identity/login" element={<Login />} />
            <Route path="/identity/register" element={<Register />} />
            <Route path="/identity/forgot-password" element={<ForgotPassword />} />
            <Route path="/identity/reset-password" element={<ResetPassword />} />
            {/*
            Confirm email логиката е временно спряна.
            <Route path="/identity/confirm-email" element={<ConfirmEmail />} />
            */}
            <Route
              path="/identity/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/identity/galleries/:id"
              element={
                <RequireAuth>
                  <MyGalleryDetails />
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
            <Route
              path="/identity/delete-account"
              element={
                <RequireAuth>
                  <DeleteAccount />
                </RequireAuth>
              }
            />
            <Route path="/identity/access-denied" element={<AccessDenied />} />

            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <AdminRoutes />
                </RequireAdmin>
              }
            />
          </Routes>
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}

export default function App() {
  return <AppContent />
}