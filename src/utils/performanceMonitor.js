import { logger } from "./logger"

class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.isSupported = typeof window !== "undefined" && "performance" in window
  }

  // Measure Web Vitals (Core Web Vitals)
  measureWebVitals() {
    if (!this.isSupported) return

    // Largest Contentful Paint (LCP)
    this.observeLCP()

    // First Input Delay (FID)
    this.observeFID()

    // Cumulative Layout Shift (CLS)
    this.observeCLS()

    // First Contentful Paint (FCP)
    this.observeFCP()

    // Time to First Byte (TTFB)
    this.measureTTFB()
  }

  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
        logger.log(`LCP: ${this.metrics.lcp.toFixed(2)}ms`)
        this.reportMetric("LCP", this.metrics.lcp)
      })
      observer.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (e) {
      logger.error("LCP observation failed:", e)
    }
  }

  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          logger.log(`FID: ${this.metrics.fid.toFixed(2)}ms`)
          this.reportMetric("FID", this.metrics.fid)
        })
      })
      observer.observe({ entryTypes: ["first-input"] })
    } catch (e) {
      logger.error("FID observation failed:", e)
    }
  }

  observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.metrics.cls = clsValue
        logger.log(`CLS: ${this.metrics.cls.toFixed(4)}`)
        this.reportMetric("CLS", this.metrics.cls)
      })
      observer.observe({ entryTypes: ["layout-shift"] })
    } catch (e) {
      logger.error("CLS observation failed:", e)
    }
  }

  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.metrics.fcp = entry.startTime
            logger.log(`FCP: ${this.metrics.fcp.toFixed(2)}ms`)
            this.reportMetric("FCP", this.metrics.fcp)
          }
        })
      })
      observer.observe({ entryTypes: ["paint"] })
    } catch (e) {
      logger.error("FCP observation failed:", e)
    }
  }

  measureTTFB() {
    try {
      const navigationTiming = performance.getEntriesByType("navigation")[0]
      if (navigationTiming) {
        this.metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart
        logger.log(`TTFB: ${this.metrics.ttfb.toFixed(2)}ms`)
        this.reportMetric("TTFB", this.metrics.ttfb)
      }
    } catch (e) {
      logger.error("TTFB measurement failed:", e)
    }
  }

  // Measure custom performance marks
  mark(name) {
    if (!this.isSupported) return
    try {
      performance.mark(name)
    } catch (e) {
      logger.error(`Failed to mark ${name}:`, e)
    }
  }

  // Measure time between two marks
  measure(name, startMark, endMark) {
    if (!this.isSupported) return
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      logger.log(`${name}: ${measure.duration.toFixed(2)}ms`)
      this.reportMetric(name, measure.duration)
      return measure.duration
    } catch (e) {
      logger.error(`Failed to measure ${name}:`, e)
    }
  }

  // Monitor API call performance
  monitorAPICall(url, duration, status) {
    const metric = {
      url,
      duration,
      status,
      timestamp: Date.now(),
    }

    if (!this.metrics.apiCalls) {
      this.metrics.apiCalls = []
    }

    this.metrics.apiCalls.push(metric)

    // Keep only last 50 API calls
    if (this.metrics.apiCalls.length > 50) {
      this.metrics.apiCalls.shift()
    }

    // Log slow API calls (> 2 seconds)
    if (duration > 2000) {
      logger.warn(`Slow API call detected: ${url} took ${duration.toFixed(2)}ms`)
    }

    this.reportMetric("API_CALL", duration, { url, status })
  }

  // Monitor component render time
  monitorComponentRender(componentName, renderTime) {
    if (!this.metrics.componentRenders) {
      this.metrics.componentRenders = {}
    }

    if (!this.metrics.componentRenders[componentName]) {
      this.metrics.componentRenders[componentName] = []
    }

    this.metrics.componentRenders[componentName].push(renderTime)

    // Keep only last 10 renders per component
    if (this.metrics.componentRenders[componentName].length > 10) {
      this.metrics.componentRenders[componentName].shift()
    }

    // Log slow renders (> 100ms)
    if (renderTime > 100) {
      logger.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
  }

  // Get performance summary
  getSummary() {
    return {
      webVitals: {
        lcp: this.metrics.lcp,
        fid: this.metrics.fid,
        cls: this.metrics.cls,
        fcp: this.metrics.fcp,
        ttfb: this.metrics.ttfb,
      },
      apiCalls: this.metrics.apiCalls || [],
      componentRenders: this.metrics.componentRenders || {},
    }
  }

  // Report metric to analytics (placeholder for actual analytics integration)
  reportMetric(name, value, metadata = {}) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to Google Analytics, Vercel Analytics, etc.
      if (window.gtag) {
        window.gtag("event", "performance_metric", {
          metric_name: name,
          metric_value: value,
          ...metadata,
        })
      }

      // Vercel Analytics
      if (window.va) {
        window.va("track", "performance_metric", {
          name,
          value,
          ...metadata,
        })
      }
    }
  }

  // Clear all metrics
  clear() {
    this.metrics = {}
    if (this.isSupported) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-initialize Web Vitals monitoring
if (typeof window !== "undefined") {
  performanceMonitor.measureWebVitals()
}
