"use client"

import Link from "next/link"
import { Twitter, Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-6 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center font-bold">PO</div>
            <div>
              <div className="text-gray-900 font-bold">PayOrbit</div>
              <div className="text-sm text-gray-600">Invoice & QR payments simplified</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-gray-600">About</Link>
          <Link href="/terms" className="text-sm text-gray-600">Terms</Link>
          <Link href="/privacy" className="text-sm text-gray-600">Privacy</Link>
          <Link href="#contact" className="text-sm text-gray-600">Contact</Link>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <a href="#" aria-label="twitter"><Twitter /></a>
          <a href="#" aria-label="github"><Github /></a>
          <a href="#" aria-label="linkedin"><Linkedin /></a>
        </div>
      </div>

      <div className="border-t py-4">
        <div className="container mx-auto px-6 md:px-16 text-center text-sm text-gray-500">© {new Date().getFullYear()} PayOrbit. All rights reserved.</div>
      </div>
    </footer>
  )
}
