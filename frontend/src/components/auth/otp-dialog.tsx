"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store/authStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface OtpDialogProps {
  isOpen: boolean
  email: string
  onClose: () => void
}

export function OtpDialog({ isOpen, email, onClose }: OtpDialogProps) {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      console.log("🔄 Verifying OTP...", { email, otp })
      const response = await authAPI.verifyOtp(email, otp)
      console.log("✅ OTP Response:", response)
      console.log("✅ Full response.data:", response.data)
      
      // The actual user is in response.data.data.user (Axios wraps it)
      const userData = response.data?.data?.user || response.data?.user
      console.log("👤 User data:", userData)
      
      if (userData) {
        setUser(userData)
        console.log("✅ User set in store, navigating to dashboard...")
        
        // Close the dialog first
        onClose()
        
        // Small delay to ensure Zustand persist saves to localStorage
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Use window.location for hard navigation to ensure state is loaded
        window.location.href = "/dashboard"
      } else {
        setError("Invalid response format from server")
        console.error("❌ No user data in response:", response.data)
      }
    } catch (err: any) {
      console.error("❌ OTP Verification Error:", err)
      setError(err.response?.data?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setIsLoading(true)
      setError("")
      // You'll need to implement resend endpoint in backend
      setTimeLeft(600)
      setOtp("")
    } catch (err: any) {
      setError("Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setOtp(value)
                if (error) setError("")
              }}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Code expires in {formatTime(timeLeft)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isLoading || timeLeft > 540}
            >
              Resend code
            </Button>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
