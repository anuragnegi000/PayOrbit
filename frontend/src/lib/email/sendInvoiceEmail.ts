import axios from "axios"

export interface SendInvoiceEmailParams {
  email: string
  invoiceId: string
  paymentLink: string
  qrDataUrl: string
  amount: number
  currency: string
  dueDate: string
  payerName?: string
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
  const res = await axios.post("/api/sendInvoiceEmail", params)
  return res.data
}
