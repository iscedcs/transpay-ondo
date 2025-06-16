import { getTransactionSummary } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Banknote } from "lucide-react";

export async function TransactionsSummary() {
  const data = await getTransactionSummary();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Transactions
        </CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(data.totalAmount)}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.totalCount} transactions
        </p>
      </CardContent>
    </Card>
  );
}
