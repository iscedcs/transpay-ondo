"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

import { API, URLS } from "@/lib/const";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users2,
  Building2,
  Activity,
  TrendingUp,
  Plus,
  Edit2,
} from "lucide-react";
import AgencyEditForm from "@/components/dashboard/agency/agency-edit-form";

export default function AgencyDetailPage() {
  const { id } = useParams();
  const agencyId = Array.isArray(id) ? id[0] : id ?? "";

  const router = useRouter();

  const { data: session } = useSession();

  const [agency, setAgency] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        if (!session?.user?.access_token) return;

        const [agencyRes, agentRes, dashboardRes] = await Promise.all([
          axios.get(`${API}${URLS.agency.one.replace("{id}", agencyId)}`, {
            headers: { Authorization: `Bearer ${session.user.access_token}` },
          }),
          axios.get(
            `${API}${URLS.agency.one_agency_agent.replace("{id}", agencyId)}`,
            {
              headers: { Authorization: `Bearer ${session.user.access_token}` },
            }
          ),
          axios.get(
            `${API}${URLS.agency.agency_dashboard.replace("{id}", agencyId)}`,
            {
              headers: { Authorization: `Bearer ${session.user.access_token}` },
            }
          ),
        ]);
        console.log("Agent API Response:", agentRes.data);

        if (agencyRes.data?.success) setAgency(agencyRes.data.data);
        if (agentRes.data?.success) {
          const result = agentRes.data.data;
          const extractedAgents = Array.isArray(result)
            ? result
            : Array.isArray(result?.agents)
            ? result.agents
            : [];
          setAgents(extractedAgents);
        }
        if (dashboardRes.data?.success) setDashboard(dashboardRes.data.data);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load agency data", {
          description:
            error?.response?.data?.message || "An unknown error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencyData();
  }, [agencyId, session]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading agency details...
      </div>
    );

  if (!agency)
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load agency information.
      </div>
    );

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {agency.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Agency Overview and Assigned Agents
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Agency Info Card */}
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>Basic details about this agency</CardDescription>
          </div>
        </CardHeader>

        {!showEdit ? (
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold">{agency.contactEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="font-semibold">{agency.contactPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin</p>
              <p className="font-semibold">
                {agency.agencyAdmin
                  ? `${agency.agencyAdmin.firstName} ${agency.agencyAdmin.lastName}`
                  : "N/A"}
              </p>
              {agency.agencyAdmin && (
                <p className="text-sm text-muted-foreground">
                  {agency.agencyAdmin.email}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  agency.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {agency.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created
              </p>
              <p className="font-semibold">
                {new Date(agency.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
              onClick={() => setShowEdit((prev) => !prev)}
              title={showEdit ? "Close edit mode" : "Edit agency"}>
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardContent>
        ) : (
          <CardContent>
            <AgencyEditForm
              agencyId={agencyId}
              onUpdated={() => {
                toast.success("Agency details refreshed");
                setShowEdit(false);
              }}
            />
          </CardContent>
        )}
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.transactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{dashboard?.totalRevenue?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agency.status}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>More Actions</CardTitle>
          <CardDescription>
            Access detailed reports and manage agents for this agency
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="default" className="flex items-center gap-2">
            <Link href={`/agency/${agencyId}/dashboard`}>
              <TrendingUp className="h-4 w-4" />
              View Dashboard
            </Link>
          </Button>

          <Button asChild variant="default" className="flex items-center gap-2">
            <Link href={`/agency/${agencyId}/agents`}>
              <Users2 className="h-4 w-4" />
              View Agents
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Agent List */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Agents</CardTitle>
            <CardDescription>All agents under this agency</CardDescription>
          </div>
          <Button asChild size="sm" className="flex items-center gap-2">
            <Link href={`/agency/add/agent?agencyId=${agency.id}`}>
              <Plus className="h-4 w-4" /> Add Agent
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No agents found for this agency.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b">
                      <td className="px-4 py-2">
                        {agent.firstName} {agent.lastName}
                      </td>
                      <td className="px-4 py-2">{agent.email}</td>
                      <td className="px-4 py-2">{agent.phone}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            agent.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {agent.status || "INACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
