// Mobile Performance Optimization Utilities

/**
 * Detect if device is mobile
 */
export const isMobileDevice = () => {
  if (typeof window === "undefined") return false

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )
}

/**
 * Detect if device has touch support
 */
export const hasTouchSupport = () => {
  if (typeof window === "undefined") return false

  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
}

/**
 * Get device pixel ratio for image optimization
 */
export const getDevicePixelRatio = () => {
  if (typeof window === "undefined") return 1
  return window.devicePixelRatio || 1
}

/**
 * Check if device is in landscape mode
 */
export const isLandscape = () => {
  if (typeof window === "undefined") return false
  return window.innerWidth > window.innerHeight
}

/**
 * Get viewport dimensions
 */
export const getViewportDimensions = () => {
  if (typeof window === "undefined") return { width: 0, height: 0 }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

/**
 * Optimize images for mobile devices
 */
export const getOptimizedImageSize = (originalWidth, originalHeight) => {
  const viewport = getViewportDimensions()
  const dpr = getDevicePixelRatio()

  // Calculate optimal size based on viewport and DPR
  const maxWidth = Math.min(viewport.width * dpr, originalWidth)
  const maxHeight = Math.min(viewport.height * dpr, originalHeight)

  return {
    width: Math.round(maxWidth),
    height: Math.round(maxHeight),
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imageElement, options = {}) => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    // Fallback for browsers without Intersection Observer
    if (imageElement.dataset.src) {
      imageElement.src = imageElement.dataset.src
    }
    return
  }

  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.01,
    ...options,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.classList.add("loaded")
        }
        observer.unobserve(img)
      }
    })
  }, defaultOptions)

  observer.observe(imageElement)

  return observer
}

/**
 * Reduce motion for users who prefer it
 */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Check if device is low-end (for performance optimization)
 */
export const isLowEndDevice = () => {
  if (typeof navigator === "undefined") return false

  // Check for device memory (if available)
  if ("deviceMemory" in navigator) {
    return navigator.deviceMemory < 4 // Less than 4GB RAM
  }

  // Check for hardware concurrency (CPU cores)
  if ("hardwareConcurrency" in navigator) {
    return navigator.hardwareConcurrency < 4 // Less than 4 cores
  }

  // Fallback: assume not low-end
  return false
}

/**
 * Throttle scroll events for better performance
 */
export const throttleScroll = (callback, delay = 100) => {
  let lastCall = 0
  let timeoutId = null

  return function (...args) {
    const now = Date.now()

    if (now - lastCall < delay) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastCall = now
        callback.apply(this, args)
      }, delay)
    } else {
      lastCall = now
      callback.apply(this, args)
    }
  }
}

/**
 * Preload critical resources
 */
export const preloadResource = (href, as = "image") => {
  if (typeof document === "undefined") return

  const link = document.createElement("link")
  link.rel = "preload"
  link.as = as
  link.href = href
  document.head.appendChild(link)
}

/**
 * Enable passive event listeners for better scroll performance
 */
export const addPassiveEventListener = (element, event, handler) => {
  if (typeof element === "undefined") return

  let passiveSupported = false

  try {
    const options = {
      get passive() {
        passiveSupported = true
        return false
      },
    }

    window.addEventListener("test", null, options)
    window.removeEventListener("test", null, options)
  } catch (err) {
    passiveSupported = false
  }

  element.addEventListener(event, handler, passiveSupported ? { passive: true } : false)
}

/**
 * Defer non-critical JavaScript
 */
export const deferScript = (src, callback) => {
  if (typeof document === "undefined") return

  const script = document.createElement("script")
  script.src = src
  script.defer = true

  if (callback) {
    script.onload = callback
  }

  document.body.appendChild(script)
}

/**
 * Check network connection quality
 */
export const getNetworkQuality = () => {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return "unknown"
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (!connection) return "unknown"

  const effectiveType = connection.effectiveType

  // Map effective types to quality levels
  const qualityMap = {
    "slow-2g": "poor",
    "2g": "poor",
    "3g": "moderate",
    "4g": "good",
  }

  return qualityMap[effectiveType] || "unknown"
}

/**
 * Optimize for battery saving mode
 */
export const isBatterySavingMode = async () => {
  if (typeof navigator === "undefined" || !("getBattery" in navigator)) {
    return false
  }

  try {
    const battery = await navigator.getBattery()
    return battery.charging === false && battery.level < 0.2
  } catch (error) {
    return false
  }
}

/**
 * Request idle callback with fallback
 */
export const requestIdleCallback = (callback, options) => {
  if (typeof window === "undefined") return

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options)
  }

  // Fallback to setTimeout
  return setTimeout(callback, 1)
}

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback = (id) => {
  if (typeof window === "undefined") return

  if ("cancelIdleCallback" in window) {
    return window.cancelIdleCallback(id)
  }

  // Fallback to clearTimeout
  return clearTimeout(id)
}
