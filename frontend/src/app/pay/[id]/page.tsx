"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeDisplay } from "@/components/ui/QRCodeDisplay"
import { Copy, CheckCircle, Building2, Calendar, Mail, User, FileText, DollarSign, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { invoiceAPI } from "@/lib/api"

interface Invoice {
  _id: string
  merchant: {
    email: string
    fullName: string
    publicKey: string
  }
  amount: number
  currency: string
  dueDate: string
  status: string
  payerEmail?: string
  payerName?: string
  description?: string
  items?: Array<{
    description: string
    quantity: number
    price: number
  }>
  paymentLink?: string
  createdAt: string
}

export default function PaymentPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setIsLoading(true)
      const response = await invoiceAPI.getById(invoiceId)
      setInvoice(response.data)
    } catch (error) {
      console.error("Error fetching invoice:", error)
      toast.error("Failed to load invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Invoice not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPaid = invoice.status === "paid"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Payment Request</h1>
          <p className="text-gray-600">Secure invoice payment powered by PayOrbit</p>
        </div>

        {/* Status Banner */}
        {isPaid && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">This invoice has been paid</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Details</CardTitle>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Amount Due</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </div>
              </div>

              {/* Merchant Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Merchant</p>
                    <p className="font-medium">{invoice.merchant.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{invoice.merchant.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {invoice.description && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-sm">{invoice.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              {invoice.items && invoice.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Items</p>
                  <div className="space-y-2">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity, invoice.currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payer Info */}
              {(invoice.payerName || invoice.payerEmail) && (
                <div className="pt-4 border-t space-y-2">
                  {invoice.payerName && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Payer Name</p>
                        <p className="font-medium">{invoice.payerName}</p>
                      </div>
                    </div>
                  )}
                  {invoice.payerEmail && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Payer Email</p>
                        <p className="font-medium">{invoice.payerEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <div className="space-y-6">
            {!isPaid && (
              <>
                {/* QR Code */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scan to Pay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <QRCodeDisplay
                        value={invoice.merchant.publicKey}
                        label="Payment Address"
                      />
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Scan this QR code with your Grid wallet to pay
                    </p>
                  </CardContent>
                </Card>

                {/* Payment Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Or Pay Manually</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Payment Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={invoice.merchant.publicKey}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                        />
                        <Button
                          onClick={() => handleCopy(invoice.merchant.publicKey)}
                          variant="outline"
                          size="sm"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        💡 Payment Instructions:
                      </p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Open your Grid wallet</li>
                        <li>Send exactly {formatCurrency(invoice.amount, invoice.currency)}</li>
                        <li>To the address above</li>
                        <li>Payment will be confirmed automatically</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Powered by */}
            <div className="text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                Secured by
                <a
                  href="https://grid.squads.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 hover:underline inline-flex items-center gap-1"
                >
                  Grid Protocol
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
