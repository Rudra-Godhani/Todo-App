import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  delay?: number
}

export function StatCard({ title, value, description, icon, delay = 0 }: StatCardProps) {
  return (
    <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000" style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
