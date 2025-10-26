"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import { Loader } from "@/components/ui/loader"

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader text="Loading..." />
    </div>
  )
}
