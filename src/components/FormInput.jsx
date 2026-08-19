"use client"

import { useState } from "react"

/**
 * Enhanced form input component with validation
 */
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  autoComplete,
  maxLength,
  disabled = false,
  helpText,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = showPasswordToggle && showPassword ? "text" : type

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-white text-sm mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          onFocus={() => setIsFocused(true)}
          className={`w-full p-2 rounded-md bg-[#222222] text-white border ${
            error ? "border-red-500" : isFocused ? "border-yellow-500" : "border-white/50"
          } focus:outline-none focus:ring-2 ${error ? "focus:ring-red-500" : "focus:ring-yellow-500"} transition-all`}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 text-sm hover:text-yellow-400"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${name}-help`} className="text-gray-400 text-xs mt-1">
          {helpText}
        </p>
      )}
    </div>
  )
}

export default FormInput
