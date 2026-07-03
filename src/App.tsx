import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Routes, Route, useLocation } from "react-router-dom"
import "./styles/homeSlideshowRatio.css"
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
  const contactBubbleLabel = isBg ? "Свържете се" : "Contact us"
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

      <div className="h-[72px] shrink-0 md:h-[132px] xl:h-[84px] 2xl:h-[88px]" />

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
            <Route path="/identity/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/identity/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
            <Route path="/identity/access-denied" element={<AccessDenied />} />
            <Route path="/identity/my-galleries/:id" element={<RequireAuth><MyGalleryDetails /></RequireAuth>} />
            <Route path="/identity/delete-account" element={<RequireAuth><DeleteAccount /></RequireAuth>} />

            <Route path="/admin/*" element={<RequireAdmin><AdminRoutes /></RequireAdmin>} />
          </Routes>
        </div>
      </main>

      {showContactBubble ? (
        <Link
          to="/contact"
          aria-label={contactBubbleLabel}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          ✉
        </Link>
      ) : null}

      <CookieBanner />
      <Footer />
    </div>
  )
}

export default function App() {
  return <AppContent />
}
