"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { API, URLS } from "@/lib/const";

export default function FundingModal({
  vehicle,
  onClose,
}: {
  vehicle: any;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [amount, setAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<any>(null);

  const handleFund = async () => {
    if (!amount) return toast.error("Enter amount");

    setIsFunding(true);
    try {
      const fundRes = await axios.post(
        `${API}${URLS.agency_agent.fund}`,
        { vehicleId: vehicle.id, vehicleOwnerAmount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tnxData = fundRes.data?.data;
      const txnId = tnxData.agencyTransaction?.id;

      if (txnId) {
        toast.success("Funding initiated successfully!");
        setTransactionSummary(tnxData); // show summary instead of modal

        await axios.post(
          `${API}${URLS.agency_agent.payment}`,
          {
            agencyTransactionId: txnId,
            paymentReference: `PAY_REF_${Date.now()}`,
            status: "PENDING",
            failureReason: "",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Payment initialized for ₦${amount}`, {
          description: `Transaction Ref: ${tnxData.paymentDetails.transactionReference}`,
        });
      } else {
        toast.error("Funding response missing transaction ID");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Funding failed", {
        description: err?.response?.data?.message || "Try again later.",
      });
    } finally {
      setIsFunding(false);
    }
  };

  if (transactionSummary) {
    return (
      <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg border border-primary/20 bg-card shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">
                Transaction Summary
              </CardTitle>
              <CardDescription>
                Review transaction details for confirmation
              </CardDescription>
            </div>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">
                {transactionSummary.agencyTransaction.vehicle.plateNumber} (
                {transactionSummary.agencyTransaction.vehicle.vCode})
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Transaction Ref</p>
              <p className="font-semibold">
                {transactionSummary.agencyTransaction.transactionReference}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="font-semibold">
                ₦
                {Number(
                  transactionSummary.paymentDetails.agentPaidAmount
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="font-semibold">
                ₦
                {Number(
                  transactionSummary.paymentDetails.agentCommission
                ).toLocaleString()}{" "}
                ({transactionSummary.paymentDetails.discountPercentage}%)
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  transactionSummary.paymentDetails.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : transactionSummary.paymentDetails.status === "SUCCESS"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {transactionSummary.paymentDetails.status}
              </span>
            </div>
          </CardContent>

          <div className="flex justify-end gap-2 px-6 pb-4">
            <Button
              variant="outline"
              onClick={() => setTransactionSummary(null)}>
              Fund Vehicle Again
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </Card>
      </div>
    );
  }

  // 🧾 Funding Modal (default view)
  return (
    <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Initiate Funding</CardTitle>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2 text-muted-foreground">
            Vehicle: <strong>{vehicle?.plateNumber}</strong>
          </p>

          <Input
            placeholder="Enter Amount (₦)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleFund} disabled={isFunding}>
              {isFunding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Fund Vehicle"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
