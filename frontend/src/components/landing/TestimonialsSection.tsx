"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const testimonials = [
  { name: "Sara Lee", role: "CFO, Acme Co.", quote: "PayOrbit simplified our payment workflow by 70% and reduced reconciliation time." },
  { name: "Jamal Khan", role: "Founder, Cafe 77", quote: "QR payments are a game changer — our customers love the convenience." },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-16">
        <h2 className="text-3xl font-bold text-gray-900">What our customers say</h2>
        <p className="text-gray-600 mt-2 max-w-2xl">Real feedback from businesses using PayOrbit.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="rounded-2xl shadow-sm">
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-semibold">{t.name[0]}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-sm text-gray-600">{t.role}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-700">“{t.quote}”</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
