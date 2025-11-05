import { auth } from "@/auth";
import { PaginationISCE } from "@/components/shared/pagination-isce";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { agentsColumns } from "@/components/ui/table/columns";
import { DataTable } from "@/components/ui/table/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers } from "@/lib/controllers/users.controller";
import { addIcon } from "@/lib/icons";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Agents({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams["page"] ?? "1";
  const limit = resolvedSearchParams["limit"] ?? "15";
  const agents = await getUsers({
    limit: Number(limit),
    role: "ODIRS_C_AGENT",
  });

  const session = await auth();

  if (!session?.user) {
    return redirect("/sign-in");
  }

  if (!agents || !agents.meta) {
    return <Skeleton className="h-10 w-full bg-gray-950" />;
  }

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  return (
    <div className="flex h-full w-full flex-col p-5">
      <div className="flex items-center justify-between font-bold uppercase">
        <div className="shrink-0 grow-0">Agents</div>
        <div className="shrink-0 grow-0">
          <Button
            className="justify-start rounded-xl bg-primary-800 text-white"
            asChild
            variant={"default"}>
            <Link
              href={"/agents/new-agent"}
              className="shrink-0 whitespace-nowrap">
              <div className="mr-2 h-4 w-4 shrink-0">{addIcon}</div>
              New Agent
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger className="" value="all">
              All Agents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <DataTable
              showSearch
              searchWith="name"
              searchWithPlaceholder="Search with name"
              showColumns
              columns={agentsColumns}
              data={agents?.rows}
            />

            {agents.meta.total_pages > 1 && (
              <PaginationISCE
                hasNextPage={end < agents.meta.total}
                hasPrevPage={start > 0}
                page={Number(page)}
                limit={Number(limit)}
                total={agents.meta.total}
                hrefPrefix="/agents"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
