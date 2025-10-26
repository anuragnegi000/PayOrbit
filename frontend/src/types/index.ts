export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled"

export interface User {
  _id: string
  email: string
  fullName: string
  gridUserId: string
  createdAt: string
}

export interface Invoice {
  _id: string
  merchant: string
  amount: number
  currency: string
  dueDate: string
  status: InvoiceStatus
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
  updatedAt: string
}

export interface CreateInvoicePayload {
  amount: number
  currency: string
  dueDate: string
  payerEmail?: string
  payerName?: string
  description?: string
  items?: Array<{
    description: string
    quantity: number
    price: number
  }>
}

export interface PaymentDetails {
  invoiceId: string
  amount: number
  currency: string
  merchantName: string
  description?: string
  virtualAccountDetails?: {
    accountNumber: string
    routingNumber: string
    bankName: string
  }
}
