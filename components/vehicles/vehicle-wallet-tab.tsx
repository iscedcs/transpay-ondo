import type React from "react";
import { Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Vehicle } from "@/actions/vehicles";
import { formatCurrency } from "@/lib/utils";
import { GenerateAccountModal } from "../generate-account-modal";

interface VehicleWalletTabProps {
  vehicle: Vehicle;
}

export default function VehicleWalletTab({ vehicle }: VehicleWalletTabProps) {
  if (!vehicle.wallet) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No wallet information available for this vehicle
          </p>
        </CardContent>
      </Card>
    );
  }

  const wallet = vehicle.wallet;
  const hasAccount = wallet.accounts && wallet.accounts.length > 0;
  const account = hasAccount ? wallet.accounts[0] : null;

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Details
        </CardTitle>
        <CardDescription>
          Financial information and transaction details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(Number(wallet.walletBalance))}
            </p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Amount Owed</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(Number(wallet.amountOwed))}
            </p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Net Total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(wallet.netTotal))}
            </p>
          </div>
        </div>

        <Separator />

        {/* Service Balances */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Service Balances</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                CVOF Balance
              </Label>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(wallet.cvofBalance))}
              </p>
              <p className="text-sm text-red-600">
                Owing: {formatCurrency(Number(wallet.cvofOwing))}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                FareFlex Balance
              </Label>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(wallet.fareflexBalance))}
              </p>
              <p className="text-sm text-red-600">
                Owing: {formatCurrency(Number(wallet.fareflexOwing))}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                ISCE Balance
              </Label>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(wallet.isceBalance))}
              </p>
              <p className="text-sm text-red-600">
                Owing: {formatCurrency(Number(wallet.isceOwing))}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Account Details</h4>
            {!hasAccount && (
              <GenerateAccountModal walletId={vehicle.wallet.id} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Wallet ID
              </Label>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {wallet.id}
              </p>
            </div>

            {account && hasAccount ? (
              <>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Number
                  </Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                      {account.accountNumber}
                    </p>
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Name
                  </Label>
                  <p className="text-sm">{account.accountName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Bank
                  </Label>
                  <p className="text-sm">{account.bankName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Type
                  </Label>
                  <p className="text-sm">{account.accountType}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reference
                  </Label>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {account.reference}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Creation Date
                  </Label>
                  <p className="text-sm">{account.creationDate}</p>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Number
                </Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">
                    Not generated
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Last Transaction
              </Label>
              <p className="text-sm">
                {formatDate(wallet.lastTransactionDate)}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Next Transaction
              </Label>
              <p className="text-sm">
                {formatDate(wallet.nextTransactionDate)}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Created
              </Label>
              <p className="text-sm">{formatDate(wallet.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </Label>
              <p className="text-sm">{formatDate(wallet.updatedAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
