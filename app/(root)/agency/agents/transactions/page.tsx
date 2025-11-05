"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
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
import { Loader2, X, Info } from "lucide-react";

export default function TransactionsPage() {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [status, setStatus] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // selected transaction
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  const fetchTransactions = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (status) params.append("status", status);
      if (vehicleId) params.append("vehicleId", vehicleId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(
        `${API}${URLS.agency_agent.transactions}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        const data = res.data.data;
        setTransactions(data.items || data || []);
        setTotalPages(data.meta?.totalPages || 1);
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
    <div className="px-4 space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your recent funding transactions
          </p>
        </div>

        <Button onClick={fetchTransactions} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <Input
              placeholder="Vehicle ID / Plate Number"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            />
          </div>

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
                    <th className="px-4 py-2 text-left">Ref</th>
                    <th className="px-4 py-2 text-left">Vehicle</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Commission</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedTxn(txn)}>
                      <td className="px-4 py-2">{txn.transactionReference}</td>
                      <td className="px-4 py-2">
                        {txn.vehicle?.plateNumber || "-"}
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
                      <td className="px-4 py-2">
                        <Button size="icon" variant="ghost">
                          <Info className="h-4 w-4" />
                        </Button>
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

      {/* Detail Drawer */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <Card className="w-full max-w-lg bg-card border border-primary/30 shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Transaction Details</CardTitle>
              <button onClick={() => setSelectedTxn(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <p className="text-muted-foreground">Reference</p>
                <p className="font-medium">
                  {selectedTxn.transactionReference}
                </p>

                <p className="text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {selectedTxn.vehicle?.plateNumber || "N/A"}
                </p>

                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  ₦{Number(selectedTxn.vehicleOwnerAmount).toLocaleString()}
                </p>

                <p className="text-muted-foreground">Commission</p>
                <p className="font-medium">
                  ₦{Number(selectedTxn.agentCommission).toLocaleString()}
                </p>

                <p className="text-muted-foreground">Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedTxn.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : selectedTxn.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedTxn.status === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                  {selectedTxn.status}
                </span>

                <p className="text-muted-foreground">Created At</p>
                <p>{new Date(selectedTxn.createdAt).toLocaleString()}</p>

                {selectedTxn.failureReason && (
                  <>
                    <p className="text-muted-foreground">Failure Reason</p>
                    <p className="text-destructive font-medium">
                      {selectedTxn.failureReason}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTxn(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
