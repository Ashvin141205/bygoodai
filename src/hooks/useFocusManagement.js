"use client"

import { useState } from "react"

import { useEffect, useRef } from "react"
import { FocusManager } from "../utils/focusManagement"

/**
 * Hook to manage focus when component mounts/unmounts
 * Useful for modals and dialogs
 */
export const useFocusManagement = (isOpen) => {
  const focusManagerRef = useRef(new FocusManager())

  useEffect(() => {
    if (isOpen) {
      focusManagerRef.current.saveFocus()
    } else {
      focusManagerRef.current.restoreFocus()
    }
  }, [isOpen])

  return focusManagerRef.current
}

/**
 * Hook to automatically focus an element when component mounts
 */
export const useAutoFocus = (shouldFocus = true) => {
  const elementRef = useRef(null)

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus()
    }
  }, [shouldFocus])

  return elementRef
}

/**
 * Hook to manage focus within a roving tabindex pattern
 * Useful for toolbars, menus, and lists
 */
export const useRovingTabIndex = (items, orientation = "horizontal") => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isHorizontal = orientation === "horizontal"
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"

      if (e.key === nextKey) {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % items.length)
      } else if (e.key === prevKey) {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
      } else if (e.key === "Home") {
        e.preventDefault()
        setActiveIndex(0)
      } else if (e.key === "End") {
        e.preventDefault()
        setActiveIndex(items.length - 1)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [items.length, orientation])

  return { activeIndex, setActiveIndex }
}
