import { auth } from "@/auth";
import { StickerUpload } from "@/components/sticker-upload";
import { StickersContent } from "@/components/stickers-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAuthorized } from "@/lib/auth";
import { Role } from "@prisma/client";
import { Package, QrCode, Upload } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface SearchParams {
  tab?: string;
  page?: string;
  search?: string;
  status?: string;
}

interface StickersPageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: StickersPageProps) {
  const params = await searchParams;
  const title = params.tab
    ? `${params.tab} - Sticker Management`
    : "Sticker Management";
  return {
    title,
    description:
      "Manage vehicle stickers, upload barcodes, and track assignments",
  };
}

export default async function StickersPage({
  searchParams,
}: StickersPageProps) {
  const session = await auth();
  if (!isAuthorized(session?.user.role as Role, ["SUPERADMIN"])) {
    redirect("/unauthorized");
  }
  const params = await searchParams;
  const activeTab = params.tab || "stickers";

  return (
    <div className="mx-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sticker Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle stickers, upload barcodes, and track assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Stats Overview */}
      {/* <Suspense
        fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}
      >
        <StickerStats />
      </Suspense> */}

      {/* Main Content */}
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stickers" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Stickers
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Assign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stickers" className="space-y-6">
          <Suspense
            fallback={
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            }
          >
            <StickersContent searchParams={params} />
          </Suspense>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <StickerUpload />
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Stickers to Vehicles</CardTitle>
              <CardDescription>
                Attach available stickers to vehicles for tracking and
                identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-64 bg-muted animate-pulse rounded-lg" />
                }
              >
                <StickersContent searchParams={{ ...params, mode: "assign" }} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
