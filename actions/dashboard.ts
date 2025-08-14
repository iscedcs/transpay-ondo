"use server";

import { auth } from "@/auth";
import { RBAC } from "@/lib/auth";
import { API, URLS } from "@/lib/const";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getMe } from "./users";
import { devLog } from "@/lib/utils";

export const getComplianceRate = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      totalVehicles: 0,
      owingVehicles: 0,
      compliantVehicles: 0,
      complianceRate: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    return {
      totalVehicles: 0,
      owingVehicles: 0,
      compliantVehicles: 0,
      complianceRate: 0,
    };
  }
  const URL = `${API}${URLS.dashboard.superadmin.compliance_rate}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return {
      totalVehicles: 0,
      owingVehicles: 0,
      compliantVehicles: 0,
      complianceRate: 0,
    };
  }
  const data = await res.json();

  const compliance_rate = data;
  if (!compliance_rate) {
    return {
      totalVehicles: 0,
      owingVehicles: 0,
      compliantVehicles: 0,
      complianceRate: 0,
    };
  }
  return {
    totalVehicles: compliance_rate.totalVehicles || 0,
    owingVehicles: compliance_rate.owingVehicles || 0,
    compliantVehicles: compliance_rate.compliantVehicles || 0,
    complianceRate: compliance_rate.complianceRate || 0,
  };
};

export const getTransactionSummary = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const URL = `${API}${URLS.dashboard.superadmin.transaction_summary}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const data = await res.json();

  const transaction_summary = data;
  if (!transaction_summary) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  return transaction_summary;
};

export const getOutstandingFees = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const URL = `${API}${URLS.dashboard.superadmin.owing_summary}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const data = await res.json();

  const owing_summary = data;
  if (!owing_summary) {
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  return {
    totalAmount: Number(owing_summary.totalAmount) || 0,
    totalCount: owing_summary.total_count || 0,
  };
};

export const getMonthlyRevenueChange = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "EQUAL",
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "EQUAL",
    };
  }
  const URL = `${API}${URLS.dashboard.superadmin.monthly_revenue_change}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "EQUAL",
    };
  }
  const data = await res.json();

  const monthly_revenue_change = data;
  if (!monthly_revenue_change) {
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "SAME",
    };
  }
  return {
    currentMonthRevenue:
      Number(monthly_revenue_change.currentMonthRevenue) || 0,
    lastMonthRevenue: Number(monthly_revenue_change.lastMonthRevenue) || 0,
    change: String(monthly_revenue_change.change) || "EQUAL",
  };
};

export const getUsersByRole = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return [
      { role: "ADMIN", count: 0 },
      { role: "EIRS_ADMIN", count: 0 },
      { role: "EIRS_AGENT", count: 0 },
      { role: "LGA_ADMIN", count: 0 },
      { role: "LGA_AGENT", count: 0 },
      { role: "LGA_C_AGENT", count: 0 },
      { role: "VEHICLE_OWNER", count: 0 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    return [
      { role: "ADMIN", count: 0 },
      { role: "EIRS_ADMIN", count: 0 },
      { role: "EIRS_AGENT", count: 0 },
      { role: "LGA_ADMIN", count: 0 },
      { role: "LGA_AGENT", count: 0 },
      { role: "LGA_C_AGENT", count: 0 },
      { role: "VEHICLE_OWNER", count: 0 },
    ];
  }
  const URL = `${API}${URLS.dashboard.superadmin.user_count}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return [
      { role: "ADMIN", count: 0 },
      { role: "EIRS_ADMIN", count: 0 },
      { role: "EIRS_AGENT", count: 0 },
      { role: "LGA_ADMIN", count: 0 },
      { role: "LGA_AGENT", count: 0 },
      { role: "LGA_C_AGENT", count: 0 },
      { role: "VEHICLE_OWNER", count: 0 },
    ];
  }
  const data = await res.json();

  const user_count = data.data;
  if (!user_count) {
    return [
      { role: "ADMIN", count: 0 },
      { role: "EIRS_ADMIN", count: 0 },
      { role: "EIRS_AGENT", count: 0 },
      { role: "LGA_ADMIN", count: 0 },
      { role: "LGA_AGENT", count: 0 },
      { role: "LGA_C_AGENT", count: 0 },
      { role: "VEHICLE_OWNER", count: 0 },
    ];
  }
  return user_count;
};

export async function fetchVehicleTypes() {
  const session = await auth();
  if (!session || !session.user) {
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS", count: 0 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS", count: 0 },
    ];
  }
  const URL = `${API}${URLS.dashboard.superadmin.vehicle_category_count}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS", count: 0 },
    ];
  }
  const data = await res.json();

  const vehicle_category_count = data.data;
  if (!vehicle_category_count) {
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS", count: 0 },
    ];
  }
  devLog({ vehicle_category_count });
  return vehicle_category_count;
}

