import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { AddIPDialog } from "@/components/ip-whitelist/add-ip-dialog";
import { IPListTable } from "@/components/ip-whitelist/ip-list-table";
import { getAllWhitelistedIPs } from "@/actions/ip-whitelist";

async function IPWhitelistContent() {
  const result = await getAllWhitelistedIPs();

  if (!result.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive">
              Error loading whitelisted IPs: {result.error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Whitelist Management
          </CardTitle>
          <CardDescription>
            Manage IP addresses that are allowed to access the system. Only
            whitelisted IPs can connect to your application.
          </CardDescription>
        </div>
        <AddIPDialog />
      </CardHeader>
      <CardContent>
        <IPListTable ips={result.data} />
      </CardContent>
    </Card>
  );
}

function IPWhitelistSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IPWhitelistPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IP Whitelist</h1>
          <p className="text-muted-foreground">
            Control which IP addresses can access your system by managing the
            whitelist.
          </p>
        </div>

        <Suspense fallback={<IPWhitelistSkeleton />}>
          <IPWhitelistContent />
        </Suspense>
      </div>
    </div>
  );
}
