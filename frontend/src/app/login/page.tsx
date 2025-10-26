"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { OtpDialog } from "@/components/auth/otp-dialog"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)

  const handleOtpSent = (userEmail: string) => {
    setEmail(userEmail)
    setShowOtpDialog(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PayOrbit</h1>
          <p className="text-gray-600">Seamless invoicing and payments</p>
        </div>
        
        <LoginForm onOtpSent={handleOtpSent} />
        
        <OtpDialog
          isOpen={showOtpDialog}
          email={email}
          onClose={() => setShowOtpDialog(false)}
        />
      </div>
    </div>
  )
}
