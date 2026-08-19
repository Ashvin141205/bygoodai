import { toast } from "react-toastify"
import { logger } from "./logger"

/**
 * Centralized error handler for API and application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error, customMessage = null, options = {}) => {
  logger.error("API Error:", error)

  const { autoLogout = false } = options // Added autoLogout option, defaults to false

  // Don't show toast if it's a session expired error (handled globally)
  if (error.message === 'Session expired') {
    return {
      message: 'Session expired',
      originalError: error,
      status: 401,
      shouldLogout: true,
    }
  }

  let userMessage = customMessage || "Something went wrong. Please try again."

  if (error.response) {
    // Server responded with error status
    const status = error.response.status

    switch (status) {
      case 400:
        userMessage = error.response.data?.message || "Invalid request. Please check your input."
        break
      case 401:
        // Don't show toast for 401 - handled globally by axios interceptor
        return {
          message: 'Session expired',
          originalError: error,
          status: 401,
          shouldLogout: true,
        }
      case 403:
        userMessage = error.response.data?.message || "You don't have permission to perform this action."
        break
      case 404:
        userMessage = "The requested resource was not found."
        break
      case 429:
        userMessage = "Too many requests. Please slow down and try again."
        break
      case 500:
      case 502:
      case 503:
        userMessage = "Server error. Our team has been notified. Please try again later."
        break
      default:
        userMessage = error.response.data?.message || userMessage
    }
  } else if (error.request) {
    // Request made but no response received
    userMessage = "Network error. Please check your internet connection."
  }

  // Only show toast for non-401 errors
  if (error.response?.status !== 401) {
    toast.error(userMessage, {
      position: "top-center",
      autoClose: 5000,
      theme: "dark",
    })
  }

  return {
    message: userMessage,
    originalError: error,
    status: error.response?.status,
    shouldLogout: autoLogout && (error.response?.status === 401 || error.response?.status === 403), // Only suggest logout if autoLogout is enabled
  }
}

/**
 * Handle async operations with error handling
 */
export const withErrorHandling = async (asyncFn, errorMessage = null) => {
  try {
    return await asyncFn()
  } catch (error) {
    return handleApiError(error, errorMessage)
  }
}

/**
 * Validate form data and return errors
 */
export const validateForm = (data, rules) => {
  const errors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field]

    if (fieldRules.required && (!value || value.trim() === "")) {
      errors[field] = `${fieldRules.label || field} is required`
      continue
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must be less than ${fieldRules.maxLength} characters`
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || `${fieldRules.label || field} format is invalid`
    }

    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.customMessage || `${fieldRules.label || field} is invalid`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Retry failed operations with exponential backoff
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      logger.warn(`Retry attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }
}
