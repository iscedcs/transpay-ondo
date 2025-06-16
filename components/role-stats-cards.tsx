import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@prisma/client";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface RoleStatsCardsProps {
  role: Role;
  totalUsers: number;
}

export function RoleStatsCards({ role, totalUsers }: RoleStatsCardsProps) {
  // Mock statistics - in a real app, you'd fetch these from your API
  const stats = {
    total: totalUsers,
    active: Math.floor(totalUsers * 0.85),
    blacklisted: Math.floor(totalUsers * 0.1),
    recentlyJoined: Math.floor(totalUsers * 0.15),
  };

  const cards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: Users,
      description: `Total ${role.toLowerCase().replace("_", " ")} users`,
      color: "default" as const,
    },
    {
      title: "Active Users",
      value: stats.active,
      icon: UserCheck,
      description: "Currently active users",
      color: "default" as const,
    },
    {
      title: "Blacklisted",
      value: stats.blacklisted,
      icon: UserX,
      description: "Blacklisted users",
      color: "destructive" as const,
    },
    {
      title: "Recent Joins",
      value: stats.recentlyJoined,
      icon: Clock,
      description: "Joined in last 30 days",
      color: "secondary" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
