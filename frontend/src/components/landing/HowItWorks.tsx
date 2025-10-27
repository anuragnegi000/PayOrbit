"use client"

import { motion } from "framer-motion"
import { CheckCircle, CreditCard, FilePlus, QrCode } from "lucide-react"

const steps = [
  { title: "Login / Signup", icon: FilePlus, desc: "Create an account or login to get started." },
  { title: "Create Invoice", icon: CreditCard, desc: "Add items, set due dates and amounts." },
  { title: "Share Link / QR", icon: QrCode, desc: "Send a payment link or QR to your customer." },
  { title: "Get Paid", icon: CheckCircle, desc: "Receive funds and track payment status." },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-16">
        <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
        <p className="text-gray-600 mt-2 max-w-2xl">A simple 4-step flow to get you paid fast.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="p-6 rounded-2xl shadow-sm bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <s.icon />
                  </div>
                  <div className="text-sm font-semibold">{`Step ${i + 1}`}</div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="text-gray-600 mt-2">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
