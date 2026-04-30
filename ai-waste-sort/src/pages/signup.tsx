"use client"

import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthForm, type FormData } from "@/components/auth-form"
import { SocialAuthButtons } from "@/components/social-auth-button"
import { AuthImageSection } from "@/components/auth-image-section"
import { AuthContainer } from "@/components/auth-container"
import { register } from "@/services/auth"
import { toast } from "sonner"

export default function SignupPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({})
  const navigate = useNavigate()

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true)
    setErrors({})

    try {
      const response = await register({
        name: formData.name!,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber!,
        consent: formData.consent || false,
      })

      if (response.success) {
        toast.success("Registration successful!", {
          description: "Please check your email to verify your account"
        })
        navigate("/login")
      } else {
        setErrors({ email: response.message || "Registration failed" })
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      const errorMessage = error.response?.data?.message || "Network error. Please try again."
      setErrors({ email: errorMessage })
      toast.error("Registration failed", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = (provider: string) => {
    toast.info(`${provider} signup`, {
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
            <p className="text-sm font-semibold text-green-100">Welcome to</p>
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
                <h2 className="text-2xl font-bold text-foreground">Sign up</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Already have an account?{" "}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                    Login
                  </Link>
                </p>
              </div>

              <AuthForm
                title=""
                isLoading={isLoading}
                onSubmit={handleSignup}
                submitButtonText="Sign Up"
                showConfirmPassword={true}
                showNameField={true}
                showPhoneField={true}
                showConsentField={true}
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
          title="Welcome to Eco Sort AI"
          description="Let's make our Home better together."
          altText="Green Bin illustration"
        />

        <div className="flex flex-col justify-center">
          <AuthContainer maxWidth="lg">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Sign up</h2>
                <p className="text-muted-foreground mt-2">
                  Already have an account?{" "}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                    Login
                  </Link>
                </p>
              </div>

              <AuthForm
                title=""
                isLoading={isLoading}
                onSubmit={handleSignup}
                submitButtonText="Sign Up"
                showConfirmPassword={true}
                showNameField={true}
                showPhoneField={true}
                showConsentField={true}
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
