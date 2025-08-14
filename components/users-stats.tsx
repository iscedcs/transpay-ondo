"use client";

import type { FC } from "react";
import { motion } from "framer-motion";
import { Users, Shield, UserCheck, Car, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/actions/users";
import { RoleBreakdownModal } from "./role-breakdown-modal";

export interface UsersStatsProps {
  users: User[];
  totalCount: number;
  roleSummary: Record<string, number>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export const UsersStats: FC<UsersStatsProps> = ({
  users = [],
  totalCount = 0,
  roleSummary = {},
}) => {
  const get = (key: string) => roleSummary?.[key] ?? 0;

  // Derived metrics
  const activeUsersCount =
    users.filter((u) => !u?.deletedAt && !u?.blacklisted).length ?? 0;

  const adminsCount =
    get("SUPERADMIN") + get("ADMIN") + get("LGA_ADMIN") + get("EIRS_ADMIN");

  const agentsCount =
    get("LGA_AGENT") +
    get("POS_AGENT") +
    get("EIRS_AGENT") +
    get("LGA_C_AGENT");

  const vehicleOwnersCount = get("VEHICLE_OWNER");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Overview</h3>
        <RoleBreakdownModal roleSummary={roleSummary} totalCount={totalCount} />
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
        aria-label="Users statistics overview"
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                aria-label="Total users count"
              >
                {totalCount}
              </div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <UserCheck
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                aria-label="Active users count"
              >
                {activeUsersCount}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="Admins count">
                {adminsCount}
              </div>
              <p
                className="text-xs text-muted-foreground line-clamp-1"
                title="Includes SUPERADMIN, ADMIN, LGA_ADMIN, EIRS_ADMIN"
              >
                Includes SUPERADMIN, ADMIN, LGA_ADMIN, EIRS_ADMIN
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agents</CardTitle>
              <UserCog
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="Agents count">
                {agentsCount}
              </div>
              <p
                className="text-xs text-muted-foreground line-clamp-1"
                title="Includes LGA_AGENT, POS_AGENT, EIRS_AGENT, LGA_C_AGENT"
              >
                Includes LGA_AGENT, POS_AGENT, EIRS_AGENT, LGA_C_AGENT
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vehicle Owners
              </CardTitle>
              <Car
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                aria-label="Vehicle owners count"
              >
                {vehicleOwnersCount}
              </div>
              <p className="text-xs text-muted-foreground">Vehicle owners</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UsersStats;
