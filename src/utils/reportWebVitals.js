import { performanceMonitor } from "./performanceMonitor"

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry)
      getFID(onPerfEntry)
      getFCP(onPerfEntry)
      getLCP(onPerfEntry)
      getTTFB(onPerfEntry)
    })
  } else {
    // Default: use our performance monitor
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        performanceMonitor.reportMetric("CLS", metric.value, {
          id: metric.id,
          rating: metric.rating,
        })
      })

      getFID((metric) => {
        performanceMonitor.reportMetric("FID", metric.value, {
          id: metric.id,
          rating: metric.rating,
        })
      })

      getFCP((metric) => {
        performanceMonitor.reportMetric("FCP", metric.value, {
          id: metric.id,
          rating: metric.rating,
        })
      })

      getLCP((metric) => {
        performanceMonitor.reportMetric("LCP", metric.value, {
          id: metric.id,
          rating: metric.rating,
        })
      })

      getTTFB((metric) => {
        performanceMonitor.reportMetric("TTFB", metric.value, {
          id: metric.id,
          rating: metric.rating,
        })
      })
    })
  }
}
