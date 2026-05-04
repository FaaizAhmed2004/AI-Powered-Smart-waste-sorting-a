"use client"

import React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthForm, type FormData } from "@/components/auth-form"
import { SocialAuthButtons } from "@/components/social-auth-button"
import { AuthContainer } from "@/components/auth-container"
import { login } from "@/services/auth"
import { toast } from "sonner"
import { ScanLine } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({})
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setErrors({})

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      })

      if (response.success) {
        toast.success("Login successful!", {
          description: "Welcome back to Eco Sort AI"
        })
        
        // Redirect to the intended page or home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        setErrors({ email: response.message || "Login failed" })
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Network error. Please try again."
      setErrors({ email: errorMessage })
      toast.error("Login failed", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = (provider: string) => {
    toast.info(`${provider} login`, {
      description: "Social authentication coming soon!"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="min-h-screen flex">
        {/* Left side - Image/Branding (hidden on mobile, shown on tablet+) */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:justify-center md:items-center md:p-8 md:bg-gradient-to-br md:from-green-600 md:to-green-700 md:text-white">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
                <ScanLine className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold leading-tight">AI Powered Smart Waste Sorting</h1>
                <p className="text-green-100 text-lg mt-4">Let's make our Home better together.</p>
              </div>
            </div>

            <div className="relative w-full h-80">
              <img
                src="logobg.png"
                alt="Green Bin illustration"
                className="absolute inset-0 w-full h-full object-contain object-center"
              />
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile header - shown only on mobile */}
            <div className="md:hidden text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Smart Waste</h1>
                <p className="text-slate-600 text-sm">Sorting & Recycling Assistant</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
                  <p className="text-slate-600 mt-2">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>

                <AuthForm
                  title=""
                  isLoading={isLoading}
                  onSubmit={handleLogin}
                  submitButtonText="Log In"
                  errors={errors}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">or continue with</span>
                  </div>
                </div>

                <SocialAuthButtons
                  onGoogle={() => handleSocialAuth("google")}
                  onFacebook={() => handleSocialAuth("facebook")}
                  onTwitter={() => handleSocialAuth("twitter")}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
