"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { API, URLS } from "@/lib/const";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function TransactionsTable({ agencyId }: { agencyId: string }) {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [status, setStatus] = useState("ALL");
  const [vehicleId, setVehicleId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = async () => {
    if (!agencyId || !token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (status && status !== "ALL") params.append("status", status);
      if (vehicleId) params.append("vehicleId", vehicleId);
      if (agentId) params.append("agentId", agentId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(
        `${API}${URLS.agency.one_agency_transactions.replace(
          "{id}",
          agencyId
        )}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        const transactions = res.data.data?.transactions || [];
        setTransactions(transactions);
        const pagination = res.data.pagination || {};
        setTotalPages(pagination.pages || 1);
      } else {
        toast.error(res.data?.message || "Failed to fetch transactions");
      }
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions", {
        description: error?.response?.data?.message || "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, status, startDate, endDate]);

  return (
    <>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter transactions by vehicle, agent, or date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <Input
            placeholder="Vehicle ID / Plate Number"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          />
          <Input
            placeholder="Agent ID"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <Button
            onClick={() => {
              setPage(1);
              fetchTransactions();
            }}>
            Apply
          </Button>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No transactions found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {/* <th className="px-4 py-2 text-left">Ref</th> */}
                    <th className="px-4 py-2 text-left">
                      Vehicle Plate Number
                    </th>
                    <th className="px-4 py-2 text-left">Vehicle Id</th>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Commission</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-muted/30">
                      {/* <td className="px-4 py-2">{txn.transactionReference}</td> */}
                      <td className="px-4 py-2">
                        {txn.vehicle?.plateNumber || txn.vehicleId || "-"}
                      </td>
                      <td className="px-4 py-2">{txn.vehicleId}</td>
                      <td className="px-4 py-2">
                        {txn.agent?.firstName
                          ? `${txn.agent.firstName} ${txn.agent.lastName}`
                          : txn.agentId || "-"}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        ₦{Number(txn.vehicleOwnerAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        ₦{Number(txn.agentCommission).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            txn.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : txn.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : txn.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(txn.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </>
  );
}
