"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import dashboard from "../../../public/dashboard.png"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section id="hero" className="bg-white">
      <div className="container mx-auto py-20 px-6 md:px-16 flex flex-col-reverse md:flex-row items-center gap-12">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Simplify Payments. Empower Your Business.
          </h1>
          <p className="text-gray-600 mt-4 max-w-xl">
            PayOrbit helps you create invoices, share QR codes, and accept payments instantly — all in one secure platform.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link href="/login">
              <Button>Get Started for Free</Button>
            </Link>
            <a href="#features" className="text-sm text-gray-700 underline">View Demo</a>
          </div>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="w-full max-w-md rounded-2xl shadow-lg bg-white p-6">
            <div className="h-56 bg-gradient-to-tr from-blue-50 to-white rounded-lg flex items-center justify-center text-gray-400">
              <Image src={dashboard} alt="Dashboard Screenshot" className="object-contain h-full w-full" />
            </div>
            <div className="mt-4 text-sm text-gray-600">Invoice example • QR payment ready</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
