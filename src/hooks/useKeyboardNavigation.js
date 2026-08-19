"use client"

import { useState } from "react"

import { useEffect, useRef, useCallback } from "react"

/**
 * Custom hook for keyboard navigation
 * Handles arrow keys, tab, enter, and escape
 */
export const useKeyboardNavigation = (items, onSelect, isOpen = true) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1)
      return
    }

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
          break
        case "Enter":
          if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault()
            onSelect(items[activeIndex])
          }
          break
        case "Home":
          e.preventDefault()
          setActiveIndex(0)
          break
        case "End":
          e.preventDefault()
          setActiveIndex(items.length - 1)
          break
        default:
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [items, activeIndex, onSelect, isOpen])

  return { activeIndex, setActiveIndex }
}

/**
 * Custom hook for focus trap in modals
 * Keeps focus within the modal when tabbing
 */
export const useFocusTrap = (isOpen) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when modal opens
    firstElement?.focus()

    const handleTab = (e) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleTab)
    return () => container.removeEventListener("keydown", handleTab)
  }, [isOpen])

  return containerRef
}

/**
 * Custom hook for skip navigation
 */
export const useSkipNavigation = () => {
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return { skipToContent }
}