export async function fetchLGARevenue() {
  const session = await auth();
  if (!session || !session.user) {
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const URL = `${API}${URLS.dashboard.superadmin.lga_revenue_all}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const data = await res.json();

  const lga_revenue_all = data.data;
  if (!lga_revenue_all) {
    
    return [
      { lgaName: "Warri South", vehicleCount: 450 },
      { lgaName: "Ndokwa East", vehicleCount: 320 },
      { lgaName: "Ughelli North", vehicleCount: 230 },
      { lgaName: "Sapele", vehicleCount: 180 },
      { lgaName: "Okpe", vehicleCount: 150 },
    ];
  }
  return lga_revenue_all;
}

export async function fetchVehicleDistribution() {
  const session = await auth();
  if (!session || !session.user) {
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const URL = `${API}${URLS.dashboard.superadmin.vehicle_count_by_lga}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const data = await res.json();

  const vehicle_count_by_lga = data.data;
  if (!vehicle_count_by_lga) {
    
    return [
      { lgaName: "Warri South", vehicleCount: 450 },
      { lgaName: "Ndokwa East", vehicleCount: 320 },
      { lgaName: "Ughelli North", vehicleCount: 230 },
      { lgaName: "Sapele", vehicleCount: 180 },
      { lgaName: "Okpe", vehicleCount: 150 },
    ];
  }
  return vehicle_count_by_lga;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  recentScans: number;
  pendingTasks: number;
  recentActivities: any[];
  vehiclesByStatus: {
    active: number;
    inactive: number;
    owing: number;
    cleared: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }
  const isComplianceAgent = RBAC.isComplianceAgent(user.role as any);
  const isLGARole = RBAC.isLGARole(user.role as any);

  try {
    // Base query conditions
    const vehicleWhere: any = {
      deletedAt: null,
    };

    // For LGA roles, filter by their LGA
    if (isLGARole && user.lgaId) {
      vehicleWhere.registeredLgaId = user.lgaId;
    }

    // For vehicle owners, filter by their vehicles
    if (user.role === "VEHICLE_OWNER") {
      vehicleWhere.ownerId = user.id;
    }

    // Get vehicle statistics
    const [totalVehicles, vehiclesByStatus] = await Promise.all([
      db.vehicle.count({ where: vehicleWhere }),
      db.vehicle.groupBy({
        by: ["status"],
        where: vehicleWhere,
        _count: true,
      }),
    ]);

    const statusCounts = vehiclesByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count;
      return acc;
    }, {} as any);

    const activeVehicles = statusCounts.active || 0;

    // Get recent scans for the user
    const recentScansCount = await db.scan.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Get recent activities for the user
    const recentActivities = await db.auditTrail.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        Vehicle: {
          select: {
            plateNumber: true,
          },
        },
      },
    });

    // For compliance agents, get pending tasks (vehicles needing compliance checks)
    let pendingTasks = 0;
    if (isComplianceAgent && user.lgaId) {
      // Count vehicles that haven't been scanned recently or need compliance checks
      pendingTasks = await db.vehicle.count({
        where: {
          registeredLgaId: user.lgaId,
          deletedAt: null,
          status: "ACTIVE",
          // Add your compliance logic here
          // For example, vehicles not scanned in the last 30 days
          Scan: {
            none: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });
    }

    return {
      totalVehicles,
      activeVehicles,
      recentScans: recentScansCount,
      pendingTasks,
      recentActivities,
      vehiclesByStatus: {
        active: statusCounts.active || 0,
        inactive: statusCounts.inactive || 0,
        owing: statusCounts.owing || 0,
        cleared: statusCounts.cleared || 0,
      },
    };
  } catch (error) {
    
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentScans(limit = 10) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const scans = await db.scan.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        Vehicle: {
          select: {
            plateNumber: true,
            color: true,
            category: true,
          },
        },
        LGA: {
          select: {
            name: true,
          },
        },
      },
    });

    return scans;
  } catch (error) {
    
    throw new Error("Failed to fetch recent scans");
  }
}

