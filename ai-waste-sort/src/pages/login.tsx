"use client"

import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthForm, type FormData } from "@/components/auth-form"
import { SocialAuthButtons } from "@/components/social-auth-button"
import { AuthImageSection } from "@/components/auth-image-section"
import { AuthContainer } from "@/components/auth-container"
import { login } from "@/services/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({})
  const navigate = useNavigate()

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
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Network error. Please try again."
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
    <div className="min-h-screen bg-background">
      {/* Mobile View */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Green Header Section */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white pt-6 pb-12 px-6 rounded-b-3xl">
          <div className="space-y-3 mb-8">
            <p className="text-sm font-semibold text-green-100">Welcome back to</p>
            <h1 className="text-3xl font-bold">Eco Sort AI</h1>
            <p className="text-green-100 text-sm">Let&apos;s make our Home better together.</p>
          </div>
          <div className="relative w-full h-40">
            <img src="/eco-bag.png" alt="Green Bin illustration" className="w-full h-40 object-cover" />
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <AuthContainer>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Log in</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
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

              <SocialAuthButtons
                onGoogle={() => handleSocialAuth("google")}
                onFacebook={() => handleSocialAuth("facebook")}
                onTwitter={() => handleSocialAuth("twitter")}
                isLoading={isLoading}
              />
            </div>
          </AuthContainer>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8 min-h-screen">
        <AuthImageSection
          imageSrc="/eco-bag.png"
          title="Welcome back to EcoSort AI"
          description="Let's make our Home better together."
          altText="Green Bin illustration"
        />

        <div className="flex flex-col justify-center">
          <AuthContainer maxWidth="lg">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Log in</h2>
                <p className="text-muted-foreground mt-2">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
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

              <SocialAuthButtons
                onGoogle={() => handleSocialAuth("google")}
                onFacebook={() => handleSocialAuth("facebook")}
                onTwitter={() => handleSocialAuth("twitter")}
                isLoading={isLoading}
              />
            </div>
          </AuthContainer>
        </div>
      </div>
    </div>
  )
}
