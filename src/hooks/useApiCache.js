"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ApiHandler } from "../helper/ApiHandler"
import { useDispatch, useNavigate } from "react-router-dom"

const cache = new Map()
const subscribers = new Map()

export const useApiCache = (url, method = "GET", body = undefined, token = null, options = {}) => {
  const {
    revalidateOnFocus = true,
    revalidateInterval = 0, // 0 means no auto-revalidation
    dedupingInterval = 2000, // Prevent duplicate requests within 2 seconds
    cacheTime = 5 * 60 * 1000, // Cache for 5 minutes by default
  } = options

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  const cacheKey = `${url}-${method}-${JSON.stringify(body)}`
  const lastFetchTime = useRef(0)
  const intervalRef = useRef(null)

  const fetchData = useCallback(
    async (isRevalidation = false) => {
      const now = Date.now()

      // Deduping: prevent duplicate requests within dedupingInterval
      if (now - lastFetchTime.current < dedupingInterval) {
        return
      }

      // Check cache first
      const cached = cache.get(cacheKey)
      if (cached && now - cached.timestamp < cacheTime && !isRevalidation) {
        setData(cached.data)
        setIsLoading(false)
        return
      }

      if (isRevalidation) {
        setIsValidating(true)
      } else {
        setIsLoading(true)
      }

      try {
        lastFetchTime.current = now
        const response = await ApiHandler(url, method, body, token, dispatch, navigate)

        if (response?.data) {
          const newData = response.data

          // Update cache
          cache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
          })

          setData(newData)
          setError(null)

          // Notify all subscribers
          const subs = subscribers.get(cacheKey) || []
          subs.forEach((callback) => callback(newData))
        }
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
        setIsValidating(false)
      }
    },
    [url, method, body, token, cacheKey, dedupingInterval, cacheTime, dispatch, navigate],
  )

  // Mutate function to manually update cache
  const mutate = useCallback(
    (newData, shouldRevalidate = true) => {
      if (newData !== undefined) {
        cache.set(cacheKey, {
          data: newData,
          timestamp: Date.now(),
        })
        setData(newData)
      }

      if (shouldRevalidate) {
        fetchData(true)
      }
    },
    [cacheKey, fetchData],
  )

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData(true)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [revalidateOnFocus, fetchData])

  // Auto revalidation interval
  useEffect(() => {
    if (revalidateInterval <= 0) return

    intervalRef.current = setInterval(() => {
      fetchData(true)
    }, revalidateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [revalidateInterval, fetchData])

  // Subscribe to cache updates
  useEffect(() => {
    const callback = (newData) => {
      setData(newData)
    }

    if (!subscribers.has(cacheKey)) {
      subscribers.set(cacheKey, [])
    }
    subscribers.get(cacheKey).push(callback)

    return () => {
      const subs = subscribers.get(cacheKey) || []
      const index = subs.indexOf(callback)
      if (index > -1) {
        subs.splice(index, 1)
      }
    }
  }, [cacheKey])

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate: () => fetchData(true),
  }
}

// Clear all cache
export const clearCache = () => {
  cache.clear()
}

// Clear specific cache entry
export const clearCacheEntry = (key) => {
  cache.delete(key)
}
