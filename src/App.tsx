import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import About from "./pages/About"
import Services from "./pages/Services"
import Contact from "./pages/Contact"
import Privacy from "./pages/Privacy"
import Cookies from "./pages/Cookies"
import Terms from "./pages/Terms"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"

export default function App() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 dark:bg-black dark:text-white">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[1700px] mx-auto">
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
    </div>
  )
}