"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Car,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/shared/agency/stats-card";
import { PageHeader } from "@/components/shared/agency/page-header";

// Mock data
const agentPerformanceData = [
  { name: "Agent A", transactions: 45, commission: 125000 },
  { name: "Agent B", transactions: 38, commission: 98000 },
  { name: "Agent C", transactions: 52, commission: 145000 },
  { name: "Agent D", transactions: 29, commission: 75000 },
  { name: "Agent E", transactions: 41, commission: 110000 },
];

const revenueByLGA = [
  { lga: "Ondo West", revenue: 2500000 },
  { lga: "Ondo East", revenue: 1800000 },
  { lga: "Akure South", revenue: 3200000 },
  { lga: "Akure North", revenue: 1500000 },
];

export default function AgencyAdminDashboard() {
  const stats = {
    totalTransactions: 205,
    totalRevenue: 9850000,
    activeAgents: 12,
    totalCommission: 553000,
    successRate: 94.6,
    outstandingFees: 296000,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Overview Dashboard"
        description="Monitor agency performance and agent activities"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          subtitle="Across all agents"
          icon={Activity}
          iconColor="text-primary"
          trend={{ value: "+12.5% from last month", isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="All time"
          icon={DollarSign}
          iconColor="text-awesome"
          trend={{ value: "+8.3% from last month", isPositive: true }}
        />
        <StatCard
          title="Active Agents"
          value={stats.activeAgents}
          subtitle="Currently active"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Commission"
          value={formatCurrency(stats.totalCommission)}
          subtitle="Agency share"
          icon={DollarSign}
          iconColor="text-awesome"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle="Transaction success"
          icon={TrendingUp}
          iconColor="text-awesome"
        />
        <StatCard
          title="Outstanding Fees"
          value={formatCurrency(stats.outstandingFees)}
          subtitle="Pending collection"
          icon={AlertCircle}
          iconColor="text-destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-title2Bold">Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                transactions: {
                  label: "Transactions",
                  color: "hsl(var(--primary))",
                },
                commission: {
                  label: "Commission",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="transactions"
                    fill="hsl(var(--primary))"
                    name="Transactions"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="commission"
                    fill="hsl(var(--chart-2))"
                    name="Commission (₦)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-title2Bold">Revenue by LGA</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByLGA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lga" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--chart-1))"
                    name="Revenue (₦)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-title2Bold">
              Top Performing Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformanceData
                .sort((a, b) => b.commission - a.commission)
                .slice(0, 5)
                .map((agent, index) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-body font-medium">{agent.name}</p>
                        <p className="text-caption text-muted-foreground">
                          {agent.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-body font-medium text-awesome">
                        {formatCurrency(agent.commission)}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Commission
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-title2Bold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-awesome/10">
                  <Activity className="h-4 w-4 text-awesome" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">
                    Agent C completed funding
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Vehicle ABC-123-XY • 2 hours ago
                  </p>
                </div>
                <Badge>Success</Badge>
              </div>
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">New agent onboarded</p>
                  <p className="text-caption text-muted-foreground">
                    Agent F joined • 5 hours ago
                  </p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">Payment failed</p>
                  <p className="text-caption text-muted-foreground">
                    Agent B • Vehicle XYZ-456-AB • 1 day ago
                  </p>
                </div>
                <Badge variant="destructive">Failed</Badge>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">
                    New vehicle registered
                  </p>
                  <p className="text-caption text-muted-foreground">
                    DEF-789-CD • 1 day ago
                  </p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
