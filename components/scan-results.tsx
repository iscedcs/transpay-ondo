"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  User,
  Car,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Currency,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface ScanResultsProps {
  scanResult: any
}

export function ScanResults({ scanResult }: ScanResultsProps) {
  const { scan, vehicle, agent, charged } = scanResult.data

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(num)
  }

  // Calculate financial status
  const getFinancialStatus = () => {
    const walletBalance = Number.parseFloat(vehicle.wallet?.walletBalance || "0")
    const amountOwed = Number.parseFloat(vehicle.wallet?.amountOwed || "0")
    const cvofOwing = Number.parseFloat(vehicle.wallet?.cvofOwing || "0")
    const fareflexOwing = Number.parseFloat(vehicle.wallet?.fareflexOwing || "0")
    const isceOwing = Number.parseFloat(vehicle.wallet?.isceOwing || "0")

    const totalOwing = amountOwed + cvofOwing + fareflexOwing + isceOwing
    const isOwing = walletBalance < 0 || totalOwing > 0

    return {
      walletBalance,
      totalOwing,
      isOwing,
      netPosition: walletBalance - totalOwing,
    }
  }

  const financialStatus = getFinancialStatus()

  // Calculate transaction summary
  const getTransactionSummary = () => {
    if (!vehicle.transactions || vehicle.transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        totalOwing: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      }
    }

    const summary = vehicle.transactions.reduce(
      (acc: any, transaction: any) => {
        const amount = Number.parseFloat(transaction.amount || "0")
        acc.totalTransactions++

        if (transaction.type === "CREDIT") {
          acc.totalCredits += amount
        } else if (transaction.type === "DEBIT") {
          acc.totalDebits += amount
        }

        if (transaction.status === "OWING") {
          acc.totalOwing += amount
        }

        switch (transaction.status) {
          case "SUCCESS":
            acc.successfulTransactions++
            break
          case "PENDING":
          case "OWING":
            acc.pendingTransactions++
            break
          case "FAILED":
            acc.failedTransactions++
            break
        }

        return acc
      },
      {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        totalOwing: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      },
    )

    return summary
  }

  const transactionSummary = getTransactionSummary()

  const getComplianceStatus = () => {
    if (vehicle.blacklisted) {
      return {
        status: "BLACKLISTED",
        color: "destructive",
        bgColor: "bg-red-100 border-red-200",
        textColor: "text-red-800",
        icon: XCircle,
      }
    }

    if (vehicle.status !== "ACTIVE") {
      return {
        status: "INACTIVE",
        color: "secondary",
        bgColor: "bg-gray-100 border-gray-200",
        textColor: "text-gray-800",
        icon: AlertTriangle,
      }
    }

    if (transactionSummary.totalOwing > 0) {
      return {
        status: "OWING",
        color: "destructive",
        bgColor: "bg-red-100 border-red-200",
        textColor: "text-red-800",
        icon: CreditCard,
      }
    }

    if (charged.total > 0) {
      return {
        status: "CHARGED",
        color: "default",
        bgColor: "bg-yellow-100 border-yellow-200",
        textColor: "text-yellow-800",
        icon: CreditCard,
      }
    }

    return {
      status: "COMPLIANT",
      color: "default",
      bgColor: "bg-green-100 border-green-200",
      textColor: "text-green-800",
      icon: CheckCircle,
    }
  }

  const compliance = getComplianceStatus()
  const ComplianceIcon = compliance.icon

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      {/* <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">Scan Complete</CardTitle>
                <p className="text-sm sm:text-base text-gray-600">Vehicle compliance check results</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="self-start sm:self-auto bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </div>
        </CardHeader>
      </Card> */}

      {/* Compliance Status - Enhanced with Financial Status */}
      <Card className={`border-2 ${compliance.bgColor}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`p-3 sm:p-4 rounded-full ${compliance.bgColor}`}>
                <ComplianceIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${compliance.textColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-lg sm:text-2xl font-bold ${compliance.textColor} break-words`}>
                  {compliance.status === "COMPLIANT" && "Vehicle Compliant"}
                  {compliance.status === "BLACKLISTED" && "Vehicle Blacklisted"}
                  {compliance.status === "OWING" && "Payment Required"}
                  {compliance.status === "CHARGED" && "Charges Applied"}
                  {compliance.status === "INACTIVE" && "Vehicle Inactive"}
                </h3>
                <p className={`text-sm sm:text-lg ${compliance.textColor.replace("800", "700")} break-words`}>
                  {compliance.status === "OWING" && `Amount Owed: ${formatCurrency(transactionSummary.totalOwing)}`}
                  {compliance.status === "COMPLIANT" && "All payments up to date"}
                  {compliance.status === "BLACKLISTED" && "Vehicle is blacklisted"}
                  {compliance.status === "CHARGED" && scanResult.message}
                  {compliance.status === "INACTIVE" && "Vehicle status is inactive"}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between sm:flex-col sm:text-right">
              <Badge
                variant={compliance.color as any}
                className="text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 mb-0 sm:mb-2"
              >
                {compliance.status}
              </Badge>
              {financialStatus.isOwing && (
                <div className={`text-lg sm:text-2xl font-bold ${compliance.textColor}`}>
                  {formatCurrency(financialStatus.totalOwing)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className={financialStatus.walletBalance >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Wallet Balance</p>
                <p
                  className={`text-lg sm:text-2xl font-bold break-words ${
                    financialStatus.walletBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(financialStatus.walletBalance)}
                </p>
              </div>
              {financialStatus.walletBalance >= 0 ? (
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 ml-2" />
              ) : (
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 ml-2" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={transactionSummary.totalOwing === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Owing</p>
                <p
                  className={`text-lg sm:text-2xl font-bold break-words ${
                    transactionSummary.totalOwing === 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(transactionSummary.totalOwing)}
                </p>
              </div>
              <CreditCard
                className={`h-6 w-6 sm:h-8 sm:w-8 ml-2 ${
                  transactionSummary.totalOwing === 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={financialStatus.netPosition >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Position</p>
                <p
                  className={`text-lg sm:text-2xl font-bold break-words ${
                    financialStatus.netPosition >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(financialStatus.netPosition)}
                </p>
              </div>
              <Currency
                className={`h-6 w-6 sm:h-8 sm:w-8 ml-2 ${
                  financialStatus.netPosition >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Transaction Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{transactionSummary.totalTransactions}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-lg font-bold text-green-600 break-words">
                {formatCurrency(transactionSummary.totalCredits)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Total Credits</p>
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-lg font-bold text-red-600 break-words">
                {formatCurrency(transactionSummary.totalDebits)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Total Debits</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {transactionSummary.successfulTransactions}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{transactionSummary.pendingTransactions}</p>
              <p className="text-xs sm:text-sm text-gray-600">Pending/Owing</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-red-600">{transactionSummary.failedTransactions}</p>
              <p className="text-xs sm:text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Wallet Information */}
      {vehicle.wallet && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Currency className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Wallet Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Balances</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Balance</span>
                    <span className="font-medium text-xs sm:text-sm break-words">
                      {formatCurrency(vehicle.wallet.cvofBalance)}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">FareFlex Balance</span>
                    <span className="font-medium text-xs sm:text-sm break-words">
                      {formatCurrency(vehicle.wallet.fareflexBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">ISCE Balance</span>
                    <span className="font-medium text-xs sm:text-sm break-words">
                      {formatCurrency(vehicle.wallet.isceBalance)}
                    </span>
                  </div> */}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Outstanding Amount</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Owing</span>
                    <span
                      className={`font-medium text-xs sm:text-sm break-words ${
                        Number.parseFloat(transactionSummary.totalOwing) > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(transactionSummary.totalOwing)}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">FareFlex Owing</span>
                    <span
                      className={`font-medium text-xs sm:text-sm break-words ${
                        Number.parseFloat(vehicle.wallet.fareflexOwing) > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(vehicle.wallet.fareflexOwing)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">ISCE Owing</span>
                    <span
                      className={`font-medium text-xs sm:text-sm break-words ${
                        Number.parseFloat(vehicle.wallet.isceOwing) > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(vehicle.wallet.isceOwing)}
                    </span>
                  </div> */}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Transaction Dates</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Last Transaction</span>
                    <p className="font-medium text-xs sm:text-sm">
                      {vehicle.wallet.lastTransactionDate
                        ? formatDistanceToNow(new Date(vehicle.wallet.lastTransactionDate), { addSuffix: true })
                        : "No transactions"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Next Transaction</span>
                    <p className="font-medium text-xs sm:text-sm">
                      {vehicle.wallet.nextTransactionDate
                        ? formatDistanceToNow(new Date(vehicle.wallet.nextTransactionDate), { addSuffix: true })
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {vehicle.image && (
                <Image
                  src={vehicle.image || "/placeholder.svg"}
                  alt="Vehicle"
                  height={64}
                  width={64}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-base sm:text-lg break-words">{vehicle.plateNumber}</h4>
                <p className="text-sm sm:text-base text-gray-600">{vehicle.type}</p>
                <Badge variant="outline" className="mt-1">
                  {vehicle.color}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">State Code</p>
                <p className="font-medium break-words">{vehicle.stateCode}</p>
              </div>
              <div>
                <p className="text-gray-600">V-Code</p>
                <p className="font-medium break-words">{vehicle.vCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium break-words">{vehicle.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge variant={vehicle.status === "ACTIVE" ? "default" : "secondary"} className="mt-1">
                  {vehicle.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Owner Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-base sm:text-lg break-words">
                {vehicle.owner.firstName} {vehicle.owner.lastName}
              </h4>
              <p className="text-sm sm:text-base text-gray-600 break-words">{vehicle.owner.email}</p>
              <p className="text-sm sm:text-base text-gray-600 break-words">{vehicle.owner.phone}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium break-words">{vehicle.owner.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge variant={vehicle.owner.status === "ACTIVE" ? "default" : "secondary"} className="mt-1">
                  {vehicle.owner.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium break-words">{vehicle.owner.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Blacklisted</p>
                <Badge variant={vehicle.owner.blacklisted ? "destructive" : "default"} className="mt-1">
                  {vehicle.owner.blacklisted ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Scan Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Location</h4>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Lat: {scan.latitude.toFixed(6)}</p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Lng: {scan.longitude.toFixed(6)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Agent</h4>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {agent.firstName} {agent.lastName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">{agent.role}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Scan Time</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                {formatDistanceToNow(new Date(scan.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {new Date(scan.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges */}
      {charged.total > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Charges Applied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Base Fee</span>
                <span className="font-medium text-sm sm:text-base break-words">{formatCurrency(charged.base)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">LGA Fee</span>
                <span className="font-medium text-sm sm:text-base break-words">{formatCurrency(charged.lga)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
                <span>Total Charged</span>
                <span className="break-words">{formatCurrency(charged.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
