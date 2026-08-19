"use client"

import { useEffect } from "react"

/**
 * Reusable Confirmation Dialog Component
 * Provides a modal dialog for confirming destructive actions
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // 'warning', 'danger', 'info'
  isLoading = false,
}) => {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "⚠️",
          confirmBg: "bg-red-600 hover:bg-red-700",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
        }
      case "warning":
        return {
          icon: "⚠️",
          confirmBg: "bg-yellow-500 hover:bg-yellow-600",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        }
      case "info":
        return {
          icon: "ℹ️",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        }
      default:
        return {
          icon: "❓",
          confirmBg: "bg-gray-600 hover:bg-gray-700",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="bg-[#1a1f2c] rounded-lg shadow-2xl max-w-md w-full mx-4 border border-white/10 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`${styles.iconBg} rounded-full p-3 flex-shrink-0`}>
              <span className="text-2xl" role="img" aria-label={type}>
                {styles.icon}
              </span>
            </div>
            <div className="flex-1">
              <h3 id="dialog-title" className="text-xl font-bold text-white mb-2">
                {title}
              </h3>
              <p id="dialog-description" className="text-gray-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 ${styles.confirmBg} text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1f2c]`}
            type="button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
