import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateAccountModal } from "../generate-account-modal";
import { formatCurrency } from "@/lib/utils";

interface VehicleWalletSummaryProps {
  wallet: any; // Using any for now, should be properly typed
}

export default function VehicleWalletSummary({
  wallet,
}: VehicleWalletSummaryProps) {
  const hasAccount = wallet.accounts && wallet.accounts.length > 0;
  const account = hasAccount ? wallet.accounts[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(Number(wallet.walletBalance))}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount Owed:</span>
          <span className="font-semibold text-red-600">
            {formatCurrency(Number(wallet.amountOwed))}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Net Total:</span>
          <span className="font-semibold">
            {formatCurrency(Number(wallet.netTotal))}
          </span>
        </div>

        {hasAccount ? (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm">
                  {account.accountNumber}
                </span>
                <Badge variant="default" className="text-xs">
                  {account.bankName}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account:</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-orange-600">Not generated</span>
                <GenerateAccountModal walletId={wallet.id} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
