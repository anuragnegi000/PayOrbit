@workspace
Create a complete **Landing Page for PayOrbit**, designed to match the existing Invoice Creator and Payment system built previously.

🧭 Goal:
Build a responsive, high-converting landing page that showcases PayOrbit’s features (invoice creation, QR payments, real-time tracking, etc.) using **Next.js (App Router)**, **TypeScript**, **Tailwind**, and **shadcn/ui components**.

The landing page should be elegant, minimal, and light-themed, consistent with the app’s design.

---

## 🧱 Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (light mode)
- shadcn/ui for all components
- framer-motion for animations
- lucide-react for icons
- Responsive layout (desktop / mobile)
- Smooth scroll navigation

---

## 📄 Pages to Generate
- `/app/page.tsx` → main landing page
- `/components/landing/` → folder for modular UI sections:
  - `Navbar.tsx`
  - `HeroSection.tsx`
  - `FeaturesSection.tsx`
  - `HowItWorks.tsx`
  - `TestimonialsSection.tsx`
  - `CTASection.tsx`
  - `Footer.tsx`

---

## 🎨 Design System
- Light background (#ffffff), subtle gray text (#1f2937)
- Primary color: light blue (`#2563eb`)
- Accent color: emerald green for highlights
- Use rounded-2xl cards, soft shadows
- Animations: fade-in, slide-up via Framer Motion
- Typography: large headlines, balanced white space
- Use `Card`, `Button`, `Badge`, `Input`, `Separator`, `Avatar`, `Tabs` from shadcn/ui

---

## 🧭 Layout Overview

### 🧩 Navbar
**File:** `/components/landing/Navbar.tsx`
- Logo (PayOrbit)
- Menu items: “Features”, “How It Works”, “Pricing”, “Contact”
- “Login” and “Get Started” buttons (link to `/login` and `/dashboard`)
- Sticky top, white background, shadow-sm

---

### 💫 Hero Section
**File:** `/components/landing/HeroSection.tsx`
- Large headline: “Simplify Payments. Empower Your Business.”
- Subtext: “PayOrbit helps you create invoices, share QR codes, and accept payments instantly — all in one secure platform.”
- Primary CTA: “Get Started for Free”
- Secondary CTA: “View Demo”
- Include illustration or mock screenshot of the dashboard (use placeholder image)
- Animated fade-in with Framer Motion

---

### ⚙️ Features Section
**File:** `/components/landing/FeaturesSection.tsx`
- 3-4 feature cards in a responsive grid:
  1. “Create Invoices Instantly” – icon: FilePlus
  2. “Share Secure Payment Links” – icon: Link
  3. “QR Code Payments” – icon: QrCode
  4. “Track Real-Time Payments” – icon: Activity
- Each card uses a shadcn `Card` with icon, title, and description.
- Animate on scroll (fade-up).

---

### 🔁 How It Works
**File:** `/components/landing/HowItWorks.tsx`
A step-by-step visual guide using icons and numbered cards:
1. **Login / Signup**
2. **Create Invoice**
3. **Share Link / QR**
4. **Get Paid**
- Use horizontal steps layout on desktop, stacked on mobile.
- Each step has icon + short description.

---

### 💬 Testimonials Section
**File:** `/components/landing/TestimonialsSection.tsx`
- 2–3 testimonials inside shadcn `Card` components
- Include avatar, name, role, feedback
- Subtle Framer Motion animation
- Example: “PayOrbit simplified our payment workflow by 70%!”

---

### 🚀 CTA Section
**File:** `/components/landing/CTASection.tsx`
- Bold headline: “Start accepting payments in minutes.”
- Button: “Get Started Free”
- Secondary text: “No credit card required.”
- Full-width light blue background, centered content.

---

### 🧩 Footer
**File:** `/components/landing/Footer.tsx`
- Logo + short tagline
- Links: About • Terms • Privacy • Contact
- Social icons (lucide-react)
- Copyright text

---

## 📁 File Structure Summary
app/
├── page.tsx
components/
└── landing/
├── Navbar.tsx
├── HeroSection.tsx
├── FeaturesSection.tsx
├── HowItWorks.tsx
├── TestimonialsSection.tsx
├── CTASection.tsx
└── Footer.tsx

yaml
Copy code

---

## ✨ Functionality & Animation
- Add scroll-based fade-in animations using Framer Motion.
- Smooth scroll navigation between sections.
- CTA buttons link to `/login` or `/dashboard`.
- All sections responsive (stacked on mobile).

---

## 💅 Styling
- Keep background white (`bg-white`)
- Section padding: `py-20 px-6 md:px-16`
- Headings use `text-4xl font-bold text-gray-900`
- Subheadings `text-gray-600`
- Buttons use shadcn variants: `variant="default"` for blue, `variant="outline"` for white

---

## ✅ Expected Deliverable
Generate:
1. Full landing page UI using above components.
2. Animated, responsive design.
3. End-to-end structure ready to plug into the existing Next.js app.
4. Uses only shadcn/ui + Tailwind + Framer Motion.
5. Light theme only.

Generate all files listed above with production-ready code and clean structure.