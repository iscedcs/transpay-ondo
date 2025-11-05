import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUsers } from "@/lib/controllers/users.controller";
import { cn } from "@/lib/utils";
import Link from "next/link";
export async function DashboardAgentSummary({
  className,
}: {
  className?: string;
}) {
  const allAgents = await getUsers({ role: "AGENCY_AGENT" });

  return (
    <Card
      className={cn(
        "flex w-full flex-col justify-between bg-secondary",
        className
      )}>
      <div className="">
        <CardHeader>
          <CardTitle className="text-primary">Agents</CardTitle>
          <CardDescription className="text-background">
            Summary of agent details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 p-2">
          <div className="relative h-full w-full p-2">
            <div className="pointer-events-none relative grid place-items-center gap-2 rounded-md border border-primary bg-secondary p-2">
              <p className="font-bold leading-none text-primary">Total</p>
              <p className="text-2xl text-background">
                {allAgents?.rows.length ?? 0}
              </p>
            </div>
          </div>
          <div className="relative h-full w-full p-2">
            <div className="pointer-events-none relative grid place-items-center gap-2 rounded-md border border-primary bg-secondary p-2">
              <p className="font-bold leading-none text-primary">Active</p>
              <p className="text-2xl text-background">
                {allAgents?.rows.length ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </div>
      <CardFooter>
        <Link
          href="/agents?page=1&limit=15"
          className={cn(buttonVariants(), "w-full")}>
          {" "}
          View all agents
        </Link>
      </CardFooter>
    </Card>
  );
}
