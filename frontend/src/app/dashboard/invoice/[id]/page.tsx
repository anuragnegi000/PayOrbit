"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { invoiceAPI } from "@/lib/api"
import { Invoice } from "@/types"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Loader } from "@/components/ui/loader"
import { ArrowLeft, Copy, ExternalLink, PlayCircle, StopCircle, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate, copyToClipboard } from "@/lib/utils"
import { usePaymentTracking } from "@/hooks/usePaymentTracking"
import { toast } from "sonner"

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Payment tracking hook - enabled by default for pending invoices
  const {
    trackingStatus,
    isLoading: isTrackingLoading,
    startTracking,
    stopTracking,
    refreshStatus,
  } = usePaymentTracking(invoiceId, invoice?.status === "pending")

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  // Auto-start tracking for pending invoices
  useEffect(() => {
    if (invoice?.status === "pending" && invoiceId) {
      startTracking()
    }
  }, [invoice?.status, invoiceId])

  // Refresh invoice when tracking status changes to paid
  useEffect(() => {
    if (trackingStatus?.status === "paid") {
      fetchInvoice()
    }
  }, [trackingStatus?.status])

  const fetchInvoice = async () => {
    try {
      setIsLoading(true)
      const response = await invoiceAPI.getById(invoiceId)
      setInvoice(response.data)
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (invoice?.paymentLink) {
      await copyToClipboard(invoice.paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStopTracking = async () => {
    await stopTracking()
  }

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "✓"
      case "pending":
        return "⏳"
      case "overdue":
        return "⚠"
      case "cancelled":
        return "✕"
      default:
        return "⏳"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader text="Loading invoice..." />
        </div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-gray-600 mt-1">Invoice ID: {invoice._id}</p>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Invoice Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.createdAt)}</p>
              </div>
              {invoice.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {invoice.payerName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">
                  {invoice.payerEmail || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        {invoice.items && invoice.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatCurrency(item.price, invoice.currency)}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.price, invoice.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Link */}
        {invoice.paymentLink && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl p-3 font-mono text-sm text-gray-800 overflow-x-auto">
                  {invoice.paymentLink}
                </div>
                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  onClick={() => window.open(invoice.paymentLink, "_blank")}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Tracking */}
        {invoice.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Status Indicator */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getStatusIcon(trackingStatus?.status || "pending")}</div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Payment Status</p>
                    <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeStyle(trackingStatus?.status || "pending")}`}>
                      {(trackingStatus?.status || "pending").toUpperCase()}
                    </div>
                  </div>
                </div>
                {trackingStatus?.isTracking && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-medium">Monitoring</span>
                  </div>
                )}
              </div>

              {/* Tracking Info */}
              {trackingStatus?.trackingStartedAt && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tracking started:</span>{" "}
                  {formatDate(trackingStatus.trackingStartedAt)}
                </div>
              )}

              {/* Status Messages */}
              {trackingStatus?.status === "pending" && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⏳ Waiting for payment</span>
                    <br />
                    The system is actively monitoring for incoming payments. Status will update automatically when payment is received.
                  </p>
                </div>
              )}

              {trackingStatus?.status === "paid" && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">✓ Payment received!</span>
                    <br />
                    The payment has been successfully processed and confirmed.
                  </p>
                  {trackingStatus.transferId && (
                    <p className="text-xs text-green-700 mt-2 font-mono">
                      Transfer ID: {trackingStatus.transferId}
                    </p>
                  )}
                </div>
              )}

              {trackingStatus?.status === "overdue" && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">⚠ Payment overdue</span>
                    <br />
                    This invoice has passed its due date without payment.
                  </p>
                </div>
              )}

              {trackingStatus?.status === "cancelled" && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">✕ Invoice cancelled</span>
                    <br />
                    This invoice has been cancelled and payment is no longer expected.
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Automatic Payment Monitoring:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>System checks for incoming payments every 15 seconds</li>
                  <li>Automatically matches payment amount to invoice</li>
                  <li>Status updates in real-time when payment is received</li>
                  <li>You'll get a notification when payment is complete</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={refreshStatus}
                  variant="outline"
                  size="sm"
                  disabled={isTrackingLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                {trackingStatus?.status === "pending" && trackingStatus?.isTracking && (
                  <Button
                    onClick={handleStopTracking}
                    variant="ghost"
                    size="sm"
                    disabled={isTrackingLoading}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Monitoring
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Received Info */}
        {invoice.status === "paid" && trackingStatus?.paidAt && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Payment Received! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-green-700">Paid At</p>
                <p className="font-medium text-green-900">
                  {formatDate(trackingStatus.paidAt)}
                </p>
              </div>
              {trackingStatus.transferId && (
                <div>
                  <p className="text-sm text-green-700">Transfer ID</p>
                  <p className="font-mono text-sm text-green-900">
                    {trackingStatus.transferId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

