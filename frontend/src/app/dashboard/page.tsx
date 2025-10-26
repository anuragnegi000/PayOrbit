"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { invoiceAPI } from "@/lib/api"
import { Invoice, InvoiceStatus } from "@/types"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Loader } from "@/components/ui/loader"
import { Plus, Search, FileText, Copy } from "lucide-react"
import { formatCurrency, formatDate, copyToClipboard } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "all">("all")

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [searchQuery, activeFilter, invoices])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await invoiceAPI.getAll()
      setInvoices(response.data)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (activeFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === activeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.payerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.payerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredInvoices(filtered)
  }

  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === "pending").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  }

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0)

  const filters: Array<{ label: string; value: InvoiceStatus | "all" }> = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your invoices and payments</p>
          </div>
          <Button onClick={() => router.push("/dashboard/create-invoice")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue, "USD")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4">
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Loader text="Loading invoices..." />
            ) : filteredInvoices.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="No invoices found"
                description={
                  searchQuery || activeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first invoice to get started"
                }
                action={
                  searchQuery || activeFilter !== "all" ? undefined : (
                    <Button onClick={() => router.push("/dashboard/create-invoice")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  )
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice._id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/dashboard/invoice/${invoice._id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {invoice.payerName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {invoice.payerEmail || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell>
                        {invoice.paymentLink ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(invoice.paymentLink!)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/invoice/${invoice._id}`)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
