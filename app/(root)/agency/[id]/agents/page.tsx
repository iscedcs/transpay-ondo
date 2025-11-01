"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
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
import { Plus, Loader2, ArrowLeft, Users2 } from "lucide-react";
import Link from "next/link";

export default function AgencyAgentsPage() {
  const { id } = useParams();
  const agencyId = Array.isArray(id) ? id[0] : id ?? "";
  const router = useRouter();
  const { data: session } = useSession();

  const token = session?.user?.access_token;

  const [isLoading, setIsLoading] = useState(true);
  const [agency, setAgency] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [totalAgents, setTotalAgents] = useState<number>(0);

  const fetchAgencyAgents = async () => {
    try {
      const res = await axios.get(
        `${API}${URLS.agency.one_agency_agent.replace("{id}", agencyId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        const data = res.data.data;
        setAgency(data.agency);
        setAgents(data.agents);
        setTotalAgents(data.totalAgents);
      } else {
        toast.error(res.data?.message || "Failed to load agency agents");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error fetching agents", {
        description:
          error?.response?.data?.message || "Unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agencyId && token) fetchAgencyAgents();
  }, [agencyId, token]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading agents...
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
            {agency.name} — Agents
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all agents assigned to this agency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button asChild size="sm" className="flex items-center gap-2">
            <Link href={`/agency/add/agent?agencyId=${agency.id}`}>
              <Plus className="h-4 w-4" /> Add Agent
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Agents Overview</CardTitle>
            <CardDescription>
              Total number of agents under this agency
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users2 className="h-4 w-4" />
            <span className="font-medium">{totalAgents} total agents</span>
          </div>
        </CardHeader>
      </Card>

      {/* Agent List */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            Below is the list of all agents registered under {agency.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No agents found for this agency yet.
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
                    <tr key={agent.id} className="border-b hover:bg-muted/30">
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
