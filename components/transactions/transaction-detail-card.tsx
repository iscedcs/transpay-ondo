"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Calendar, MapPin, User, Hash, DollarSign, Smartphone, Building, Currency } from "lucide-react"
import { format } from "date-fns"
import type { Transaction } from "@/types/transactions"

interface TransactionDetailCardProps {
  transaction: Transaction
}

export function TransactionDetailCard({ transaction }: TransactionDetailCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Success
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      payment: "bg-blue-100 text-blue-800",
      fee: "bg-purple-100 text-purple-800",
      fine: "bg-red-100 text-red-800",
      route_fee: "bg-orange-100 text-orange-800",
      refund: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge variant="outline" className={typeColors[type as keyof typeof typeColors]}>
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "pos":
        return <CreditCard className="h-4 w-4" />
      case "wallet":
        return <Smartphone className="h-4 w-4" />
      case "bank_transfer":
        return <Building className="h-4 w-4" />
      case "cash":
        return <Currency className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const formatChannel = (channel: string) => {
    return channel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Transaction Details
          </CardTitle>
          {getStatusBadge(transaction.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reference</label>
              <p className="text-lg font-mono">{transaction.reference}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold text-green-600">{formatAmount(transaction.amount)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <div className="mt-1">{getTypeBadge(transaction.type)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{format(new Date(transaction.timestamp), "MMMM dd, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(transaction.timestamp), "HH:mm:ss")}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{transaction.lgaName}</p>
                  <p className="text-sm text-muted-foreground">{transaction.stateName} State</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Channel</label>
              <div className="flex items-center gap-2 mt-1">
                {getChannelIcon(transaction.channel)}
                <p className="font-medium">{formatChannel(transaction.channel)}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Vehicle Information */}
        <div>
          <h3 className="font-semibold mb-3">Vehicle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plate Number</label>
              <p className="font-mono text-lg">{transaction.vehiclePlateNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vehicle ID</label>
              <p className="font-mono text-sm text-muted-foreground">{transaction.vehicleId}</p>
            </div>
          </div>
        </div>

        {/* Collection Information */}
        {transaction.collectedBy && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Collection Information</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{transaction.collectedByName}</p>
                  <p className="text-sm text-muted-foreground">Agent ID: {transaction.collectedBy}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Description */}
        {transaction.description && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1">{transaction.description}</p>
            </div>
          </>
        )}

        {/* Metadata */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="space-y-2">
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{key.replace("_", " ")}:</span>
                    <span className="text-sm font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
