import { logger } from "./logger"

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry configuration
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @returns {Promise} Result of the function or throws error
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      const method = error?.config?.method?.toLowerCase();
      
      // 1. CRITICAL CHECK: Do NOT retry non-idempotent POST requests 
      // to prevent multiple database entries.
      if (method === 'post') {
        logger.warn(`Skipping retry for POST request: ${error?.config?.url}. POST requests are not idempotent.`, {
            error: error?.message,
        });
        return false;
      }

      // 2. Default logic for other methods (GET, PUT, DELETE, etc.):
      // Retry on network errors or 5xx server errors
      const status = error?.response?.status
      return !status || status >= 500 || error?.code === "ECONNABORTED" || error?.code === "ERR_NETWORK"
    },
  } = options

  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const delayValue = Math.pow(2, attempt) * initialDelay

      // Don't retry if this is the last attempt or if error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      // Log retry attempt
      logger.warn(`Request failed, retrying (${attempt + 1}/${maxRetries})...`, {
        error: error.message,
        delay: Math.min(delayValue, maxDelay),
      })

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => {
        setTimeout(resolve, Math.min(delayValue, maxDelay))
      })
    }
  }

  throw lastError
}

/**
 * Create a retry wrapper for API calls
 * @param {Function} apiCall - The API call function
 * @param {Object} retryOptions - Retry configuration
 * @returns {Function} Wrapped function with retry logic
 */
export const withRetry = (apiCall, retryOptions = {}) => {
  return async (...args) => {
    return retryWithBackoff(() => apiCall(...args), retryOptions)
  }
}