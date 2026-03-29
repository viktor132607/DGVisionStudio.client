import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import "./index.css"
import "./i18n/i18n"
import App from "./App"
// import { AuthProvider } from "./context/AuthContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* <AuthProvider> */}
        <App />
        {/* </AuthProvider> */}
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)