"use client"

import React from "react"
import { Eye, EyeOff } from "lucide-react"

interface AuthInputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  showPasswordToggle?: boolean
  disabled?: boolean
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    { type = "text", placeholder, value, onChange, error, label, showPasswordToggle = false, disabled = false },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-sans
              ${error ? "border-destructive bg-destructive/5" : "border-input bg-muted focus:border-green-500"}
              focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
              text-foreground placeholder:text-muted-foreground
            `}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-destructive font-medium">{error}</p>}
      </div>
    )
  },
)

AuthInput.displayName = "AuthInput"
