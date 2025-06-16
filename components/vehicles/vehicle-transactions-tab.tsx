"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  ArrowDownUp,
  Search,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ArrowUpDown,
  Check,
  X,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/actions/vehicles";
import { formatCurrency } from "@/lib/utils";

interface VehicleTransactionsTabProps {
  vehicle: Vehicle;
}

type SortField = "date" | "amount" | "type" | "status";
type SortDirection = "asc" | "desc";
type TransactionType = "CREDIT" | "DEBIT" | "ALL";
type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED" | "OWING" | "ALL";
type PaymentType = "CVOF" | "FAREFLEX" | "ISCE" | "ALL";

export default function VehicleTransactionsTab({
  vehicle,
}: VehicleTransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [typeFilter, setTypeFilter] = useState<TransactionType>("ALL");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("ALL");
  const [paymentTypeFilter, setPaymentTypeFilter] =
    useState<PaymentType>("ALL");

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get transaction status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return {
          variant: "default" as const,
          icon: <Check className="h-3 w-3 mr-1" />,
        };
      case "PENDING":
        return {
          variant: "outline" as const,
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case "FAILED":
        return {
          variant: "destructive" as const,
          icon: <X className="h-3 w-3 mr-1" />,
        };
      case "OWING":
        return {
          variant: "destructive" as const,
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return { variant: "outline" as const, icon: null };
    }
  };

  // Get transaction type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CREDIT":
        return {
          variant: "default" as const,
          icon: <ArrowDown className="h-3 w-3 mr-1" />,
        };
      case "DEBIT":
        return {
          variant: "destructive" as const,
          icon: <ArrowUp className="h-3 w-3 mr-1" />,
        };
      default:
        return { variant: "outline" as const, icon: null };
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!vehicle.transactions) return [];

    return vehicle.transactions
      .filter((transaction) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          transaction.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.transactionReference
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.paymentType
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        // Type filter
        const matchesType =
          typeFilter === "ALL" || transaction.type === typeFilter;

        // Status filter
        const matchesStatus =
          statusFilter === "ALL" || transaction.status === statusFilter;

        // Payment type filter
        const matchesPaymentType =
          paymentTypeFilter === "ALL" ||
          transaction.paymentType === paymentTypeFilter;

        return (
          matchesSearch && matchesType && matchesStatus && matchesPaymentType
        );
      })
      .sort((a, b) => {
        if (sortField === "date") {
          const dateA = new Date(a.transactionDate || a.createdAt).getTime();
          const dateB = new Date(b.transactionDate || b.createdAt).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortField === "amount") {
          const amountA = Number.parseFloat(a.amount || "0");
          const amountB = Number.parseFloat(b.amount || "0");
          return sortDirection === "asc"
            ? amountA - amountB
            : amountB - amountA;
        } else if (sortField === "type") {
          return sortDirection === "asc"
            ? (a.type || "").localeCompare(b.type || "")
            : (b.type || "").localeCompare(a.type || "");
        } else if (sortField === "status") {
          return sortDirection === "asc"
            ? (a.status || "").localeCompare(b.status || "")
            : (b.status || "").localeCompare(a.status || "");
        }
        return 0;
      });
  }, [
    vehicle.transactions,
    searchQuery,
    sortField,
    sortDirection,
    typeFilter,
    statusFilter,
    paymentTypeFilter,
  ]);

  // console.log({ filteredTransactions });
  // Calculate transaction statistics
  const stats = useMemo(() => {
    if (!vehicle.transactions) {
      return {
        totalTransactions: 0,
        totalCredit: 0,
        totalDebit: 0,
        totalOwing: 0,
        successCount: 0,
      };
    }

    return vehicle.transactions.reduce(
      (acc, transaction) => {
        acc.totalTransactions += 1;

        const amount = Number.parseFloat(transaction.amount || "0");

        if (transaction.type === "CREDIT") {
          acc.totalCredit += amount;
        } else if (transaction.type === "DEBIT") {
          acc.totalDebit += amount;
        }

        if (transaction.status === "OWING") {
          acc.totalOwing += amount;
        }

        if (transaction.status === "SUCCESS") {
          acc.successCount += 1;
        }

        return acc;
      },
      {
        totalTransactions: 0,
        totalCredit: 0,
        totalDebit: 0,
        totalOwing: 0,
        successCount: 0,
      }
    );
  }, [vehicle.transactions]);

  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Parse sender information
  const parseSender = (senderJson: string | null) => {
    if (!senderJson) return null;
    try {
      const sender = JSON.parse(senderJson);
      return sender;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Total Transactions
              </span>
              <span className="text-2xl font-bold">
                {stats.totalTransactions}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {stats.successCount} successful
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Total Credit
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(stats.totalCredit.toString()))}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Payments received
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Debit</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(Number(stats.totalDebit.toString()))}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Payments made
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Amount Owing
              </span>
              <span className="text-2xl font-bold text-amber-600">
                {formatCurrency(Number(stats.totalOwing.toString()))}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Pending payments
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Complete transaction history for this vehicle
          </CardDescription>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="font-medium">
                    Transaction Type
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter === "ALL"}
                    onCheckedChange={() => setTypeFilter("ALL")}
                  >
                    All Types
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter === "CREDIT"}
                    onCheckedChange={() => setTypeFilter("CREDIT")}
                  >
                    Credit
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter === "DEBIT"}
                    onCheckedChange={() => setTypeFilter("DEBIT")}
                  >
                    Debit
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="font-medium">
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === "ALL"}
                    onCheckedChange={() => setStatusFilter("ALL")}
                  >
                    All Statuses
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === "SUCCESS"}
                    onCheckedChange={() => setStatusFilter("SUCCESS")}
                  >
                    Successful
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === "PENDING"}
                    onCheckedChange={() => setStatusFilter("PENDING")}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === "FAILED"}
                    onCheckedChange={() => setStatusFilter("FAILED")}
                  >
                    Failed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === "OWING"}
                    onCheckedChange={() => setStatusFilter("OWING")}
                  >
                    Owing
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="font-medium">
                    Payment Type
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentTypeFilter === "ALL"}
                    onCheckedChange={() => setPaymentTypeFilter("ALL")}
                  >
                    All Payment Types
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentTypeFilter === "CVOF"}
                    onCheckedChange={() => setPaymentTypeFilter("CVOF")}
                  >
                    CVOF
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentTypeFilter === "FAREFLEX"}
                    onCheckedChange={() => setPaymentTypeFilter("FAREFLEX")}
                  >
                    FareFlex
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentTypeFilter === "ISCE"}
                    onCheckedChange={() => setPaymentTypeFilter("ISCE")}
                  >
                    ISCE
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <ArrowDownUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => toggleSort("date")}
                    className="flex justify-between"
                  >
                    Date
                    {sortField === "date" && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleSort("amount")}
                    className="flex justify-between"
                  >
                    Amount
                    {sortField === "amount" && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleSort("type")}
                    className="flex justify-between"
                  >
                    Type
                    {sortField === "type" && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleSort("status")}
                    className="flex justify-between"
                  >
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const statusBadge = getStatusBadge(transaction.status);
                const typeBadge = getTypeBadge(transaction.type);
                const sender = parseSender(transaction.sender);

                return (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {transaction.description ||
                              transaction.transactionType?.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant={typeBadge.variant}
                            className="flex items-center"
                          >
                            {typeBadge.icon}
                            {transaction.type}
                          </Badge>
                          <Badge
                            variant={statusBadge.variant}
                            className="flex items-center"
                          >
                            {statusBadge.icon}
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.transactionDate)}
                          </span>
                          <span>Ref: {transaction.transactionReference}</span>
                          {transaction.paymentType && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.paymentType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-lg font-semibold ${
                            transaction.type === "CREDIT"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "CREDIT" ? "+" : "-"}
                          {formatCurrency(Number(transaction.amount))}
                        </span>
                        {transaction.paymentDate &&
                          transaction.paymentDate !==
                            transaction.transactionDate && (
                            <span className="text-xs text-muted-foreground">
                              Payment date:{" "}
                              {formatDate(transaction.paymentDate)}
                            </span>
                          )}
                      </div>
                    </div>

                    {(sender ||
                      transaction.transactionType ||
                      transaction.walletBefore ||
                      transaction.walletAfter) && (
                      <>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          {sender && (
                            <div>
                              <span className="text-muted-foreground">
                                Sender:{" "}
                              </span>
                              <span>
                                {sender.sourceAccountName} (
                                {sender.sourceAccountNumber})
                              </span>
                            </div>
                          )}
                          {transaction.transactionType && (
                            <div>
                              <span className="text-muted-foreground">
                                Transaction Type:{" "}
                              </span>
                              <span>
                                {transaction.transactionType.replace(/_/g, " ")}
                              </span>
                            </div>
                          )}
                          {(transaction.walletBefore ||
                            transaction.walletAfter) && (
                            <div>
                              <span className="text-muted-foreground">
                                Wallet:{" "}
                              </span>
                              <span>
                                {transaction.walletBefore &&
                                  `${formatCurrency(
                                    Number(transaction.walletBefore)
                                  )} → `}
                                {transaction.walletAfter &&
                                  formatCurrency(
                                    Number(transaction.walletAfter)
                                  )}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              {(searchQuery ||
                typeFilter !== "ALL" ||
                statusFilter !== "ALL" ||
                paymentTypeFilter !== "ALL") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("ALL");
                    setStatusFilter("ALL");
                    setPaymentTypeFilter("ALL");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
