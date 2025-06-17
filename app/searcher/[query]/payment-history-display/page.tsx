import PaymentHistoryUsingController from "@/components/pages/vehicle/payment-history-using-controller";
import { Button } from "@/components/ui/button";
import { getVehicleByPlateNumber } from "@/lib/controllers/vehicle-controller";
import { ArrowBigLeftDashIcon } from "lucide-react";
import Link from "next/link";

export default async function PaymentHistoryDisplay({ params }: { params: Promise<{ query: string }>; }) {
     const { query } = await params;
     const vehicle = await getVehicleByPlateNumber(query);
     return (
          <div className="mx-auto max-w-4xl pt-[60px]">
               <div className="flex items-center justify-between py-[10px]">
                    <h1 className="mb-[10px] text-[20px] font-bold">Payment History</h1>
                    <Button asChild>
                         <Link href="/search">
                              <ArrowBigLeftDashIcon /> Go back
                         </Link>
                    </Button>
               </div>
               <PaymentHistoryUsingController vehicleId={vehicle!.id} />
               {/* <PaymentHistory hasMore={false} page={Number(page || "1")} pageSize={Number(pagesize || "10")} hasPagination filter={{ plateNumber: vehicle?.plateNumber, tcode: vehicle?.tCode }} /> */}
          </div>
     );
}
