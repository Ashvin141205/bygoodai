import "core-js/features/object/from-entries"
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import "./App.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Provider } from "react-redux"
import { store, persistor } from "./redux/store"
import { PersistGate } from "redux-persist/integration/react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"
import { registerFirebaseServiceWorker } from "./firebase"
import { reportWebVitals } from "./utils/reportWebVitals"

const CHUNK_RELOAD_KEY = "chunk_reload_attempted_at"
const CHUNK_RELOAD_WINDOW_MS = 5 * 60 * 1000

const shouldAttemptChunkReload = () => {
  try {
    const lastAttemptAt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)
    return !lastAttemptAt || Date.now() - lastAttemptAt > CHUNK_RELOAD_WINDOW_MS
  } catch {
    return true
  }
}

const markChunkReloadAttempt = () => {
  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, Date.now().toString())
  } catch {
    // Best-effort only
  }
}

const isChunkLoadFailure = (message = "") => {
  const text = String(message).toLowerCase()
  return text.includes("chunkloaderror") || text.includes("loading chunk") || text.includes("failed to fetch dynamically imported module")
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const message = event?.error?.message || event?.message || ""
    if (isChunkLoadFailure(message) && shouldAttemptChunkReload()) {
      markChunkReloadAttempt()
      window.location.reload()
    }
  })

  window.addEventListener("unhandledrejection", (event) => {
    const message = event?.reason?.message || event?.reason || ""
    if (isChunkLoadFailure(message) && shouldAttemptChunkReload()) {
      markChunkReloadAttempt()
      window.location.reload()
    }
  })
}

// Suppress specific React warnings from react-data-table-component library
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('allowOverflow') || 
       args[0].includes('Received `true` for a non-boolean attribute `button`'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="988486859123-ar7voks5dk0ph9onam61tmkio5d5307v.apps.googleusercontent.com">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()

registerFirebaseServiceWorker()

reportWebVitals()
