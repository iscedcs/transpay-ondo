"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StakeholderSplitProps {
  totalRevenue: number
}

export default function StakeholderSplit({ totalRevenue }: StakeholderSplitProps) {
  const stakeholders = [
    { name: "State IRS (EIRS)", percentage: 20, color: "bg-blue-500" },
    { name: "Local Government Area", percentage: 70, color: "bg-green-500" },
    { name: "ISCE", percentage: 10, color: "bg-orange-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Revenue Distribution</CardTitle>
        <CardDescription>Stakeholder revenue split breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stakeholders.map((stakeholder) => {
          const amount = (totalRevenue * stakeholder.percentage) / 100

          return (
            <div key={stakeholder.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stakeholder.color}`} />
                  <span className="text-sm font-medium">{stakeholder.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">₦{amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{stakeholder.percentage}%</div>
                </div>
              </div>
              <Progress value={stakeholder.percentage} className="h-2" />
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Revenue</span>
            <span className="font-bold text-lg">₦{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
