"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API, URLS } from "@/lib/const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Users2,
  Building2,
  TrendingUp,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AgencyListPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        if (!session?.user.access_token) return;

        const res = await axios.get(`${API}${URLS.agency.all}`, {
          headers: {
            Authorization: `Bearer ${session.user.access_token}`,
          },
        });
        if (res.data?.success) {
          setAgencies(res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to fetch agencies");
        }
      } catch (error: any) {
        console.error("Agency fetch error:", error);
        toast.error("Failed to load agencies", {
          description:
            error?.response?.data?.message || "An unknown error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencies();
  }, [session]);

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Agency Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all agencies and their assigned agents
          </p>
        </div>

        {/* Add Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/agency/add">Create Agency</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/agency/add/agent">Add Agent to Agency</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Agencies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {" "}
              {agencies.reduce((total, a) => total + (a._count?.users || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Agencies
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agencies.filter((a) => a.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0</div>
          </CardContent>
        </Card>
      </div>

      {/* Agency List */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Agencies</h2>
          <Button variant="outline" size="sm" onClick={() => location.reload()}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Agency Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    Loading agencies...
                  </td>
                </tr>
              ) : agencies.length > 0 ? (
                agencies.map((agency) => (
                  <tr key={agency.id} className="border-b">
                    <td className="px-4 py-3">{agency.name}</td>
                    <td className="px-4 py-3">{agency.contactEmail}</td>
                    <td className="px-4 py-3">{agency.contactPhone}</td>
                    <td className="px-4 py-3">
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/agency/${agency.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/agency/add/agent?agencyId=${agency.id}`}>
                              Add Agent
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground">
                    No agencies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
