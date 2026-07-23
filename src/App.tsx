import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Routes, Route, useLocation } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar"
import MobileProfileShortcut from "./components/MobileProfileShortcut"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"
import GlobalPageLoader from "./components/GlobalPageLoader"
import AdminServiceAddShortcut from "./components/AdminServiceAddShortcut"

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
  const isHomePage = location.pathname === "/" || location.pathname === "/services"
  const isPortfolioPage =
    location.pathname === "/portfolio" || location.pathname.startsWith("/portfolio/")
  const isAdminPage = location.pathname.startsWith("/admin")
  const isContactPage = location.pathname === "/contact"
  const isProfilePage = location.pathname === "/identity/profile"
  const isGalleryDetailsPage = location.pathname.startsWith("/identity/galleries/")
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
    <div
      className={`flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 dark:bg-zinc-900 dark:text-white ${
        isProfilePage ? "dg-profile-page" : ""
      } ${isGalleryDetailsPage ? "dg-gallery-details-page" : ""}`}
    >
      {isPageLoading ? <GlobalPageLoader /> : null}

      <ScrollToTop />
      <Navbar />
      <MobileProfileShortcut />
      <AdminServiceAddShortcut />

      <style>{`
        @media (max-width: 767px) {
          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.35rem !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] {
            min-width: 0 !important;
            border-radius: 0.85rem !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > button > [class~="relative"][class~="overflow-hidden"] {
            aspect-ratio: 4 / 5 !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] img,
          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > [class~="absolute"][class~="bottom-0"] {
            opacity: 1 !important;
            padding: 0.45rem !important;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0)) !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > [class~="absolute"][class~="bottom-0"] > div {
            gap: 0.3rem !important;
          }

          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > [class~="absolute"][class~="bottom-0"] button,
          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > [class~="absolute"][class~="bottom-0"] a {
            min-width: 0 !important;
            height: 2rem !important;
            padding: 0 0.55rem !important;
            font-size: 0.68rem !important;
            line-height: 1 !important;
          }

          .dg-gallery-details-page main > div {
            max-width: none !important;
          }
        }

        @media (hover: none) {
          .dg-profile-page [class~="space-y-4"][class~="scroll-mt-24"] > [class~="group"][class~="relative"] > [class~="absolute"][class~="bottom-0"] {
            opacity: 1 !important;
          }
        }
      `}</style>

      <div
        className={
          isHomePage
            ? "h-[72px] shrink-0 md:h-[9svh]"
            : "h-[72px] shrink-0 md:h-[76px] xl:h-[84px] 2xl:h-[88px]"
        }
      />

      <main className="w-full flex-1">
        <div className={isAdminPage || isPortfolioPage || isHomePage ? "w-full max-w-none" : "mx-auto w-full max-w-[1800px]"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Home />} />
            <Route path="/portfolio" element={<Services />} />
            <Route path="/portfolio/:albumSlug" element={<Services />} />
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
          title={contactBubbleLabel}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-0 z-50 inline-flex h-12 w-12 items-center justify-center rounded-l-full rounded-r-none bg-slate-950 text-white shadow-2xl shadow-black/30 ring-1 ring-white/20 transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200 xl:bottom-8 xl:h-14 xl:w-14"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 xl:h-6 xl:w-6"
            aria-hidden="true"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
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
