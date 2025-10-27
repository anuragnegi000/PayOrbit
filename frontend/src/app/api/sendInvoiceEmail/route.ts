import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, invoiceId, paymentLink, qrDataUrl, amount, currency, dueDate, payerName } = body

    // Validate required fields
    if (!email || !invoiceId || !paymentLink) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("📧 Sending invoice email via Gmail...")
    console.log("  To:", email)
    console.log("  Invoice ID:", invoiceId)
    console.log("  Amount:", amount, currency)

    // Format the due date
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: `"PayOrbit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoiceId} - Payment Required`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9fafb;
              }
              .container {
                background-color: white;
                border-radius: 16px;
                padding: 32px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 32px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 8px;
              }
              .invoice-details {
                background-color: #f9fafb;
                border-radius: 12px;
                padding: 20px;
                margin: 24px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
              }
              .detail-label {
                color: #6b7280;
                font-size: 14px;
              }
              .detail-value {
                font-weight: 600;
                color: #111827;
              }
              .amount {
                font-size: 24px;
                color: #111827;
              }
              .qr-section {
                text-align: center;
                margin: 32px 0;
              }
              .qr-code {
                max-width: 200px;
                height: auto;
                margin: 20px auto;
                display: block;
              }
              .button {
                display: inline-block;
                background-color: #111827;
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
              }
              .payment-link {
                background-color: #f3f4f6;
                padding: 12px;
                border-radius: 8px;
                word-break: break-all;
                font-size: 14px;
                color: #4b5563;
                margin: 16px 0;
              }
              .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">💳 PayOrbit</div>
                <p style="color: #6b7280; margin: 0;">Invoice Payment Required</p>
              </div>

              <p style="font-size: 16px;">Dear ${payerName || 'Valued Customer'},</p>
              
              <p>You have received a new invoice that requires payment. Please review the details below:</p>

              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Invoice ID</span>
                  <span class="detail-value">${invoiceId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Due</span>
                  <span class="detail-value amount">${currency} ${amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Due Date</span>
                  <span class="detail-value">${formattedDueDate}</span>
                </div>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${paymentLink}" class="button">Pay Invoice Now</a>
              </div>

              <div class="qr-section">
                <h3 style="color: #111827; margin-bottom: 8px;">Quick Payment</h3>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                  Scan this QR code with your mobile device to pay instantly
                </p>
                <img src="${qrDataUrl}" alt="Payment QR Code" class="qr-code" />
              </div>

              <div style="margin-top: 24px;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                  Or copy and paste this link in your browser:
                </p>
                <div class="payment-link">${paymentLink}</div>
              </div>

              <div class="footer">
                <p style="margin: 0;">This is an automated email from PayOrbit.</p>
                <p style="margin: 8px 0 0 0;">If you have any questions, please contact the merchant directly.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log("✅ Email sent successfully via Gmail")
    console.log("  Message ID:", info.messageId)
    console.log("  Response:", info.response)

    return NextResponse.json({
      success: true,
      message: "Invoice email sent successfully",
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("❌ Error sending email:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send email" },
      { status: 500 }
    )
  }
}
