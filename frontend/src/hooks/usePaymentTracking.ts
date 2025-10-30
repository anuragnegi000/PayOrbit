import { useState, useEffect, useCallback } from "react"
import { invoiceAPI } from "@/lib/api"
import { toast } from "sonner"

interface TrackingStatus {
  invoiceId: string
  status: string
  isTracking: boolean
  trackingStartedAt?: string
  paidAt?: string
  transferId?: string
}

export function usePaymentTracking(invoiceId: string | null, enabled: boolean = true) {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tracking status
  const fetchStatus = useCallback(async () => {
    if (!invoiceId || !enabled) return

    try {
      const response = await invoiceAPI.getTrackingStatus(invoiceId)
      
      if (response.data.success) {
        setTrackingStatus(response.data.data)
        
        // If payment is completed, show success toast
        if (response.data.data.status === "paid" && !trackingStatus?.paidAt) {
          toast.success("🎉 Payment received!")
        }
      }
    } catch (err) {
      console.error("Error fetching tracking status:", err)
    }
  }, [invoiceId, enabled, trackingStatus?.paidAt])

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!invoiceId) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await invoiceAPI.startTracking(invoiceId)
      
      if (response.data.success) {
        toast.success("Payment tracking started")
        fetchStatus()
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to start tracking"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [invoiceId, fetchStatus])

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (!invoiceId) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await invoiceAPI.stopTracking(invoiceId)
      
      if (response.data.success) {
        toast.info("Payment tracking stopped")
        setTrackingStatus(null)
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to stop tracking"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [invoiceId])

  // Poll for status updates every 10 seconds when tracking is active
  useEffect(() => {
    if (!invoiceId || !enabled) return

    // Initial fetch
    fetchStatus()

    // Set up polling
    const interval = setInterval(() => {
      fetchStatus()
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [invoiceId, enabled, fetchStatus])

  return {
    trackingStatus,
    isLoading,
    error,
    startTracking,
    stopTracking,
    refreshStatus: fetchStatus,
  }
}
