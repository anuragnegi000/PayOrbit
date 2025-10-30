"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import { Button } from "@/components/ui/button"
import { LogOut, FileText } from "lucide-react"
import Link from "next/link"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore()

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) return
    
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, _hasHydrated, router])

  // Show loading state while hydrating
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-gray-900" />
              <span className="text-xl font-bold text-gray-900">PayOrbit</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.fullName || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
