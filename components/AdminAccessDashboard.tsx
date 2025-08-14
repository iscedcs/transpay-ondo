"use client"
import { Separator } from "@/components/ui/separator";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import RevenueAmountCardNew from "./role/super-admin/revenue-amount-card";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getPaymentTotals } from "@/actions/payment-notification";
import MaxWidthWrapper from "./layout/max-width-wrapper";
import { getVehicles } from "@/actions/vehicles";
import { allUsers } from "@/actions/users";
import LivePaymentNotificationsAdminAccess from "@/(admin-access)/admin-access/live-payments";

export const AdminAccessDashboard = () => {
  const [paymentTotals, setPaymentTotals] = useState<{
    allTimeTotal: number;
    yearToDateTotal: number;
    monthToDateTotal: number;
    weekToDateTotal: number;
    dayToDateTotal: number;
} | null>(null); 
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [vehicleCount, setVehicleCount] = useState<number | null>(null);
const [adminCount, setAdminCount] = useState<number | null>(null);
const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadPaymentTotals() {
      try {
        const data = await getPaymentTotals({ revenueType: "CVOF" });
        const allVehicle = await getVehicles();
        const allAgents = await allUsers({});
        const allAdmins = await allUsers({ role: "ADMIN" });

        if (!data || typeof data !== "object") {
          throw new Error("Invalid payment totals data");
        }
        if (!allVehicle || typeof allVehicle !== "object") {
          throw new Error("Invalid vehicle data");
        }
        if (!allAgents || typeof allAgents !== "object") {
          throw new Error("Invalid agents data");
        }
        if (!allAdmins || typeof allAdmins !== "object") {
          throw new Error("Invalid admins data");
        }

        setVehicleCount(allVehicle?.pagination?.totalCount ?? 0);
        setAdminCount(allAdmins?.success?.totalUsers ?? 0);
        setAgentCount(allAgents?.success?.totalUsers ?? 0);
        setPaymentTotals(data as any);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load payment totals");
        setIsLoading(false);
      }
    }

    loadPaymentTotals();
  }, []);

  if (isLoading || !paymentTotals) {
    return (
        <MaxWidthWrapper className="p-5">
            <div>Loading...</div>
        </MaxWidthWrapper>
    );
}

  if (error) {
    return (
      <MaxWidthWrapper>
        <div>Error: {error}</div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="p-5">
            <div className="grid mt-[10px] grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                <Suspense
                    fallback={
                        <Skeleton className="flex h-24 w-full flex-col justify-between rounded-2xl bg-secondary p-3 shadow-md" />
                    }
                >
                    <RevenueAmountCardNew
                        link="#"
                        type={"TOTAL"}
                        title={`All Time Revenue`}
                        desc={"All time"}
                        total={Number(paymentTotals.allTimeTotal)}
                    />
                    <RevenueAmountCardNew
                        link="#"
                        type={"YEAR"}
                        title="Year Till Date Revenue"
                        desc={"Year till date"}
                        total={Number(paymentTotals.yearToDateTotal)}
                    />
                    <RevenueAmountCardNew
                        link="#"
                        type={"MONTH"}
                        title={`Month Till Date Revenue`}
                        desc={"Month till date"}
                        total={Number(paymentTotals.monthToDateTotal)}
                    />
                    <RevenueAmountCardNew
                        link="#"
                        type={"WEEK"}
                        title={`Week Till Date Revenue`}
                        desc={"Week till date"}
                        total={Number(paymentTotals.weekToDateTotal)}
                    />
                    <RevenueAmountCardNew
                        link="#"
                        type={"DAY"}
                        title={`Day Till Date Revenue`}
                        desc={"Day till date"}
                        total={Number(paymentTotals.dayToDateTotal)}
                    />
                </Suspense>
            </div>
            <Separator className="my-5" />
            <div className="grid grid-cols-1 mt-[20px] gap-5">
                <Link href={"#"}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicles</CardTitle>
                            <CardDescription>Summary of vehicle details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 px-2 py-4">
                            <div className="pointer-events-none relative grid gap-2 rounded-md border border-primary bg-secondary p-2">
                                <p className="font-bold leading-none">Total</p>
                                <p className="text-2xl text-muted-foreground">
                                    {vehicleCount ?? 0}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            <Separator className="my-5" />
            <LivePaymentNotificationsAdminAccess />
        </MaxWidthWrapper>
  );
};