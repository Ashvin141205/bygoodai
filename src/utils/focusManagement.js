/**
 * Focus Management Utilities
 * Helpers for managing focus in complex UI interactions
 */

/**
 * Trap focus within a container element
 * @param {HTMLElement} container - The container to trap focus within
 * @returns {Function} Cleanup function to remove event listeners
 */
export const trapFocus = (container) => {
  if (!container) return () => {}

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTab = (e) => {
    if (e.key !== "Tab") return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener("keydown", handleTab)
  firstElement?.focus()

  return () => container.removeEventListener("keydown", handleTab)
}

/**
 * Save and restore focus when opening/closing modals
 */
export class FocusManager {
  constructor() {
    this.previousFocus = null
  }

  saveFocus() {
    this.previousFocus = document.activeElement
  }

  restoreFocus() {
    if (this.previousFocus && typeof this.previousFocus.focus === "function") {
      this.previousFocus.focus()
    }
  }

  setFocus(element) {
    if (element && typeof element.focus === "function") {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => element.focus(), 0)
    }
  }
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container
 * @returns {NodeList}
 */
export const getFocusableElements = (container) => {
  if (!container) return []

  return container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
}

/**
 * Check if element is currently visible and focusable
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export const isFocusable = (element) => {
  if (!element) return false

  const style = window.getComputedStyle(element)
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    !element.hasAttribute("disabled") &&
    element.tabIndex >= 0
  )
}

/**
 * Move focus to next/previous focusable element
 * @param {HTMLElement} currentElement
 * @param {boolean} reverse - Move backwards if true
 */
export const moveFocus = (currentElement, reverse = false) => {
  const focusableElements = Array.from(
    document.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(isFocusable)

  const currentIndex = focusableElements.indexOf(currentElement)
  if (currentIndex === -1) return

  const nextIndex = reverse
    ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
    : (currentIndex + 1) % focusableElements.length

  focusableElements[nextIndex]?.focus()
}

/**
 * Announce message to screen readers
 * @param {string} message
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div")
  announcement.setAttribute("role", "status")
  announcement.setAttribute("aria-live", priority)
  announcement.setAttribute("aria-atomic", "true")
  announcement.className = "sr-only"
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}
