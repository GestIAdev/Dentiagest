// 🎯💰 BADGE COMPONENT - SHADCN/UI CYBERPUNK EDITION
// Date: 2025
// Mission: Semantic badges for profit margins and status indicators
// Style: Neon glow indicators

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default - Cyan glow
        default:
          "border-transparent bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30",
        
        // Success - Green neon (Profit > 50%)
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:bg-emerald-500/30",
        
        // Warning - Yellow/Amber (Profit 20-50%)
        warning:
          "border-transparent bg-amber-500/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:bg-amber-500/30",
        
        // Danger - Red neon (Profit < 20%)
        danger:
          "border-transparent bg-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)] hover:bg-red-500/30",
        
        // Outline - Border only
        outline: 
          "text-gray-300 border-gray-600 hover:bg-gray-800",
        
        // Secondary - Purple
        secondary:
          "border-transparent bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
        
        // Destructive - For errors
        destructive:
          "border-transparent bg-red-900/50 text-red-400 hover:bg-red-900/80",
        
        // Info - Blue
        info:
          "border-transparent bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
        
        // Paid status - Bright green
        paid:
          "border-transparent bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        
        // Pending status - Yellow pulsing
        pending:
          "border-transparent bg-yellow-500/20 text-yellow-400 animate-pulse",
        
        // Overdue status - Red alert
        overdue:
          "border-transparent bg-red-600/30 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// 💰 PROFIT MARGIN BADGE - Automatic color based on percentage
interface ProfitMarginBadgeProps {
  profitMargin: number | null | undefined
  className?: string
}

function ProfitMarginBadge({ profitMargin, className }: ProfitMarginBadgeProps) {
  if (profitMargin === null || profitMargin === undefined) {
    return <Badge variant="outline" className={className}>N/A</Badge>
  }
  
  const percentage = profitMargin * 100
  
  // Determine variant based on profit margin
  let variant: 'success' | 'warning' | 'danger'
  if (percentage >= 50) {
    variant = 'success'
  } else if (percentage >= 20) {
    variant = 'warning'
  } else {
    variant = 'danger'
  }
  
  return (
    <Badge variant={variant} className={className}>
      {percentage.toFixed(1)}%
    </Badge>
  )
}

// 💳 INVOICE STATUS BADGE - Automatic styling based on status
interface InvoiceStatusBadgeProps {
  status: string
  className?: string
}

function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  
  const variantMap: Record<string, 'paid' | 'pending' | 'overdue' | 'info' | 'outline'> = {
    'paid': 'paid',
    'pagada': 'paid',
    'completed': 'paid',
    'pending': 'pending',
    'pendiente': 'pending',
    'draft': 'info',
    'borrador': 'info',
    'overdue': 'overdue',
    'vencida': 'overdue',
    'cancelled': 'outline',
    'cancelada': 'outline',
  }
  
  const variant = variantMap[normalizedStatus] || 'outline'
  
  const labelMap: Record<string, string> = {
    'paid': 'Pagada',
    'pagada': 'Pagada',
    'completed': 'Completada',
    'pending': 'Pendiente',
    'pendiente': 'Pendiente',
    'draft': 'Borrador',
    'borrador': 'Borrador',
    'overdue': 'Vencida',
    'vencida': 'Vencida',
    'cancelled': 'Cancelada',
    'cancelada': 'Cancelada',
  }
  
  return (
    <Badge variant={variant} className={className}>
      {labelMap[normalizedStatus] || status}
    </Badge>
  )
}

export { Badge, badgeVariants, ProfitMarginBadge, InvoiceStatusBadge }
