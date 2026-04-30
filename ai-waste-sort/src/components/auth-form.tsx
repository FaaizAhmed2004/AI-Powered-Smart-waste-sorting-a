"use client"

import React from "react"
import { AuthInput } from "./auth-input"
import { Button } from "@/components/ui/button"

export interface FormData {
  email: string
  password: string
  confirmPassword?: string
  name?: string
  phoneNumber?: string
  consent?: boolean
}

interface AuthFormProps {
  title: string
  subtitle?: string
  isLoading?: boolean
  onSubmit: (data: FormData) => Promise<void>
  submitButtonText?: string
  showConfirmPassword?: boolean
  showNameField?: boolean
  showPhoneField?: boolean
  showConsentField?: boolean
  errors?: Partial<Record<keyof FormData, string>>
}

export const AuthForm = React.forwardRef<HTMLFormElement, AuthFormProps>(
  (
    {
      title,
      subtitle,
      isLoading = false,
      onSubmit,
      submitButtonText = "Submit",
      showConfirmPassword = false,
      showNameField = false,
      showPhoneField = false,
      showConsentField = false,
      errors = {},
    },
    ref,
  ) => {
    const [formData, setFormData] = React.useState<FormData>({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phoneNumber: "",
      consent: false,
    })
    const [localErrors, setLocalErrors] = React.useState<Partial<Record<keyof FormData, string>>>({})

    const handleChange = (field: keyof FormData, value: string | boolean) => {
      if (field === 'consent') {
        setFormData((prev) => ({ ...prev, [field]: value as boolean }))
      } else {
        setFormData((prev) => ({ ...prev, [field]: value as string }))
      }
      // Clear error when user starts typing
      if (localErrors[field]) {
        setLocalErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Validation
      const newErrors: Partial<Record<keyof FormData, string>> = {}

      if (showNameField && !formData.name) {
        newErrors.name = "Name is required"
      }

      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!formData.email.includes("@")) {
        newErrors.email = "Please enter a valid email"
      }

      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }

      if (showPhoneField && !formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required"
      }

      if (showConfirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (showConsentField && !formData.consent) {
        newErrors.consent = "You must agree to the terms and conditions"
      }

      if (Object.keys(newErrors).length > 0) {
        setLocalErrors(newErrors)
        return
      }

      try {
        await onSubmit(formData)
      } catch (error) {
        console.error("Form submission error:", error)
      }
    }

    const mergedErrors = { ...localErrors, ...errors }

    return (
      <form ref={ref} onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="space-y-4">
          {showNameField && (
            <AuthInput
              type="text"
              placeholder="Enter your full name"
              value={formData.name || ""}
              onChange={(value) => handleChange("name", value)}
              error={mergedErrors.name}
              disabled={isLoading}
            />
          )}

          <AuthInput
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            error={mergedErrors.email}
            disabled={isLoading}
          />

          {showPhoneField && (
            <AuthInput
              type="tel"
              placeholder="Enter phone number (e.g., +1234567890)"
              value={formData.phoneNumber || ""}
              onChange={(value) => handleChange("phoneNumber", value)}
              error={mergedErrors.phoneNumber}
              disabled={isLoading}
            />
          )}

          <AuthInput
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            error={mergedErrors.password}
            showPasswordToggle
            disabled={isLoading}
          />

          {showConfirmPassword && (
            <AuthInput
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword || ""}
              onChange={(value) => handleChange("confirmPassword", value)}
              error={mergedErrors.confirmPassword}
              showPasswordToggle
              disabled={isLoading}
            />
          )}

          {showConsentField && (
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent || false}
                  onChange={(e) => handleChange("consent", e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {mergedErrors.consent && (
                <p className="text-sm text-red-600">{mergedErrors.consent}</p>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? "Loading..." : submitButtonText}
        </Button>
      </form>
    )
  },
)

AuthForm.displayName = "AuthForm"
