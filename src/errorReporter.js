import StackdriverErrorReporter from 'stackdriver-errors-js';
import { logger } from './utils/logger';

const config = {
  key: 'AIzaSyCpAjM3JvDyGseLAHaqAjkVE_krkSu5J-s',
  projectId: 'lucky-charm-sweep',
  service: 'luckcharmseep-frontend',
  version: '1.0.0',
  disabled: process.env.NODE_ENV === 'development', // Disable in development
};

let errorReporter = null;
let isStackdriverAvailable = false;

// Try to initialize Stackdriver, but don't fail if it doesn't work
try {
  errorReporter = new StackdriverErrorReporter();
  errorReporter.start(config);
  isStackdriverAvailable = true;
  logger.info('Stackdriver Error Reporting initialized successfully');
} catch (error) {
  logger.warn('Failed to initialize Stackdriver Error Reporting:', error);
  isStackdriverAvailable = false;
}

// Create a robust error reporting wrapper
const safeErrorReporter = {
  report: (error, context = {}) => {
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: context,
      type: error.name || 'Error'
    };

    // Always log to console and local logger
    logger.error('Error caught:', errorInfo);
    
    // Try to report to Stackdriver only in production and if it's available
    if (isStackdriverAvailable && process.env.NODE_ENV === 'production' && errorReporter) {
      try {
        errorReporter.report(error, context);
      } catch (reportError) {
        logger.warn('Failed to report error to Stackdriver:', reportError);
        isStackdriverAvailable = false; // Disable further attempts
      }
    }

    // Store error locally for debugging
    if (typeof window !== 'undefined') {
      try {
        const storage = window.localStorage;
        if (!storage) {
          return;
        }

        const localErrors = JSON.parse(storage.getItem('app_errors') || '[]');
        localErrors.push(errorInfo);

        // Keep only last 50 errors
        if (localErrors.length > 50) {
          localErrors.shift();
        }

        storage.setItem('app_errors', JSON.stringify(localErrors));
      } catch (storageError) {
        logger.warn('Failed to store error locally:', storageError);
      }
    }
  },

  // Method to get locally stored errors for debugging
  getLocalErrors: () => {
    if (typeof window !== 'undefined') {
      try {
        const storage = window.localStorage;
        if (!storage) {
          return [];
        }
        return JSON.parse(storage.getItem('app_errors') || '[]');
      } catch (error) {
        logger.warn('Failed to retrieve local errors:', error);
        return [];
      }
    }
    return [];
  },

  // Method to clear local errors
  clearLocalErrors: () => {
    if (typeof window !== 'undefined') {
      try {
        const storage = window.localStorage;
        if (!storage) {
          return;
        }
        storage.removeItem('app_errors');
      } catch (error) {
        logger.warn('Failed to clear local errors:', error);
      }
    }
  }
};

export default safeErrorReporter;
