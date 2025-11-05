import { auth } from "@/auth";
import FormError from "@/components/shared/FormError";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { agentsColumns } from "@/components/ui/table/columns";
import { DataTable } from "@/components/ui/table/data-table";
import { getAgentRegisteredByAdminId } from "@/lib/controllers/admin-controller";
import { getUsers } from "@/lib/controllers/users.controller";
import { getVehicles } from "@/lib/controllers/vehicle-controller";
import Link from "next/link";

export default async function DashboardAdmin() {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return <FormError message="You are not authorized to view this page" />;
  const userId = session.user.id;
  const allAgents = await getUsers({ role: "AGENCY_AGENT" });
  const allVehicles = await getVehicles();
  const myAgents = await getAgentRegisteredByAdminId({ userId });
  return (
    <div>
      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href={"/agents"}>
          <Card>
            <CardHeader>
              <CardTitle>Agents</CardTitle>
              <CardDescription>All Agents</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 px-2 py-4">
              <div className="pointer-events-none relative grid gap-2 rounded-md border border-primary bg-secondary p-2">
                <p className="font-bold leading-none text-primary">Total</p>
                <p className="text-2xl text-background">
                  {allAgents?.meta?.total ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={"/dashboard/my-agents?page=1&limit=15"}>
          <Card>
            <CardHeader>
              <CardTitle>Registered Agents</CardTitle>
              <CardDescription>All Agents registered by you</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 px-2 py-4">
              <div className="pointer-events-none relative grid gap-2 rounded-md border border-primary bg-secondary p-2">
                <p className="font-bold leading-none text-primary">Total</p>
                <p className="text-2xl text-background">
                  {myAgents?.totalAgents ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={"/vehicles"}>
          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>Summary of vehicle details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 px-2 py-4">
              <div className="pointer-events-none relative grid gap-2 rounded-md border border-primary bg-secondary p-2">
                <p className="font-bold leading-none text-primary">Total</p>
                <p className="text-2xl text-background">
                  {allVehicles?.rows?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="mb-20 flex flex-col gap-2">
        <DataTable
          showSearch
          searchWith="name"
          searchWithPlaceholder="Search with name"
          showColumns
          columns={agentsColumns}
          data={myAgents?.agents ?? []}
        />
        {/* <div className="text-title1Bold md:text-h4Bold">
                         Revenue & Statistics
                    </div>
                    <div className="rounded-3xl">
                         <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3">
                              {DATE_RANGE.map(
                                   ({ type, title, description }, b) => (
                                        <Suspense
                                             key={b}
                                             fallback={
                                                  <Skeleton className="flex h-24 w-full flex-col justify-between rounded-2xl bg-secondary p-3 shadow-md" />
                                             }
                                        >
                                             <RevenueAmountCard
                                                  type={type}
                                                  title={`${title} Revenue`}
                                                  desc={description}
                                             />
                                        </Suspense>
                                   ),
                              )}
                         </div>
                    </div> */}
      </div>
    </div>
  );
}