export async function getLGAAgentDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Ensure user is LGA_AGENT and has an assigned LGA
  if (user.role !== "LGA_AGENT" || !user.lgaId) {
    throw new Error("Access denied: LGA Agent role required with assigned LGA");
  }

  try {
    // Filter all queries by the agent's assigned LGA
    const vehicleWhere = {
      deletedAt: null,
      registeredLgaId: user.lgaId, // Only vehicles in their LGA
    };

    // Get vehicle statistics for their LGA only
    const [totalVehicles, vehiclesByStatus, activeVehicles] = await Promise.all(
      [
        db.vehicle.count({ where: vehicleWhere }),
        db.vehicle.groupBy({
          by: ["status"],
          where: vehicleWhere,
          _count: true,
        }),
        db.vehicle.count({
          where: {
            ...vehicleWhere,
            status: "ACTIVE",
          },
        }),
      ]
    );

    const statusCounts = vehiclesByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count;
      return acc;
    }, {} as any);

    // Get recent scans performed by this agent only
    const recentScansCount = await db.scan.count({
      where: {
        userId: user.id, // Only scans by this agent
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Get recent activities performed by this agent only
    const recentActivities = await db.auditTrail.findMany({
      where: {
        userId: user.id, // Only activities by this agent
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        Vehicle: {
          select: {
            plateNumber: true,
          },
        },
      },
    });

    // Count vehicles created this month by this agent
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const vehiclesCreatedThisMonth = await db.vehicle.count({
      where: {
        ...vehicleWhere,
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    return {
      totalVehicles,
      activeVehicles,
      recentScans: recentScansCount,
      pendingTasks: vehiclesCreatedThisMonth, // Using this as "vehicles created this month"
      recentActivities,
      vehiclesByStatus: {
        active: statusCounts.active || 0,
        inactive: statusCounts.inactive || 0,
        owing: statusCounts.owing || 0,
        cleared: statusCounts.cleared || 0,
      },
    };
  } catch (error) {
    
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getLGAAgentRecentScans(limit = 10) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "LGA_AGENT" || !user.lgaId) {
    throw new Error("Access denied: LGA Agent role required with assigned LGA");
  }

  try {
    const scans = await db.scan.findMany({
      where: {
        userId: user.id, // Only scans by this agent
        Vehicle: {
          registeredLgaId: user.lgaId, // Only vehicles in their LGA
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        Vehicle: {
          select: {
            plateNumber: true,
            color: true,
            category: true,
          },
        },
        LGA: {
          select: {
            name: true,
          },
        },
      },
    });

    return scans;
  } catch (error) {
    
    throw new Error("Failed to fetch recent scans");
  }
}

export async function getLGAAdminDashboardStats(): Promise<
  DashboardStats & {
    totalAgents: number;
    activeAgents: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }
> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Ensure user is LGA_ADMIN and has an assigned LGA
  if (user.role !== "LGA_ADMIN" || !user.lgaId) {
    throw new Error("Access denied: LGA Admin role required with assigned LGA");
  }

  try {
    // Filter all queries by the admin's assigned LGA
    const vehicleWhere = {
      deletedAt: null,
      registeredLgaId: user.lgaId, // Only vehicles in their LGA
    };

    const userWhere = {
      deletedAt: null,
      lgaId: user.lgaId, // Only users in their LGA
      role: {
        in: ["LGA_AGENT", "LGA_C_AGENT"], // Only agents
      } as { in: Role[] },
    };

    // Get vehicle statistics for their LGA
    const [totalVehicles, vehiclesByStatus, activeVehicles] = await Promise.all(
      [
        db.vehicle.count({ where: vehicleWhere }),
        db.vehicle.groupBy({
          by: ["status"],
          where: vehicleWhere,
          _count: true,
        }),
        db.vehicle.count({
          where: {
            ...vehicleWhere,
            status: "ACTIVE",
          },
        }),
      ]
    );

    const statusCounts = vehiclesByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count;
      return acc;
    }, {} as any);

    // Get agent statistics
    const [totalAgents, activeAgents] = await Promise.all([
      db.user.count({ where: userWhere }),
      db.user.count({
        where: {
          ...userWhere,
          status: "ACTIVE",
        },
      }),
    ]);

    // Get recent scans by all agents in this LGA
    const recentScansCount = await db.scan.count({
      where: {
        User: {
          lgaId: user.lgaId, // Scans by agents in this LGA
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Get recent activities - all combinations as requested
    const recentActivities = await db.auditTrail.findMany({
      where: {
        OR: [
          // Activities by agents in this LGA
          {
            User: {
              lgaId: user.lgaId,
            },
          },
          // Activities on vehicles in this LGA
          {
            Vehicle: {
              registeredLgaId: user.lgaId,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        Vehicle: {
          select: {
            plateNumber: true,
          },
        },
      },
    });

    // Calculate revenue from transactions in this LGA
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [totalRevenue, monthlyRevenue] = await Promise.all([
      db.vehicleTransaction.aggregate({
        where: {
          lgaId: user.lgaId,
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),
      db.vehicleTransaction.aggregate({
        where: {
          lgaId: user.lgaId,
          status: "SUCCESS",
          createdAt: {
            gte: thisMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Count vehicles created this month in this LGA
    const vehiclesCreatedThisMonth = await db.vehicle.count({
      where: {
        ...vehicleWhere,
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    return {
      totalVehicles,
      activeVehicles,
      recentScans: recentScansCount,
      pendingTasks: vehiclesCreatedThisMonth,
      recentActivities,
      vehiclesByStatus: {
        active: statusCounts.active || 0,
        inactive: statusCounts.inactive || 0,
        owing: statusCounts.owing || 0,
        cleared: statusCounts.cleared || 0,
      },
      totalAgents,
      activeAgents,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
    };
  } catch (error) {
    
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getLGAAdminAgentPerformance() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "LGA_ADMIN" || !user.lgaId) {
    throw new Error("Access denied: LGA Admin role required with assigned LGA");
  }

  try {
    // Get all agents in this LGA with their performance metrics
    const agents = await db.user.findMany({
      where: {
        lgaId: user.lgaId,
        role: {
          in: ["LGA_AGENT", "LGA_C_AGENT"],
        },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // Get performance data for each agent
    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        const [scansCount, vehiclesCreated, activitiesCount] =
          await Promise.all([
            db.scan.count({
              where: {
                userId: agent.id,
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            }),
            db.vehicle.count({
              where: {
                // TODO: fix this
                // owner: {
                //   createdBy: agent.id, // Vehicles created by this agent
                // },
                ownerId: agent.id,
                registeredLgaId: user.lgaId,
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            }),
            db.auditTrail.count({
              where: {
                userId: agent.id,
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            }),
          ]);

        return {
          ...agent,
          performance: {
            scansCount,
            vehiclesCreated,
            activitiesCount,
          },
        };
      })
    );

    return agentPerformance;
  } catch (error) {
    
    throw new Error("Failed to fetch agent performance data");
  }
}

export async function getLGAAdminActivities(limit = 20) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = (await getMe()).user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "LGA_ADMIN" || !user.lgaId) {
    throw new Error("Access denied: LGA Admin role required with assigned LGA");
  }

  try {
    const activities = await db.auditTrail.findMany({
      where: {
        OR: [
          // Activities by agents in this LGA
          {
            User: {
              lgaId: user.lgaId,
            },
          },
          // Activities on vehicles in this LGA
          {
            Vehicle: {
              registeredLgaId: user.lgaId,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        Vehicle: {
          select: {
            plateNumber: true,
            color: true,
            category: true,
          },
        },
      },
    });

    return activities;
  } catch (error) {
    
    throw new Error("Failed to fetch activities");
  }
}
