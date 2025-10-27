"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePlus, Link as LinkIcon, QrCode, Activity } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Create Invoices Instantly",
    desc: "Build and send professional invoices in seconds.",
    icon: FilePlus,
  },
  {
    title: "Share Secure Payment Links",
    desc: "Generate safe, shareable links for fast checkout.",
    icon: LinkIcon,
  },
  {
    title: "QR Code Payments",
    desc: "Customers can pay by scanning a QR code.",
    icon: QrCode,
  },
  {
    title: "Track Real-Time Payments",
    desc: "Monitor payment status and reconcile quickly.",
    icon: Activity,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-16">
        <h2 className="text-3xl font-bold text-gray-900">Features</h2>
        <p className="text-gray-600 mt-2 max-w-2xl">Everything you need to accept payments and manage invoices.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <motion.div key={f.title} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} viewport={{ once: true }}>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                      <f.icon />
                    </div>
                    <CardTitle className="text-sm">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
