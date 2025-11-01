"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, DollarSign, Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Transaction, TransactionStatus } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import { formatDateTime } from "@/format";
import { StatCard } from "@/components/shared/agency/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/agency/page-header";

// Mock data - expanded from agent view
const mockTransactions: Transaction[] = [
  {
    id: "1",
    vehicleId: "v1",
    vehiclePlateNumber: "ABC-123-XY",
    agentId: "a1",
    agentName: "Agent A",
    requestedAmount: 50000,
    payableAmount: 47500,
    commissionAmount: 2500,
    agentCommission: 1500,
    agencyCommission: 1000,
    status: "SUCCESS",
    paymentReference: "TXN-1234567890",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    vehicleId: "v2",
    vehiclePlateNumber: "XYZ-456-AB",
    agentId: "a2",
    agentName: "Agent B",
    requestedAmount: 75000,
    payableAmount: 71250,
    commissionAmount: 3750,
    agentCommission: 2250,
    agencyCommission: 1500,
    status: "SUCCESS",
    paymentReference: "TXN-1234567891",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    vehicleId: "v3",
    vehiclePlateNumber: "DEF-789-CD",
    agentId: "a3",
    agentName: "Agent C",
    requestedAmount: 30000,
    payableAmount: 28500,
    commissionAmount: 1500,
    agentCommission: 900,
    agencyCommission: 600,
    status: "FAILED",
    paymentReference: "TXN-1234567892",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const statusColors: Record<TransactionStatus, string> = {
  SUCCESS: "default",
  FAILED: "destructive",
  PENDING: "secondary",
  PROCESSING: "secondary",
};

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "agentName",
    header: "Agent",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("agentName")}</span>
    ),
  },
  {
    accessorKey: "vehiclePlateNumber",
    header: "Vehicle",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("vehiclePlateNumber")}</span>
    ),
  },
  {
    accessorKey: "requestedAmount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("requestedAmount")),
  },
  {
    accessorKey: "agencyCommission",
    header: "Agency Commission",
    cell: ({ row }) => (
      <span className="text-awesome font-medium">
        {formatCurrency(row.getValue("agencyCommission"))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TransactionStatus;
      return <Badge variant={statusColors[status] as any}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDateTime(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => alert(`View details for ${row.original.id}`)}>
        View
      </Button>
    ),
  },
];

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const totalTransactions = mockTransactions.length;
  const totalRevenue = mockTransactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.requestedAmount, 0);
  const totalAgencyCommission = mockTransactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.agencyCommission, 0);

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (statusFilter !== "all" && transaction.status !== statusFilter)
      return false;
    if (agentFilter !== "all" && transaction.agentName !== agentFilter)
      return false;
    return true;
  });

  const uniqueAgents = Array.from(
    new Set(mockTransactions.map((t) => t.agentName))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions Explorer"
        description="View and analyze all agency transactions">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Transactions"
          value={totalTransactions}
          subtitle="All agents"
          icon={Activity}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Successful transactions"
          icon={DollarSign}
          iconColor="text-awesome"
        />
        <StatCard
          title="Agency Commission"
          value={formatCurrency(totalAgencyCommission)}
          subtitle="Total earned"
          icon={DollarSign}
          iconColor="text-awesome"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-title2Bold">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by vehicle or agent..."
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {uniqueAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || agentFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter("all");
                    setAgentFilter("all");
                  }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredTransactions}
            searchKey="vehiclePlateNumber"
          />
        </CardContent>
      </Card>
    </div>
  );
}
