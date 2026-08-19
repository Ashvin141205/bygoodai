import React from 'react';

class PayPalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('PayPal Error Boundary caught an error:', error, errorInfo);
    
    // You can also log to an error reporting service here
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `PayPal Error: ${error.message}`,
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Force a page reload to reinitialize PayPal SDK
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-semibold mb-2">
            Payment System Unavailable
          </div>
          <p className="text-gray-700 mb-4 text-sm">
            We're having trouble loading the payment system. This could be due to a slow connection or browser settings.
          </p>
          <div className="space-y-2">
            <button
              onClick={this.handleRetry}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Retry Payment
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Go Back
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            If this problem persists, please contact support or try a different payment method.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PayPalErrorBoundary;
