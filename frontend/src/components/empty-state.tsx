"use client"

import { FileQuestion } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-gray-400">
        {icon || <FileQuestion className="h-12 w-12" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
      {description && <p className="mb-6 text-sm text-gray-600">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
