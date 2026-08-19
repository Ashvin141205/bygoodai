"use client"

import React from "react"

/**
 * Input Validation Utilities
 * Provides comprehensive validation for user inputs
 */

import { sanitizeInput, sanitizeEmail } from "./sanitize"

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the input is valid
 * @property {string} error - Error message if invalid
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {ValidationResult}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" }
  }

  const sanitized = sanitizeEmail(email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: "Email is too long" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {ValidationResult & {strength: string}}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Password is required", strength: "weak" }
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters", strength: "weak" }
  }

  if (password.length > 128) {
    return { isValid: false, error: "Password is too long", strength: "weak" }
  }

  // Check for common patterns
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  let strength = "weak"
  let strengthCount = 0

  if (hasUpperCase) strengthCount++
  if (hasLowerCase) strengthCount++
  if (hasNumbers) strengthCount++
  if (hasSpecialChar) strengthCount++

  if (strengthCount >= 3 && password.length >= 12) {
    strength = "strong"
  } else if (strengthCount >= 2 && password.length >= 8) {
    strength = "medium"
  }

  if (strengthCount < 2) {
    return {
      isValid: false,
      error: "Password must contain at least 2 of: uppercase, lowercase, numbers, special characters",
      strength,
    }
  }

  return { isValid: true, error: "", strength }
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {ValidationResult}
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== "string") {
    return { isValid: false, error: "Username is required" }
  }

  const sanitized = sanitizeInput(username)

  if (sanitized.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" }
  }

  if (sanitized.length > 20) {
    return { isValid: false, error: "Username must be less than 20 characters" }
  }

  // Only allow alphanumeric and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
    return { isValid: false, error: "Username can only contain letters, numbers, and underscores" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult}
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, error: "Phone number is required" }
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")

  if (digitsOnly.length < 10) {
    return { isValid: false, error: "Phone number must be at least 10 digits" }
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number is too long" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate age
 * @param {string|number} age - Age to validate
 * @param {number} minAge - Minimum required age
 * @returns {ValidationResult}
 */
export const validateAge = (age, minAge = 21) => {
  const ageNum = Number.parseInt(age, 10)

  if (isNaN(ageNum)) {
    return { isValid: false, error: "Please enter a valid age" }
  }

  if (ageNum < minAge) {
    return { isValid: false, error: `You must be at least ${minAge} years old` }
  }

  if (ageNum > 120) {
    return { isValid: false, error: "Please enter a valid age" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate name (first/last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult}
 */
export const validateName = (name, fieldName = "Name") => {
  if (!name || typeof name !== "string") {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const sanitized = sanitizeInput(name)

  if (sanitized.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` }
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: `${fieldName} is too long` }
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate amount (for deposits/withdrawals)
 * @param {string|number} amount - Amount to validate
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {ValidationResult}
 */
export const validateAmount = (amount, min = 0, max = 10000) => {
  const amountNum = Number.parseFloat(amount)

  if (isNaN(amountNum)) {
    return { isValid: false, error: "Please enter a valid amount" }
  }

  if (amountNum < min) {
    return { isValid: false, error: `Amount must be at least $${min}` }
  }

  if (amountNum > max) {
    return { isValid: false, error: `Amount cannot exceed $${max}` }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return { isValid: false, error: "Amount can only have up to 2 decimal places" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate referral code
 * @param {string} code - Referral code to validate
 * @returns {ValidationResult}
 */
export const validateReferralCode = (code) => {
  if (!code) {
    return { isValid: true, error: "" } // Optional field
  }

  const sanitized = sanitizeInput(code)

  if (sanitized.length < 4) {
    return { isValid: false, error: "Referral code must be at least 4 characters" }
  }

  if (sanitized.length > 20) {
    return { isValid: false, error: "Referral code is too long" }
  }

  // Only allow alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(sanitized)) {
    return { isValid: false, error: "Referral code can only contain letters and numbers" }
  }

  return { isValid: true, error: "" }
}

/**
 * Validate form data object
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation errors by field
 */
export const validateForm = (formData, rules) => {
  const errors = {}

  Object.keys(rules).forEach((field) => {
    const rule = rules[field]
    const value = formData[field]

    if (rule.required && (!value || value.toString().trim() === "")) {
      errors[field] = `${rule.label || field} is required`
      return
    }

    if (value && rule.validator) {
      const result = rule.validator(value)
      if (!result.isValid) {
        errors[field] = result.error
      }
    }
  })

  return errors
}

/**
 * Real-time validation hook helper
 * @param {string} value - Value to validate
 * @param {Function} validator - Validator function
 * @param {number} debounceMs - Debounce time in milliseconds
 * @returns {Object} - Validation state
 */
export const useFieldValidation = (value, validator, debounceMs = 300) => {
  const [error, setError] = React.useState("")
  const [isValidating, setIsValidating] = React.useState(false)
  const timeoutRef = React.useRef(null)

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!value) {
      setError("")
      return
    }

    setIsValidating(true)

    timeoutRef.current = setTimeout(() => {
      const result = validator(value)
      setError(result.isValid ? "" : result.error)
      setIsValidating(false)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, validator, debounceMs])

  return { error, isValidating }
}
