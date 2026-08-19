"use client"

import { useState, useCallback } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ApiHandler } from "../helper/ApiHandler"

/**
 * Custom hook for API calls with built-in retry logic and loading states
 * @param {Object} options - Configuration options
 * @returns {Object} API call utilities
 */
export const useApiWithRetry = (options = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { enableRetry = true, maxRetries = 3, onSuccess, onError } = options

  const execute = useCallback(
    async (url, method, body, token) => {
      setLoading(true)
      setError(null)

      try {
        const response = await ApiHandler(url, method, body, token, dispatch, navigate, {
          enableRetry,
          maxRetries,
        })

        if (onSuccess) {
          onSuccess(response.data)
        }

        return response.data
      } catch (err) {
        setError(err)
        if (onError) {
          onError(err)
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [dispatch, navigate, enableRetry, maxRetries, onSuccess, onError],
  )

  return {
    execute,
    loading,
    error,
    setError,
  }
}
