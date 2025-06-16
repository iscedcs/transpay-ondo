import { Suspense } from "react";
import { Plus, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getUsers } from "@/actions/users";
import { UsersContent } from "@/components/users-content";
import { UsersStats } from "@/components/users-stats";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export const metadata = {
  title: "Users Management",
  description: "Manage and view all users in the system",
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await searchParams;
  // Parse search params with defaults
  const search = resolvedSearchParams.search || "";
  const role = resolvedSearchParams.role || "all";
  const status = resolvedSearchParams.status || "all";
  const page = Number.parseInt(resolvedSearchParams.page || "1");
  const limit = Number.parseInt(resolvedSearchParams.limit || "10");
  const offset = (page - 1) * limit;

  // Fetch users data on the server
  const params: any = { limit, offset };
  if (role && role !== "all") {
    params.role = role;
  }

  const usersResult = await getUsers(params);

  return (
    <div className="mx-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage and view all users in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link
            href="/users/add"
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex items-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<UsersStatsSkeleton />}>
        <UsersStats
          users={usersResult.success ? usersResult.data.users : []}
          totalCount={usersResult.success ? usersResult.data.count : 0}
        />
      </Suspense>

      {/* Main Content */}
      <Suspense fallback={<UsersContentSkeleton />}>
        <UsersContent
          initialUsers={usersResult.success ? usersResult.data.users : []}
          initialTotalCount={usersResult.success ? usersResult.data.count : 0}
          initialError={usersResult.success ? null : usersResult.message}
          searchParams={{
            search,
            role,
            status,
            page,
            limit,
            offset,
          }}
        />
      </Suspense>
    </div>
  );
}

// Loading skeletons
function UsersStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersContentSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific users or filter by role and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
