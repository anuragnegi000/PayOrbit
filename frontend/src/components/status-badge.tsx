"use client"

import { InvoiceStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: InvoiceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<InvoiceStatus, "pending" | "paid" | "overdue" | "cancelled"> = {
    pending: "pending",
    paid: "paid",
    overdue: "overdue",
    cancelled: "cancelled",
  }

  const labelMap: Record<InvoiceStatus, string> = {
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  }

  return (
    <Badge variant={variantMap[status]}>
      {labelMap[status]}
    </Badge>
  )
}
