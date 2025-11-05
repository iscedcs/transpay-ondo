"use client";

import { TransactionsTable } from "@/components/agency/transactions-table";
import { useParams } from "next/navigation";

export default function AgencyTransactionsPage() {
  const { id } = useParams();
  const agencyId = Array.isArray(id) ? id[0] : id;

  return (
    <div className="px-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Agency Transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage all transactions under this agency.
        </p>
      </div>

      <TransactionsTable agencyId={agencyId || ""} />
    </div>
  );
}
