"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Image from "next/image"
import logo from "../../../public/payorbitLogo.png"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-full bg-blue-600 text-white w-10 flex items-center justify-center font-bold">
            {/* <Image className="rounded-full " src={logo} alt=""></Image> */}
          </div>
          <span className="text-lg font-bold text-gray-900">PayOrbit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#how" className="hover:text-gray-900">How It Works</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#contact" className="hover:text-gray-900">Contact</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          <Menu />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col px-4 py-3 gap-2">
            <a href="#features" className="py-2">Features</a>
            <a href="#how" className="py-2">How It Works</a>
            <a href="#pricing" className="py-2">Pricing</a>
            <a href="#contact" className="py-2">Contact</a>
            <Link href="/login" className="py-2">Login</Link>
            <Link href="/dashboard" className="py-2">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  )
}
