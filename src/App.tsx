import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Routes, Route, useLocation } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"
import GlobalPageLoader from "./components/GlobalPageLoader"

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
  const { i18n } = useTranslation()
  const location = useLocation()
  const isBg = i18n.language?.toLowerCase().startsWith("bg")
  const contactBubbleLabel = isBg ? "Свържи се" : "Contact"
  const isPortfolioPage = location.pathname === "/portfolio"
  const isAdminPage = location.pathname.startsWith("/admin")
  const isContactPage = location.pathname === "/contact"
  const showContactBubble = !isAdminPage && !isContactPage
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    const finishLoading = () => {
      setTimeout(() => setIsPageLoading(false), 500)
    }

    if (document.readyState === "complete") {
      finishLoading()
    } else {
      window.addEventListener("load", finishLoading)
    }

    return () => window.removeEventListener("load", finishLoading)
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
      {isPageLoading ? <GlobalPageLoader /> : null}

      <ScrollToTop />
      <Navbar />

      <div className="h-[72px] shrink-0 sm:h-[78px] xl:h-[88px]" />

      <main className="w-full flex-1">
        <div className={isAdminPage || isPortfolioPage ? "w-full max-w-none" : "mx-auto w-full max-w-[1700px]"}>
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

      {showContactBubble ? (
        <Link
          to="/contact"
          aria-label={contactBubbleLabel}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow-2xl shadow-black/30 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:right-6 xl:bottom-8 xl:right-8 xl:px-5 xl:py-4 xl:text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
          {contactBubbleLabel}
        </Link>
      ) : null}

      {!isAdminPage ? <Footer /> : null}
      {!isAdminPage ? <CookieBanner /> : null}
    </div>
  )
}

export default function App() {
  return <AppContent />
}
