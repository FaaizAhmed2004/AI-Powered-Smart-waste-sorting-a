import type React from "react"

interface AuthContainerProps {
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg"
}

export const AuthContainer = ({ children, maxWidth = "md" }: AuthContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }

  return <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>{children}</div>
}
