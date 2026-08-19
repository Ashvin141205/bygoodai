/**
 * Form Security Helper Functions
 * Provides utilities for CSRF protection, rate limiting, and secure form handling
 */

/**
 * Generate a CSRF token and store it in sessionStorage
 * @returns {string} The generated CSRF token
 */
export const generateCSRFToken = () => {
  const token =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `csrf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem("csrf_token", token)
  return token
}

/**
 * Get the current CSRF token from sessionStorage
 * @returns {string|null} The CSRF token or null if not found
 */
export const getCSRFToken = () => {
  return sessionStorage.getItem("csrf_token")
}

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} Object with isValid boolean and message string
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      message: "Password must contain uppercase, lowercase, and numbers",
    }
  }

  if (!hasSpecialChar) {
    return {
      isValid: true,
      message: "Strong password! Consider adding special characters for extra security",
      warning: true,
    }
  }

  return {
    isValid: true,
    message: "Strong password!",
  }
}

/**
 * Client-side rate limiting for form submissions
 * Prevents rapid repeated submissions
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map()
  }

  /**
   * Check if an action is rate limited
   * @param {string} key - Unique identifier for the action (e.g., 'login', 'signup')
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {object} Object with allowed boolean and remaining attempts
   */
  checkLimit(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now()
    const attemptData = this.attempts.get(key) || { count: 0, resetTime: now + windowMs }

    // Reset if window has passed
    if (now > attemptData.resetTime) {
      attemptData.count = 0
      attemptData.resetTime = now + windowMs
    }

    if (attemptData.count >= maxAttempts) {
      const remainingTime = Math.ceil((attemptData.resetTime - now) / 1000)
      return {
        allowed: false,
        remainingTime,
        message: `Too many attempts. Please try again in ${remainingTime} seconds.`,
      }
    }

    attemptData.count++
    this.attempts.set(key, attemptData)

    return {
      allowed: true,
      remaining: maxAttempts - attemptData.count,
    }
  }

  /**
   * Reset rate limit for a specific key
   * @param {string} key - The key to reset
   */
  reset(key) {
    this.attempts.delete(key)
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Sanitize form input to prevent XSS
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeFormInput = (input) => {
  if (typeof input !== "string") return input

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > characters
    .slice(0, 1000) // Limit length to prevent DoS
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Secure form data before submission
 * Adds CSRF token and sanitizes inputs
 * @param {object} formData - Form data object
 * @returns {object} Secured form data with CSRF token
 */
export const secureFormData = (formData) => {
  const csrfToken = getCSRFToken()
  const securedData = { ...formData }

  // Add CSRF token
  if (csrfToken) {
    securedData.csrf_token = csrfToken
  }

  // Sanitize string fields
  Object.keys(securedData).forEach((key) => {
    if (typeof securedData[key] === "string" && key !== "password" && key !== "oldPassword") {
      securedData[key] = sanitizeFormInput(securedData[key])
    }
  })

  return securedData
}

/**
 * Check if form submission should be blocked due to suspicious activity
 * @param {object} options - Configuration options
 * @returns {object} Object with blocked boolean and reason
 */
export const checkSuspiciousActivity = (options = {}) => {
  const { formKey, maxAttempts = 5, windowMs = 60000 } = options

  // Check rate limiting
  const rateLimit = rateLimiter.checkLimit(formKey, maxAttempts, windowMs)
  if (!rateLimit.allowed) {
    return {
      blocked: true,
      reason: rateLimit.message,
    }
  }

  // Check for CSRF token
  const csrfToken = getCSRFToken()
  if (!csrfToken) {
    // Generate one if missing (first visit)
    generateCSRFToken()
  }

  return {
    blocked: false,
    remaining: rateLimit.remaining,
  }
}
