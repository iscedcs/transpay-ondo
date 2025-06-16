import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUsers } from "@/actions/users";
import { UsersByRoleContent } from "@/components/users-by-role-content";
import { RoleStatsCards } from "@/components/role-stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

// Valid user roles from Prisma enum
const VALID_ROLES: Role[] = [
  Role.ADMIN,
  Role.EIRS_ADMIN,
  Role.EIRS_AGENT,
  Role.LGA_ADMIN,
  Role.LGA_AGENT,
  Role.LGA_C_AGENT,
  Role.SUPERADMIN,
  Role.VEHICLE_OWNER,
] as const;
type UserRole = Role;

interface PageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Role display names and descriptions
const ROLE_INFO = {
  SUPERADMIN: {
    name: "Super Administrators",
    description: "System administrators with full access to all features",
    color: "destructive" as const,
  },
  ADMIN: {
    name: "Administrators",
    description: "Administrative users with elevated permissions",
    color: "default" as const,
  },
  EIRS_ADMIN: {
    name: "EIRS Administrators",
    description:
      "Administrators from the state revenue service with oversight privileges",
    color: "default" as const,
  },
  EIRS_AGENT: {
    name: "EIRS Agents",
    description:
      "Agents from the revenue service tasked with enforcement and field duties",
    color: "secondary" as const,
  },
  LGA_ADMIN: {
    name: "LGA Administrators",
    description:
      "Local Government Area admins with control over their jurisdiction",
    color: "default" as const,
  },
  LGA_AGENT: {
    name: "LGA Agents",
    description: "Local Government Area agents managing regional operations",
    color: "secondary" as const,
  },
  LGA_C_AGENT: {
    name: "LGA Compliance Agents",
    description:
      "Compliance officers enforcing levy payments and compliance in the field",
    color: "secondary" as const,
  },
  VEHICLE_OWNER: {
    name: "Vehicle Owners",
    description: "Vehicle owners managing their registered vehicles",
    color: "outline" as const,
  },
} as const;

export default async function UsersByRolePage({
  params,
  searchParams,
}: PageProps) {
  // Await the params as required
  const { role } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate role parameter
  const upperRole = role.toUpperCase();
  if (!VALID_ROLES.includes(upperRole as UserRole)) {
    notFound();
  }

  const validRole = upperRole as UserRole;
  const roleInfo = ROLE_INFO[validRole];

  // Extract search parameters
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;
  const status =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  try {
    // Fetch users for this specific role
    const usersResponse = await getUsers({
      role: validRole,
      limit,
      offset: (page - 1) * limit,
    });

    if (!usersResponse.success) {
      throw new Error(usersResponse.message || "Failed to fetch users");
    }

    const { users, count } = usersResponse.data;

    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Users
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {roleInfo.name}
                </h1>
                <p className="text-muted-foreground">{roleInfo.description}</p>
              </div>
              <Badge variant={roleInfo.color} className="ml-2">
                {validRole.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/users/add?role=${validRole}`}>
              <Button>Add New {roleInfo.name.slice(0, -1)}</Button>
            </Link>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/users" className="hover:text-foreground">
            Users
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{roleInfo.name}</span>
        </nav>

        {/* Role Statistics */}
        <Suspense
          fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}
        >
          <RoleStatsCards role={validRole} totalUsers={count} />
        </Suspense>

        {/* Users Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {roleInfo.name} ({count})
              </span>
              <Badge variant="outline">{count} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              }
            >
              <UsersByRoleContent
                role={validRole}
                initialUsers={users}
                totalCount={count}
                currentPage={page}
                limit={limit}
                initialSearch={search}
                initialStatus={status}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading users by role:", error);
    throw error;
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const upperRole = role.toUpperCase();

  if (!VALID_ROLES.includes(upperRole as UserRole)) {
    return {
      title: "Role Not Found",
    };
  }

  const roleInfo = ROLE_INFO[upperRole as UserRole];

  return {
    title: `${roleInfo.name} - User Management`,
    description: roleInfo.description,
  };
}
