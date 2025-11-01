import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Car,
  Shield,
  DollarSign,
  Scan,
  Users,
  Currency,
} from "lucide-react";
import Link from "next/link";
import type { KPIStats } from "@/types/overview";
import { Role, User } from "@prisma/client";

interface KPIStatsCardsProps {
  stats: KPIStats;
  user: User;
}

export function KPIStatsCards({ stats, user }: KPIStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-NG").format(num);
  };

  const getStatsForRole = () => {
    const baseStats = [
      {
        title: "Total Vehicles",
        value: formatNumber(stats.totalVehicles),
        subtitle: "Registered vehicles",
        icon: <Car className="h-4 w-4" />,
        trend: <TrendingUp className="h-4 w-4 text-green-600" />,
        link: "/dashboard/vehicles",
      },
      {
        title: "Compliance Rate",
        value: `${stats.compliancePercentage}%`,
        subtitle: `${formatNumber(stats.compliantVehicles)} compliant`,
        icon: <Shield className="h-4 w-4" />,
        trend:
          stats.compliancePercentage >= 85 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ),
        link: "/dashboard/vehicles?filter=compliance",
      },
      {
        title: "Outstanding Levies",
        value: formatCurrency(stats.outstandingLevies),
        subtitle: "Pending collections",
        icon: <Currency className="h-4 w-4" />,
        trend: <TrendingDown className="h-4 w-4 text-red-600" />,
        link: "/dashboard/vehicles?filter=overdue",
      },
      {
        title: "Scans Today",
        value: formatNumber(stats.scansToday),
        subtitle: "Compliance checks",
        icon: <Scan className="h-4 w-4" />,
        trend: <TrendingUp className="h-4 w-4 text-green-600" />,
        link: "/dashboard/scans",
      },
      {
        title: "Active Agents",
        value: formatNumber(stats.agentsActiveToday),
        subtitle: "Online today",
        icon: <Users className="h-4 w-4" />,
        trend: <TrendingUp className="h-4 w-4 text-green-600" />,
        link: "/dashboard/users?filter=agents",
      },
    ];

    // Customize based on role
    switch (user.role) {
      case Role.AGENCY_AGENT:
      case Role.ODIRS_C_AGENT:
        return [
          {
            ...baseStats[0],
            title: "My Registrations",
            subtitle: "Vehicles I registered",
          },
          {
            ...baseStats[1],
            title: "My Area Compliance",
            subtitle: "In my patrol area",
          },
          {
            ...baseStats[3],
            title: "My Scans Today",
            subtitle: "Completed by me",
          },
          {
            title: "Tasks Pending",
            value: formatNumber(12), // Mock data
            subtitle: "Assigned to me",
            icon: <Shield className="h-4 w-4" />,
            trend: <TrendingDown className="h-4 w-4 text-yellow-600" />,
            link: "/dashboard/tasks",
          },
        ];
      default:
        return baseStats;
    }
  };

  const statsToShow = getStatsForRole();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {statsToShow.map((stat, index) => (
        <Link key={index} href={stat.link}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-1">
                {stat.trend}
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
