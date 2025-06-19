"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface RevenueComparisonProps {
  data: any[]
}

export default function RevenueComparison({ data }: RevenueComparisonProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LGA Comparison</CardTitle>
          <CardDescription>Compare revenue across selected LGAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Select LGAs to compare in the filters above</div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = data.reduce((sum, lga) => sum + lga.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Comparison Chart</CardTitle>
          <CardDescription>Visual comparison of selected LGAs</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lgaName" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>LGA Performance Ranking</CardTitle>
          <CardDescription>Detailed comparison metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>LGA Name</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Market Share</TableHead>
                <TableHead>Avg per Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lga, index) => {
                const marketShare = totalRevenue > 0 ? (lga.revenue / totalRevenue) * 100 : 0
                const avgPerTransaction = lga.transactions > 0 ? lga.revenue / lga.transactions : 0

                return (
                  <TableRow key={lga.lgaId}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{lga.lgaName}</TableCell>
                    <TableCell className="font-semibold">₦{lga.revenue.toLocaleString()}</TableCell>
                    <TableCell>{lga.transactions.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(marketShare, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{marketShare.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>₦{avgPerTransaction.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Combined Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((sum, lga) => sum + lga.transactions, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue per LGA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{data.length > 0 ? (totalRevenue / data.length).toLocaleString() : "0"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
