import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Login from "./pages/Login"
import { getApiErrorMessage, login } from "./lib/auth"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Login
      onSubmit={async ({ phoneNumber, password, remember }) => {
        try {
        await login(phoneNumber, password, remember)
        window.location.assign("/customer_dashboard.html")
        } catch (error) {
        throw new Error(getApiErrorMessage(error))
        }
      }}
    />
  </StrictMode>,
)
