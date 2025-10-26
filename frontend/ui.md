@workspace
You are building a full-featured **Invoice Creator and Payment System frontend** in **Next.js (App Router)** using **TypeScript**, **Tailwind**, and **shadcn/ui** components.

Please create the full folder structure, pages, and components based on the flow described below.  
Use modern, clean, light-theme UI and shadcn components everywhere.

---

## 🧩 Stack & Design
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (light mode)
- shadcn/ui components
- lucide-react icons
- React Hook Form + Zod for validation
- Zustand or React Query for state management
- Framer Motion for animations
- Axios for API calls
- Use clean, light UI (white background, light gray borders, soft shadows)
- Rounded-2xl corners, shadow-sm, consistent padding (p-4, p-6)
- Typography: text-gray-800, headings font-semibold

---

## 🔐 Authentication (Merchant + Payer)
**Files to create:**
- `/app/login/page.tsx`
- `/app/verify-otp/page.tsx`
- `/lib/hooks/useAuth.ts`
- `/components/auth/LoginForm.tsx`
- `/components/auth/OTPDialog.tsx`

**Flow:**
- Email input + “Send OTP” → triggers fake/mocked API call
- OTP Dialog → verify and redirect to dashboard
- Store session in Zustand or localStorage
- Use shadcn `Card`, `Input`, `Button`, and `Dialog`

---

## 🧾 Merchant Dashboard
**Files to create:**
- `/app/dashboard/page.tsx`
- `/components/dashboard/InvoiceTable.tsx`
- `/components/dashboard/InvoiceCard.tsx`
- `/components/ui/StatusBadge.tsx`
- `/lib/hooks/useInvoices.ts`

**Features:**
- Top bar: logo, “Create Invoice” button, profile dropdown
- Filter tabs: “All”, “Pending”, “Paid”, “Overdue”
- Search bar for invoice ID / customer email
- Invoice table with columns:
  - Invoice ID
  - Customer Email
  - Amount
  - Status (Badge)
  - Due Date
  - “View” button
- On mobile → display as stacked cards
- Empty state view using `Card` and `Alert`

---

## ➕ Create Invoice
**Files to create:**
- `/app/create-invoice/page.tsx`
- `/components/invoices/CreateInvoiceForm.tsx`

**Form fields:**
- Customer Email
- Amount
- Description
- Due Date
- “Generate Payment Link” button

**After submission:**
- Mock API call returns Invoice ID + payment link
- Display success `Dialog` with:
  - Invoice ID
  - Shareable Link (copy button)
  - “Send via Email” option

Use shadcn `Dialog`, `Toast`, and `CopyButton`.

---

## 📡 Track Invoice Status
**Files to create:**
- `/app/invoice/[id]/page.tsx`
- `/components/invoices/InvoiceStatus.tsx`

**Display:**
- Invoice details (ID, amount, email, due date)
- Status badge (awaiting_funds, payment_processed, etc.)
- Progress indicator or status stepper
- Polling (mock) for real-time updates

---

## 💰 Payment Flow (Payer)
**Files to create:**
- `/app/pay/[invoiceId]/page.tsx`
- `/app/pay/[invoiceId]/receipt/page.tsx`
- `/components/pay/PaymentDetails.tsx`
- `/components/pay/PaymentButton.tsx`

**Steps:**
1. Customer lands on payment link `/pay/[invoiceId]`
2. Show merchant + invoice info
3. Authenticate via email + OTP if first time (reuse same auth components)
4. “Confirm and Pay” → simulate Grid SDK (mock delay 5–10s)
5. Show “Processing payment...” spinner
6. Redirect to `/pay/[invoiceId]/receipt` with:
   - Amount
   - Merchant
   - Transfer ID
   - Download / Print button

Use `Card`, `Alert`, and `Loader` components with Framer Motion transitions.

---

## 🧾 Receipt Page
**Files to create:**
- `/app/pay/[invoiceId]/receipt/page.tsx`
- Display payment confirmation
- Grid Transfer ID
- Transaction signature
- “Download PDF” and “Back to Home” buttons

---

## ⚙️ Global Utilities
Create these files for organization:
- `/lib/api.ts` → Axios instance
- `/components/ui/Loader.tsx`
- `/components/layouts/DashboardLayout.tsx`
- `/components/layouts/AuthLayout.tsx`
- `/components/ui/EmptyState.tsx`
- `/components/ui/ToastProvider.tsx`

---

## 🧭 File Structure Summary

app/
├── login/page.tsx
├── verify-otp/page.tsx
├── dashboard/page.tsx
├── create-invoice/page.tsx
├── invoice/[id]/page.tsx
├── pay/[invoiceId]/page.tsx
├── pay/[invoiceId]/receipt/page.tsx
components/
├── auth/
├── dashboard/
├── invoices/
├── pay/
├── layouts/
└── ui/
lib/
├── api.ts
├── hooks/
├── useAuth.ts
└── useInvoices.ts

yaml
Copy code

---

## ✨ Final Requirements
- Use only **light mode**
- Every page should be styled and responsive
- Use mock API responses for now
- Integrate consistent `Toast` notifications for success/error
- Animate page transitions with Framer Motion
- Keep UI minimal, elegant, and aligned with shadcn style

Now, generate the full Next.js frontend project file by file using the above structure and UI components.