"use client"

import { useEffect, useRef } from "react"
import { performanceMonitor } from "../utils/performanceMonitor"

/**
 * Hook to monitor component render performance
 */
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now())

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current
    performanceMonitor.monitorComponentRender(componentName, renderTime)
  })

  return performanceMonitor
}

/**
 * Hook to measure custom performance metrics
 */
export const usePerformanceMark = (markName) => {
  useEffect(() => {
    performanceMonitor.mark(`${markName}-start`)

    return () => {
      performanceMonitor.mark(`${markName}-end`)
      performanceMonitor.measure(markName, `${markName}-start`, `${markName}-end`)
    }
  }, [markName])
}
