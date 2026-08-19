/**
 * Security Headers Helper
 * Provides utilities for managing security headers
 * Note: CSP has been disabled to allow all sources
 */

/**
 * Security headers configuration
 * These should be set on the server side for maximum protection
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(self), usb=()",
}


/**
 * Security best practices checker
 * Logs warnings for potential security issues
 */
export const checkSecurityBestPractices = () => {
  const warnings = []

  // Check if HTTPS is being used
  if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
    warnings.push("⚠️ Application is not using HTTPS. This is a security risk.")
  }

  // Check if localStorage contains sensitive data
  try {
    const localStorageKeys = Object.keys(localStorage)
    const sensitiveKeys = ["password", "token", "secret", "key"]

    localStorageKeys.forEach((key) => {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        warnings.push(`⚠️ Potentially sensitive data found in localStorage: ${key}`)
      }
    })
  } catch (e) {
    // localStorage might not be available
  }

  // Check if cookies have secure flags (can only check if we have access)
  if (document.cookie && window.location.protocol === "https:") {
    const cookies = document.cookie.split(";")
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim()
      if (!cookie.toLowerCase().includes("secure")) {
        warnings.push(`⚠️ Cookie "${cookieName}" does not have Secure flag`)
      }
    })
  }

  if (warnings.length > 0) {
    console.warn("Security Best Practices Warnings:")
    warnings.forEach((warning) => console.warn(warning))
  }

  return warnings
}

/**
 * Initialize security monitoring
 * Call this once when the app starts
 */
export const initSecurityMonitoring = () => {
  if (process.env.NODE_ENV === "development") {
    checkSecurityBestPractices()
  }
}
