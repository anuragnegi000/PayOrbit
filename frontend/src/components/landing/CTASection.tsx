"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section id="cta" className="py-20 bg-blue-50">
      <div className="container mx-auto px-6 md:px-16 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Start accepting payments in minutes.</h2>
          <p className="text-gray-700 mt-3">No credit card required.</p>

          <div className="mt-6">
            <Link href="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
