"use client"

import { useEffect, useState } from "react"
import {
  isMobileDevice,
  hasTouchSupport,
  getDevicePixelRatio,
  isLandscape,
  getViewportDimensions,
  prefersReducedMotion,
  isLowEndDevice,
  getNetworkQuality,
} from "../utils/mobilePerformance"

/**
 * Hook to detect mobile device and performance characteristics
 */
export const useMobilePerformance = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    hasTouch: false,
    pixelRatio: 1,
    isLandscape: false,
    viewport: { width: 0, height: 0 },
    reducedMotion: false,
    isLowEnd: false,
    networkQuality: "unknown",
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: isMobileDevice(),
        hasTouch: hasTouchSupport(),
        pixelRatio: getDevicePixelRatio(),
        isLandscape: isLandscape(),
        viewport: getViewportDimensions(),
        reducedMotion: prefersReducedMotion(),
        isLowEnd: isLowEndDevice(),
        networkQuality: getNetworkQuality(),
      })
    }

    // Initial check
    updateDeviceInfo()

    // Update on resize and orientation change
    window.addEventListener("resize", updateDeviceInfo)
    window.addEventListener("orientationchange", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      window.removeEventListener("orientationchange", updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

/**
 * Hook for adaptive loading based on device capabilities
 */
export const useAdaptiveLoading = () => {
  const deviceInfo = useMobilePerformance()

  const shouldReduceQuality = deviceInfo.isLowEnd || deviceInfo.networkQuality === "poor"
  const shouldDisableAnimations = deviceInfo.reducedMotion || deviceInfo.isLowEnd
  const shouldLazyLoad = deviceInfo.isMobile || deviceInfo.networkQuality !== "good"

  return {
    shouldReduceQuality,
    shouldDisableAnimations,
    shouldLazyLoad,
    ...deviceInfo,
  }
}
