"use client"

import { useEffect } from "react"

/**
 * Prefetch routes by dynamically importing them
 * This loads the JavaScript chunks in the background
 */
export const usePrefetch = (routes = []) => {
  useEffect(() => {
    // Only prefetch in production and when browser is idle
    if (process.env.NODE_ENV !== "production") return

    const prefetchRoutes = () => {
      routes.forEach((route) => {
        // Use requestIdleCallback to prefetch during idle time
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => {
            route()
          })
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            route()
          }, 1)
        }
      })
    }

    // Start prefetching after a short delay
    const timeoutId = setTimeout(prefetchRoutes, 2000)

    return () => clearTimeout(timeoutId)
  }, [routes])
}

/**
 * Prefetch a single route on hover
 */
export const prefetchOnHover = (importFn) => {
  return {
    onMouseEnter: () => {
      if (process.env.NODE_ENV === "production") {
        importFn()
      }
    },
  }
}

/**
 * Prefetch data for a route
 */
export const prefetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      priority: "low", // Use low priority for prefetch
    })

    if (!response.ok) {
      throw new Error(`Prefetch failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Prefetch error:", error)
    return null
  }
}
