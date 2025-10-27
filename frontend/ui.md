@workspace
Enhance the Invoice Creation flow with **automatic QR code generation** and **email sharing** for payment links.

🧠 Goal:
When a merchant creates a new invoice, the system should:
1. Automatically generate a **QR code** for the invoice payment link.
2. Display the QR code in the success dialog.
3. Allow downloading the QR code as an image.
4. Automatically **send the invoice details and QR code via email** to the customer.

---

## 🧱 Tech Requirements
- Next.js (App Router)
- TypeScript
- Tailwind CSS (light theme)
- shadcn/ui components
- `react-qr-code` for QR generation
- `react-hook-form` + `zod` for validation
- `axios` for API calls
- `framer-motion` for animation
- Email sending handled via a mock API (`/api/sendInvoiceEmail`) for now
- Clean, light UI with soft borders, rounded-2xl corners, and padding

---

## 📦 Dependencies to Install
Add these in setup:
```bash
npm install react-qr-code axios
⚙️ Files to Create / Modify
1️⃣ /components/ui/QRCodeDisplay.tsx
Reusable component that renders a QR code and supports image download.

Requirements:

Props:

value: string (QR code URL)

label?: string

Uses react-qr-code

Contains:

Centered QR code

“Download QR” button (saves QR as PNG)

Optional label text under the QR

Use Card, Button, and Separator from shadcn

Use canvas export technique:

tsx
Copy code
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
Add Framer Motion fade-in animation

2️⃣ /lib/utils/downloadQR.ts
Helper to export a QR code component as an image.

Example:

ts
Copy code
export async function downloadQR(elementId: string, filename: string = "invoice_qr.png") {
  const node = document.getElementById(elementId);
  if (!node) return;
  const dataUrl = await toPng(node);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
3️⃣ /app/api/sendInvoiceEmail/route.ts
Mock backend route to simulate sending email with QR attachment.

Functionality:

Accepts JSON body: { email, invoiceId, paymentLink, qrDataUrl }

Simulates email sending using console.log() or setTimeout

Returns success JSON { success: true }

Use this later with a real email provider (SendGrid, Resend, Mailgun, etc.)

4️⃣ /components/invoices/CreateInvoiceForm.tsx
Modify the existing invoice creation form to include:

QR generation step once invoice is created

QR displayed in success dialog

“Send Email” button that calls /api/sendInvoiceEmail

Display success toast after sending

Dialog layout:

rust
Copy code
✅ Invoice Created Successfully!

Invoice ID: INV-123
Payment Link: https://myapp.com/pay/INV-123

[ Scan to Pay ]
<QRCodeDisplay value={paymentLink} label="Scan to Pay" />

[ Copy Link ] [ Download QR ] [ Send Email ]
Flow:

Merchant fills out invoice form.

On submit → POST to backend to create invoice.

When success response received:

Generate payment link.

Display Dialog with invoice details and QR code.

Auto-call generateQRCode() to display it.

When merchant clicks “Send Email”:

Convert QR to base64 using toPng()

POST to /api/sendInvoiceEmail

Show toast on success.

Use shadcn components:

Dialog, Button, Separator, Card, Toast

Icons: Mail, Copy, Download, CheckCircle

5️⃣ /lib/email/sendInvoiceEmail.ts
Client-side utility that calls the API endpoint.

ts
Copy code
import axios from "axios";

export async function sendInvoiceEmail({
  email,
  invoiceId,
  paymentLink,
  qrDataUrl,
}: {
  email: string;
  invoiceId: string;
  paymentLink: string;
  qrDataUrl: string;
}) {
  const res = await axios.post("/api/sendInvoiceEmail", {
    email,
    invoiceId,
    paymentLink,
    qrDataUrl,
  });
  return res.data;
}
6️⃣ (Optional) /components/ui/EmailSentToast.tsx
Small toast component that shows “Email sent successfully to [customer email]”.

💅 UI/UX Requirements
Light color palette (white, gray-100, gray-300 borders)

Center QR in modal, responsive layout

Use subtle animations (fade/scale)

Dialog should auto-adjust width (max-w-lg)

Add “Copy link” button with toast feedback

Display a green badge or icon when email sent

📁 Updated Structure Summary
vbnet
Copy code
components/
 ├── invoices/
 │     └── CreateInvoiceForm.tsx
 └── ui/
       ├── QRCodeDisplay.tsx
       ├── EmailSentToast.tsx (optional)
lib/
 ├── utils/
 │     └── downloadQR.ts
 ├── email/
 │     └── sendInvoiceEmail.ts
app/
 ├── api/
 │     └── sendInvoiceEmail/
 │           └── route.ts
✅ Expected Result
Merchant creates invoice.

Success dialog shows:

Invoice details

Payment link

QR code

Buttons:

Copy link → copies to clipboard

Download QR → saves QR as image

Send Email → calls /api/sendInvoiceEmail

Email successfully “sent” (mock backend) with QR attachment.

UI gives feedback via toast.

Now generate the entire QR code + email feature end to end across the files listed above.
Make sure it’s visually consistent with the rest of the app (light theme, shadcn components, rounded cards, clear UX).

yaml
Copy code
