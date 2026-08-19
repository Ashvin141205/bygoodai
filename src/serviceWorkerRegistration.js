import { logger } from "./utils/logger"

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
)

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config)
        navigator.serviceWorker.ready.then(() => {
          logger.log("This web app is being served cache-first by a service worker.")
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              logger.log("New content is available! Showing update banner.")

              // Notify user about update
              if (config && config.onUpdate) {
                config.onUpdate(registration)
              } else {
                // Default behavior: show a simple notification and allow refresh
              // Update notification disabled
              // showUpdateNotification(registration)
              }
            } else {
              logger.log("Content is cached for offline use.")
              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      logger.error("Error during service worker registration:", error)
    })
}

// Update modal disabled - function no longer used
/*
function showUpdateNotification(registration) {
  // Prevent showing multiple banners
  if (updateBannerShown) {
    return
  }
  updateBannerShown = true

  // Check if banner already exists in DOM
  const existingBanner = document.getElementById('sw-update-banner')
  if (existingBanner) {
    return
  }

  const updateBanner = document.createElement("div")
  updateBanner.id = 'sw-update-banner'
  updateBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #FFDD15;
    color: #000;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: sans-serif;
    font-weight: bold;
  `
  const title = document.createElement("div")
  title.textContent = "New version available!"
  
  const closeBtn = document.createElement("button")
  closeBtn.textContent = "×"
  closeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    color: #000;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 1;
  `
  closeBtn.addEventListener("click", () => {
    updateBanner.remove()
  })

  updateBanner.appendChild(closeBtn)
  updateBanner.appendChild(title)
  document.body.appendChild(updateBanner)
}
*/

// Placeholder - update notification disabled
function showUpdateNotification(registration) {
  // Modal completely disabled
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      const contentType = response.headers.get("content-type")
      if (response.status === 404 || (contentType != null && contentType.indexOf("javascript") === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      logger.log("No internet connection found. App is running in offline mode.")
    })
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        logger.error(error.message)
      })
  }
}
