import { toast } from "react-toastify"
import axios from "axios"
import { logger } from "../utils/logger" // Assuming these utility functions exist
import { retryWithBackoff } from "../utils/retryHandler" // Assuming this utility function exists
import { performanceMonitor } from "../utils/performanceMonitor" // Assuming this utility function exists
import { getApiConfig, getApiUrl } from "../config/apiEndpoints"

const normalizeApiData = (payload) => {
  if (typeof payload !== "string") {
    return payload
  }

  // Some backend responses include UTF-8 BOM bytes before JSON.
  const cleaned = payload.replace(/^\uFEFF+/, "").trim()
  if (!cleaned) {
    return payload
  }

  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    try {
      return JSON.parse(cleaned)
    } catch (e) {
      logger.warn("ApiHandler could not parse JSON payload string:", e)
    }
  }

  return payload
}

/**
 * Handles API requests, including token authentication, error handling, and optional retries.
 * @param {string} url - The API endpoint suffix.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [body] - The request body data.
 * @param {string} [header] - The Authorization bearer token.
 * @param {function} [dispatch] - Redux dispatch function (or similar state manager).
 * @param {function} [navigate] - Navigation function (e.g., from react-router-dom).
 * @param {object} [options] - Configuration options.
 * @returns {Promise<object>} The Axios response object.
 */
export const ApiHandler = async (url, method, body, header, dispatch, navigate, options = {}) => {
  const isAbsoluteUrl = /^https?:\/\//i.test(url)
  const endpointConfig = !isAbsoluteUrl ? getApiConfig(url) : null
  const resolvedMethod = (method || endpointConfig?.method || "GET").toUpperCase()
  const api = isAbsoluteUrl ? url : getApiUrl(url)

  let {
    enableRetry = endpointConfig?.retryable !== false,
    maxRetries = 2,
    showRetryToast = false, // Not currently used in the logic below, but kept for future use
    autoLogout = false,
  } = options

  // CRITICAL UPDATE: Disable retries for POST requests to maintain data integrity
  if (resolvedMethod === 'POST') {
    enableRetry = false
    // You could optionally log this decision:
    // logger.debug(`Retry disabled for POST request to: ${url}`)
  }

  if (process.env.NODE_ENV === "development" && method && method.toUpperCase() !== resolvedMethod) {
    logger.warn(`ApiHandler method mismatch for ${url}: caller=${method}, config=${resolvedMethod}`)
  }

  const startTime = Date.now()

  const makeRequest = async () => {
    const headers = {
      "Content-Type": "application/json",
    }

    if (header) {
      headers.Authorization = `Bearer ${header}`
    }

    const shouldSendBody = !["GET", "HEAD"].includes(resolvedMethod)

    const response = await axios({
      url: api,
      method: resolvedMethod,
      headers: headers,
      data: shouldSendBody && body !== undefined && body !== null ? body : undefined,
      timeout: 30000, // 30 second timeout
    })

    response.data = normalizeApiData(response.data)

    // Safely check for nested status/code if response is structured this way
    const result = response.data?.status

    if (response.status === 401 || result?.code === 401) {
      // 401 errors are handled globally by axios interceptor - don't show additional toasts
      if (autoLogout) {
        navigate("/login")
      }
      // Throw error to stop further execution
      throw new Error("Session expired")
    } else if (response.status === 400 || result?.code === 400) {
      toast.error(result.message || "Invalid request. Please check your input.", {
        toastId: `error-400-${url}`,
      })
    } else if (result?.code === 404) {
      toast.error(result.message || "Resource not found.", {
        toastId: `error-404-${url}`,
      })
      // Throw an error to stop the execution flow and potentially trigger a retry (if enabled)
      throw new Error(result.message)
    } else if (result?.code === 500) {
      toast.error("Something went wrong. Please try again.", {
        toastId: `error-500-${url}`,
      })
      // Throw an error to trigger a retry (if enabled)
      throw new Error(result.message || "Server Error 500")
    }

    return response
  }

  try {
    let response
    
    if (enableRetry) {
      response = await retryWithBackoff(makeRequest, {
        maxRetries,
        shouldRetry: (error) => {
          const status = error.response?.status
          // Don't retry auth errors or client errors (4xx)
          if (status === 401 || status === 403 || (status >= 400 && status < 500)) {
            return false
          }
          // Retry on network errors or 5xx server errors
          return (
            !status ||
            status >= 500 ||
            error?.code === "ECONNABORTED" ||
            error?.code === "ERR_NETWORK"
          )
        },
      })
    } else {
      // Direct call if retries are disabled (including for POST)
      response = await makeRequest()
    }

    const duration = Date.now() - startTime
    performanceMonitor.monitorAPICall(url, duration, response.status)

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    performanceMonitor.monitorAPICall(url, duration, error.response?.status || 0)

    const result = error.response?.data?.status
    const errorMessage = result?.message || "An unexpected error occurred."

    // Consolidated error handling for the catch block
    const status = error.response?.status

    // Check if it's a session expired error from axios interceptor
    if (error.message === 'Session expired') {
      // Don't show any additional toasts - handled globally
      throw error
    }

    if (status === 401 || result?.code === 401) {
      // 401 handled globally - don't show additional toasts
      if (autoLogout) {
        navigate("/login")
      }
      throw new Error("Session expired")
    } else if (status === 400 || result?.code === 400) {
      toast.error(result?.message || "Invalid request. Please check your input.", {
        toastId: `error-400-catch-${url}`,
      })
    } else if (status === 404 || result?.code === 404) {
      toast.error(result?.message || "Resource not found.", {
        toastId: `error-404-catch-${url}`,
      })
      throw new Error(result?.message || "Resource Not Found")
    } else if (status >= 500 || result?.code >= 500) {
      toast.error("Something went wrong. Please try again.", {
        toastId: `error-500-catch-${url}`,
      })
    } else {
      toast.error(errorMessage, {
        toastId: `error-general-${url}`,
      })
      logger.error("API Error:", error)
    }

    throw error
  }
}
