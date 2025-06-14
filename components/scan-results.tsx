"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  User,
  Car,
  CreditCard,
  Shield,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface ScanResultsProps {
  scanResult: any;
  qrId: string;
}

export function ScanResults({ scanResult, qrId }: ScanResultsProps) {
  const { scan, vehicle, agent, charged } = scanResult;

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(num);
  };

  // Calculate financial status
  const getFinancialStatus = () => {
    const walletBalance = Number.parseFloat(
      vehicle.wallet?.walletBalance || "0"
    );
    const amountOwed = Number.parseFloat(vehicle.wallet?.amountOwed || "0");
    const cvofOwing = Number.parseFloat(vehicle.wallet?.cvofOwing || "0");
    const fareflexOwing = Number.parseFloat(
      vehicle.wallet?.fareflexOwing || "0"
    );
    const isceOwing = Number.parseFloat(vehicle.wallet?.isceOwing || "0");

    const totalOwing = amountOwed + cvofOwing + fareflexOwing + isceOwing;
    const isOwing = walletBalance < 0 || totalOwing > 0;

    return {
      walletBalance,
      totalOwing,
      isOwing,
      netPosition: walletBalance - totalOwing,
    };
  };

  const financialStatus = getFinancialStatus();

  const getComplianceStatus = () => {
    if (vehicle.blacklisted) {
      return {
        status: "BLACKLISTED",
        color: "destructive",
        bgColor: "bg-red-100 border-red-200",
        textColor: "text-red-800",
        icon: XCircle,
      };
    }
    if (vehicle.status !== "ACTIVE") {
      return {
        status: "INACTIVE",
        color: "secondary",
        bgColor: "bg-gray-100 border-gray-200",
        textColor: "text-gray-800",
        icon: AlertTriangle,
      };
    }
    if (financialStatus.isOwing) {
      return {
        status: "OWING",
        color: "destructive",
        bgColor: "bg-red-100 border-red-200",
        textColor: "text-red-800",
        icon: CreditCard,
      };
    }
    if (charged.total > 0) {
      return {
        status: "CHARGED",
        color: "default",
        bgColor: "bg-yellow-100 border-yellow-200",
        textColor: "text-yellow-800",
        icon: CreditCard,
      };
    }
    return {
      status: "COMPLIANT",
      color: "default",
      bgColor: "bg-green-100 border-green-200",
      textColor: "text-green-800",
      icon: CheckCircle,
    };
  };

  const compliance = getComplianceStatus();
  const ComplianceIcon = compliance.icon;

  // Calculate transaction summary
  const getTransactionSummary = () => {
    if (!vehicle.transactions || vehicle.transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      };
    }

    const summary = vehicle.transactions.reduce(
      (acc: any, transaction: any) => {
        const amount = Number.parseFloat(transaction.amount || "0");

        acc.totalTransactions++;

        if (transaction.type === "CREDIT") {
          acc.totalCredits += amount;
        } else if (transaction.type === "DEBIT") {
          acc.totalDebits += amount;
        }

        switch (transaction.status) {
          case "SUCCESS":
            acc.successfulTransactions++;
            break;
          case "PENDING":
          case "OWING":
            acc.pendingTransactions++;
            break;
          case "FAILED":
            acc.failedTransactions++;
            break;
        }

        return acc;
      },
      {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      }
    );

    return summary;
  };

  const transactionSummary = getTransactionSummary();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Scan Complete</CardTitle>
                <p className="text-gray-600">
                  Vehicle compliance check results
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Status - Enhanced with Financial Status */}
      <Card className={`border-2 ${compliance.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${compliance.bgColor}`}>
                <ComplianceIcon
                  className={`h-10 w-10 ${compliance.textColor}`}
                />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${compliance.textColor}`}>
                  {compliance.status === "COMPLIANT" && "Vehicle Compliant"}
                  {compliance.status === "BLACKLISTED" && "Vehicle Blacklisted"}
                  {compliance.status === "OWING" && "Payment Required"}
                  {compliance.status === "CHARGED" && "Charges Applied"}
                  {compliance.status === "INACTIVE" && "Vehicle Inactive"}
                </h3>
                <p
                  className={`text-lg ${compliance.textColor.replace(
                    "800",
                    "700"
                  )}`}
                >
                  {compliance.status === "OWING" &&
                    `Amount Owed: ${formatCurrency(
                      financialStatus.totalOwing
                    )}`}
                  {compliance.status === "COMPLIANT" &&
                    "All payments up to date"}
                  {compliance.status === "BLACKLISTED" &&
                    "Vehicle is blacklisted"}
                  {compliance.status === "CHARGED" && scanResult.message}
                  {compliance.status === "INACTIVE" &&
                    "Vehicle status is inactive"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={compliance.color as any}
                className="text-lg px-4 py-2 mb-2"
              >
                {compliance.status}
              </Badge>
              {financialStatus.isOwing && (
                <div className={`text-2xl font-bold ${compliance.textColor}`}>
                  {formatCurrency(financialStatus.totalOwing)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={
            financialStatus.walletBalance >= 0
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Wallet Balance
                </p>
                <p
                  className={`text-2xl font-bold ${
                    financialStatus.walletBalance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(financialStatus.walletBalance)}
                </p>
              </div>
              {financialStatus.walletBalance >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            financialStatus.totalOwing === 0
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Owing</p>
                <p
                  className={`text-2xl font-bold ${
                    financialStatus.totalOwing === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(financialStatus.totalOwing)}
                </p>
              </div>
              <CreditCard
                className={`h-8 w-8 ${
                  financialStatus.totalOwing === 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            financialStatus.netPosition >= 0
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Net Position
                </p>
                <p
                  className={`text-2xl font-bold ${
                    financialStatus.netPosition >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(financialStatus.netPosition)}
                </p>
              </div>
              <DollarSign
                className={`h-8 w-8 ${
                  financialStatus.netPosition >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Transaction Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {transactionSummary.totalTransactions}
              </p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(transactionSummary.totalCredits)}
              </p>
              <p className="text-sm text-gray-600">Total Credits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(transactionSummary.totalDebits)}
              </p>
              <p className="text-sm text-gray-600">Total Debits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {transactionSummary.successfulTransactions}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {transactionSummary.pendingTransactions}
              </p>
              <p className="text-sm text-gray-600">Pending/Owing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {transactionSummary.failedTransactions}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Wallet Information */}
      {vehicle.wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Wallet Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Balances</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CVOF Balance</span>
                    <span className="font-medium">
                      {formatCurrency(vehicle.wallet.cvofBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      FareFlex Balance
                    </span>
                    <span className="font-medium">
                      {formatCurrency(vehicle.wallet.fareflexBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ISCE Balance</span>
                    <span className="font-medium">
                      {formatCurrency(vehicle.wallet.isceBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Outstanding Amounts
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CVOF Owing</span>
                    <span
                      className={`font-medium ${
                        Number.parseFloat(vehicle.wallet.cvofOwing) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(vehicle.wallet.cvofOwing)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      FareFlex Owing
                    </span>
                    <span
                      className={`font-medium ${
                        Number.parseFloat(vehicle.wallet.fareflexOwing) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(vehicle.wallet.fareflexOwing)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ISCE Owing</span>
                    <span
                      className={`font-medium ${
                        Number.parseFloat(vehicle.wallet.isceOwing) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(vehicle.wallet.isceOwing)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Transaction Dates
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">
                      Last Transaction
                    </span>
                    <p className="font-medium text-sm">
                      {vehicle.wallet.lastTransactionDate
                        ? formatDistanceToNow(
                            new Date(vehicle.wallet.lastTransactionDate),
                            { addSuffix: true }
                          )
                        : "No transactions"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Next Transaction
                    </span>
                    <p className="font-medium text-sm">
                      {vehicle.wallet.nextTransactionDate
                        ? formatDistanceToNow(
                            new Date(vehicle.wallet.nextTransactionDate),
                            { addSuffix: true }
                          )
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {vehicle.image && (
                <Image
                  src={vehicle.image || "/placeholder.svg"}
                  alt="Vehicle"
                  height={64}
                  width={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h4 className="font-semibold text-lg">{vehicle.plateNumber}</h4>
                <p className="text-gray-600">{vehicle.type}</p>
                <Badge variant="outline">{vehicle.color}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">State Code</p>
                <p className="font-medium">{vehicle.stateCode}</p>
              </div>
              <div>
                <p className="text-gray-600">V-Code</p>
                <p className="font-medium">{vehicle.vCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{vehicle.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge
                  variant={
                    vehicle.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {vehicle.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Owner Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">
                {vehicle.owner.firstName} {vehicle.owner.lastName}
              </h4>
              <p className="text-gray-600">{vehicle.owner.email}</p>
              <p className="text-gray-600">{vehicle.owner.phone}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium">{vehicle.owner.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge
                  variant={
                    vehicle.owner.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {vehicle.owner.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{vehicle.owner.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Blacklisted</p>
                <Badge
                  variant={
                    vehicle.owner.blacklisted ? "destructive" : "default"
                  }
                >
                  {vehicle.owner.blacklisted ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Scan Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <p className="text-sm text-gray-600">
                Lat: {scan.latitude.toFixed(6)}
              </p>
              <p className="text-sm text-gray-600">
                Lng: {scan.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Agent</h4>
              <p className="text-sm text-gray-600">
                {agent.firstName} {agent.lastName}
              </p>
              <p className="text-sm text-gray-600">{agent.role}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Scan Time</h4>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(scan.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(scan.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges */}
      {charged.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Charges Applied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Fee</span>
                <span className="font-medium">
                  {formatCurrency(charged.base)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>LGA Fee</span>
                <span className="font-medium">
                  {formatCurrency(charged.lga)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Charged</span>
                <span>{formatCurrency(charged.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
