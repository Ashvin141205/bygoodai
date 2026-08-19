"use client"

import { Component } from "react"
import errorReporter from "../../../src/errorReporter"
import { logger } from "../../utils/logger"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to your remote service with error handling
    try {
      errorReporter.report(error, errorInfo);
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }

    logger.error("Uncaught error:", error, errorInfo);
  }

  // Handle page reload for chunk errors
  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a chunk loading error
      const isChunkLoadError = this.state.error?.message.includes("Loading chunk")

      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          {isChunkLoadError ? (
            <div>
              <p>We've updated the application. Please reload the page to get the latest version.</p>
              <button
                onClick={this.handleReload}
                style={{ marginTop: "10px", padding: "10px 20px", cursor: "pointer" }}
              >
                Reload Page
              </button>
            </div>
          ) : (
            <p>Please try refreshing the page.</p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
