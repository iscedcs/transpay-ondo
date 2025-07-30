// app/scan/[qrid]/page.tsx
import { getVehicleByBarcode } from "@/actions/scan";
import { getStickerByCode } from "@/actions/stickers";
import { auth } from "@/auth";
import { AuthenticatedScanWrapper } from "@/components/authenticated-scan-wrapper";
import CounterfeitError from "@/components/counterfeit-error";
import { PublicVehicleView } from "@/components/public-vehicle-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UnattachedSticker from "@/components/unattached-sticker";
import { isValidMillisecondTimestamp } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function QRPage({
  params,
}: {
  params: Promise<{ qrid: string }>;
}) {
  const qrid = (await params).qrid;

  if (!isValidMillisecondTimestamp(qrid)) notFound();

  const sticker = await (await getStickerByCode(qrid)).data;
  if (!sticker) return <CounterfeitError qrid={qrid} />;
  if (!sticker.isUsed) return <UnattachedSticker sticker={sticker} />;

  const session = await auth();
  const user = session?.user;

  if (user?.id) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <AuthenticatedScanWrapper qrid={qrid} user={user} />
      </Suspense>
    );
  }

  const result = await getVehicleByBarcode(qrid);
  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <p>No matching vehicle found for this QR code</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <PublicVehicleView vehicle={result.data} qrId={qrid} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
