"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCog, Car, Info } from "lucide-react";

type RoleSummary = Record<string, number>;

export interface RoleBreakdownModalProps {
  roleSummary: RoleSummary;
  totalCount: number;
  buttonText?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
}

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "LGA_ADMIN", "EIRS_ADMIN"];
const AGENT_ROLES = ["LGA_AGENT", "POS_AGENT", "EIRS_AGENT", "LGA_C_AGENT"];
const OWNER_ROLES = ["VEHICLE_OWNER"];

function groupOf(role: string): "Admin" | "Agent" | "Owner" | "Other" {
  if (ADMIN_ROLES.includes(role)) return "Admin";
  if (AGENT_ROLES.includes(role)) return "Agent";
  if (OWNER_ROLES.includes(role)) return "Owner";
  return "Other";
}

function groupBadge(group: ReturnType<typeof groupOf>) {
  switch (group) {
    case "Admin":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          Admin
        </Badge>
      );
    case "Agent":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Agent
        </Badge>
      );
    case "Owner":
      return (
        <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">
          Owner
        </Badge>
      );
    default:
      return <Badge variant="secondary">Other</Badge>;
  }
}

function roleIcon(role: string) {
  const g = groupOf(role);
  const cls = "h-4 w-4 text-muted-foreground";
  if (g === "Admin") return <Shield className={cls} aria-hidden="true" />;
  if (g === "Agent") return <UserCog className={cls} aria-hidden="true" />;
  if (g === "Owner") return <Car className={cls} aria-hidden="true" />;
  return <Info className={cls} aria-hidden="true" />;
}

export function RoleBreakdownModal({
  roleSummary,
  totalCount,
  buttonText = "View full breakdown",
  size = "sm",
  variant = "outline",
}: RoleBreakdownModalProps) {
  const entries = useMemo(() => {
    const list = Object.entries(roleSummary ?? {}).map(([role, count]) => {
      const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
      return { role, count: count ?? 0, pct, group: groupOf(role) };
    });
    // Sort by count desc
    return list.sort((a, b) => b.count - a.count);
  }, [roleSummary, totalCount]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Full role breakdown</DialogTitle>
          <DialogDescription>
            Distribution of users across roles with counts and percentages.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="w-24 text-right">Count</TableHead>
                <TableHead className="w-24 text-right">Percent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((item) => (
                <TableRow key={item.role}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {roleIcon(item.role)}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {item.role.replaceAll("_", " ")}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          {groupBadge(item.group)}
                          <div className="flex-1 min-w-[120px]">
                            <Progress value={item.pct} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totalCount > 0 ? item.pct.toFixed(1) : "0.0"}%
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No role data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RoleBreakdownModal;
