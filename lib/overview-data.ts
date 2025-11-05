import type {
  KPIStats,
  ComplianceData,
  RegistrationData,
  AgentPerformance,
  TopDefaulter,
  RecentActivity,
  LGAOverviewData,
} from "@/types/overview";
import { USER_ROLES } from "@/lib/constants";
import { User } from "@prisma/client";

// Mock data functions - replace with actual API calls
export async function getOverviewStats(user: User): Promise<KPIStats> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Filter data based on user role and scope
  const baseStats = {
    totalVehicles: 15420,
    compliantVehicles: 13415,
    compliancePercentage: 87,
    outstandingLevies: 45230000,
    scansToday: 156,
    agentsActiveToday: 23,
  };

  switch (user.role) {
    case USER_ROLES.SUPERADMIN:
      return baseStats;
    case USER_ROLES.ADMIN:
      return {
        ...baseStats,
        totalVehicles: Math.floor(baseStats.totalVehicles * 0.3), // State scope
        compliantVehicles: Math.floor(baseStats.compliantVehicles * 0.3),
        outstandingLevies: Math.floor(baseStats.outstandingLevies * 0.3),
        scansToday: Math.floor(baseStats.scansToday * 0.3),
        agentsActiveToday: Math.floor(baseStats.agentsActiveToday * 0.3),
      };
    case USER_ROLES.AGENCY_ADMIN:
      return {
        ...baseStats,
        totalVehicles: Math.floor(baseStats.totalVehicles * 0.05), // LGA scope
        compliantVehicles: Math.floor(baseStats.compliantVehicles * 0.05),
        outstandingLevies: Math.floor(baseStats.outstandingLevies * 0.05),
        scansToday: Math.floor(baseStats.scansToday * 0.05),
        agentsActiveToday: Math.floor(baseStats.agentsActiveToday * 0.05),
      };
    case USER_ROLES.AGENCY_AGENT:
    case USER_ROLES.ODIRS_C_AGENT:
      return {
        ...baseStats,
        totalVehicles: Math.floor(baseStats.totalVehicles * 0.01), // Personal scope
        compliantVehicles: Math.floor(baseStats.compliantVehicles * 0.01),
        outstandingLevies: Math.floor(baseStats.outstandingLevies * 0.01),
        scansToday: Math.floor(baseStats.scansToday * 0.1),
        agentsActiveToday: 1, // Just themselves
      };
    default:
      throw new Error("Unauthorized access");
  }
}

export async function getComplianceData(
  user: User,
  days = 30
): Promise<ComplianceData[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const data: ComplianceData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const baseCompliant = Math.floor(Math.random() * 100) + 50;
    const baseNonCompliant = Math.floor(Math.random() * 30) + 10;

    // Scale based on user role
    const multiplier = getUserDataMultiplier(user.role);

    data.push({
      date: date.toISOString().split("T")[0],
      compliant: Math.floor(baseCompliant * multiplier),
      nonCompliant: Math.floor(baseNonCompliant * multiplier),
    });
  }

  return data;
}

export async function getRegistrationData(
  user: User,
  days = 30
): Promise<RegistrationData[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const data: RegistrationData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const baseRegistrations = Math.floor(Math.random() * 20) + 5;
    const multiplier = getUserDataMultiplier(user.role);

    data.push({
      date: date.toISOString().split("T")[0],
      registrations: Math.floor(baseRegistrations * multiplier),
    });
  }

  return data;
}

