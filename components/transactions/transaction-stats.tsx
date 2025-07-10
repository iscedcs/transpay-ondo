"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock, Currency } from "lucide-react"
import type { TransactionStats as TransactionStatsType } from "@/types/transactions"

interface TransactionStatsProps {
  stats: TransactionStatsType
}

export function TransactionStats({ stats }: TransactionStatsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
    }).format(amount)
  }

  const successRate = stats.totalTransactions > 0 ? (stats.successfulTransactions / stats.totalTransactions) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
          <div className="flex items-center space-x-2 mt-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <Currency className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
          <p className="text-xs text-muted-foreground mt-2">Across all transaction types</p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              Success: {stats.successfulTransactions}
            </Badge>
            {stats.failedTransactions > 0 && (
              <Badge variant="destructive" className="text-xs">
                Failed: {stats.failedTransactions}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Successful</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {stats.successfulTransactions}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <Badge variant="destructive">{stats.failedTransactions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="secondary">{stats.pendingTransactions}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
