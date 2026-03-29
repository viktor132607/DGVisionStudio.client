import { Routes, Route, useLocation } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"

import Home from "./pages/Home"
import About from "./pages/About"
import Services from "./pages/Services"
import Contact from "./pages/Contact"
import Privacy from "./pages/Privacy"
import Cookies from "./pages/Cookies"
import Terms from "./pages/Terms"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"

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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
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