export async function getAgentPerformance(
  user: User
): Promise<AgentPerformance[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockAgents: AgentPerformance[] = [
    {
      id: "1",
      name: "John Adebayo",
      role: "LGA Agent",
      assignedLga: "Lagos Mainland",
      vehiclesRegistered: 45,
      scansCompleted: 123,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2",
      name: "Sarah Okafor",
      role: "LGA Compliance",
      assignedLga: "Ikeja",
      vehiclesRegistered: 32,
      scansCompleted: 89,
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: "3",
      name: "Michael Eze",
      role: "LGA Agent",
      assignedLga: "Surulere",
      vehiclesRegistered: 67,
      scansCompleted: 156,
      lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  ];

  // Filter based on user role and scope
  switch (user.role) {
    case USER_ROLES.SUPERADMIN:
      return mockAgents;
    case USER_ROLES.ADMIN:
      return mockAgents; // In real app, filter by state
    case USER_ROLES.AGENCY_ADMIN:
      return mockAgents.filter(
        (agent) => agent.assignedLga === "Lagos Mainland"
      ); // User's LGA
    case USER_ROLES.AGENCY_AGENT:
    case USER_ROLES.ODIRS_C_AGENT:
      return mockAgents.filter((agent) => agent.id === user.id); // Only themselves
    default:
      return [];
  }
}

export async function getTopDefaulters(user: User): Promise<TopDefaulter[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockDefaulters: TopDefaulter[] = [
    {
      id: "1",
      plateNumber: "ABC-123-XY",
      ownerName: "Ibrahim Musa",
      status: "Overdue",
      amountOwed: 15000,
      daysMissed: 45,
    },
    {
      id: "2",
      plateNumber: "DEF-456-ZW",
      ownerName: "Grace Okoro",
      status: "Non-Compliant",
      amountOwed: 8500,
      daysMissed: 23,
    },
    {
      id: "3",
      plateNumber: "GHI-789-UV",
      ownerName: "Ahmed Bello",
      status: "Overdue",
      amountOwed: 22000,
      daysMissed: 67,
    },
  ];

  // Filter based on user scope
  const multiplier = getUserDataMultiplier(user.role);
  return mockDefaulters.slice(
    0,
    Math.max(1, Math.floor(mockDefaulters.length * multiplier))
  );
}

export async function getRecentActivity(user: User): Promise<RecentActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockActivities: RecentActivity[] = [
    {
      id: "1",
      type: "registration",
      description: "New vehicle registered: ABC-123-XY",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      userId: "agent1",
      userName: "John Adebayo",
      vehicleId: "v1",
      plateNumber: "ABC-123-XY",
    },
    {
      id: "2",
      type: "scan",
      description: "Vehicle compliance scan completed",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      userId: "comp1",
      userName: "Sarah Okafor",
      vehicleId: "v2",
      plateNumber: "DEF-456-ZW",
    },
    {
      id: "3",
      type: "payment",
      description: "Levy payment received: ₦5,000",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      userId: "agent2",
      userName: "Michael Eze",
      vehicleId: "v3",
      plateNumber: "GHI-789-UV",
    },
  ];

  // Filter based on user scope
  switch (user.role) {
    case USER_ROLES.SUPERADMIN:
    case USER_ROLES.ADMIN:
      return mockActivities;
    case USER_ROLES.AGENCY_ADMIN:
      return mockActivities; // In real app, filter by LGA
    case USER_ROLES.AGENCY_AGENT:
    case USER_ROLES.ODIRS_C_AGENT:
      return mockActivities.filter((activity) => activity.userId === user.id);
    default:
      return [];
  }
}

export async function getLGAOverviewData(
  lgaId: string,
  user: User
): Promise<LGAOverviewData> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check access permissions
  if (!canAccessLGA(user, lgaId)) {
    throw new Error("Unauthorized access to LGA data");
  }

  return {
    lga: {
      id: lgaId,
      name: "Lagos Mainland",
      stateName: "Lagos State",
      code: "LM",
    },
    stats: {
      totalVehicles: 1250,
      compliantVehicles: 1087,
      compliancePercentage: 87,
      outstandingLevies: 2500000,
      scansToday: 45,
      agentsActiveToday: 8,
      stickersAssigned: 1200,
      totalCollected: 15000000,
    },
    vehicleStatus: [
      { status: "Compliant", count: 1087, percentage: 87 },
      { status: "Overdue", count: 125, percentage: 10 },
      { status: "Not Scanned", count: 38, percentage: 3 },
    ],
    activityTrend: generateActivityTrend(30),
    recentVehicles: [
      {
        id: "1",
        plateNumber: "ABC-123-XY",
        registeredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        ownerName: "John Doe",
        status: "Compliant",
      },
      {
        id: "2",
        plateNumber: "DEF-456-ZW",
        registeredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ownerName: "Jane Smith",
        status: "Pending",
      },
    ],
    agents: [
      {
        id: "1",
        name: "John Adebayo",
        role: "LGA Agent",
        assignedLga: "Lagos Mainland",
        vehiclesRegistered: 45,
        scansCompleted: 123,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "2",
        name: "Sarah Okafor",
        role: "LGA Compliance",
        assignedLga: "Lagos Mainland",
        vehiclesRegistered: 32,
        scansCompleted: 89,
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  };
}

// Helper functions
function getUserDataMultiplier(role: string): number {
  switch (role) {
    case USER_ROLES.SUPERADMIN:
      return 1.0;
    case USER_ROLES.ADMIN:
      return 0.3;
    case USER_ROLES.AGENCY_ADMIN:
      return 0.05;
    case USER_ROLES.AGENCY_AGENT:
    case USER_ROLES.ODIRS_C_AGENT:
      return 0.01;
    default:
      return 0;
  }
}

function canAccessLGA(user: User, lgaId: string): boolean {
  switch (user.role) {
    case USER_ROLES.SUPERADMIN:
      return true;
    case USER_ROLES.ADMIN:
      return true; // In real app, check if LGA is in user's state
    case USER_ROLES.AGENCY_ADMIN:
    case USER_ROLES.AGENCY_AGENT:
    case USER_ROLES.ODIRS_C_AGENT:
      return user.lgaId === lgaId;
    default:
      return false;
  }
}

function generateActivityTrend(days: number) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      registrations: Math.floor(Math.random() * 10) + 2,
      scans: Math.floor(Math.random() * 30) + 10,
      payments: Math.floor(Math.random() * 15) + 5,
    });
  }

  return data;
}
