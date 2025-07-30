import { Role, TransactionCategories } from "@prisma/client";

// State Configuration - Easy to modify for different states
export const STATE_CONFIG = {
  name: "Lagos State",
  code: "LAG",
  currency: "NGN",
  currencySymbol: "₦",
  timezone: "Africa/Lagos",

  // Revenue targets and thresholds
  monthlyRevenueTarget: 50000000, // 50M NGN
  complianceThreshold: 85, // 85% compliance rate

  // Contact information
  supportPhone: "+234-800-TRANSPAY",
  supportEmail: "support@transpay.lagos.gov.ng",

  // System settings
  maxVehiclesPerOwner: 10,
  levyGracePeriod: 30, // days

  // LGA configuration
  lgas: [
    { id: "1", name: "Ikeja", code: "IKJ" },
    { id: "2", name: "Lagos Island", code: "LIS" },
    { id: "3", name: "Victoria Island", code: "VIC" },
    { id: "4", name: "Surulere", code: "SUR" },
    { id: "5", name: "Alimosho", code: "ALI" },
  ],

  // Vehicle categories and levy amounts
  vehicleCategories: [
    { id: "motorcycle", name: "Motorcycle", dailyLevy: 200 },
    { id: "tricycle", name: "Tricycle", dailyLevy: 300 },
    { id: "taxi", name: "Taxi", dailyLevy: 500 },
    { id: "bus", name: "Bus", dailyLevy: 800 },
    { id: "truck", name: "Truck", dailyLevy: 1000 },
  ],
} as const;

export const USER_ROLES = Role;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function getVehicleCategories(): string[] {
  return Object.keys(TransactionCategories);
}

export function getVehicleTypes(): string[] {
  return [
    "PASSENGER",
    "COMMERCIAL",
    "FREIGHT",
    "PUBLIC_TRANSPORT",
    "PRIVATE",
    "GOVERNMENT",
    "EMERGENCY",
    "BUS_INTRASTATE",
    "BUS_INTERSTATE",
  ];
}

export const assignableRoles: Record<string, string[]> = {
  SUPERADMIN: [
    "ADMIN",
    "EIRS_ADMIN",
    "EIRS_AGENT",
    "LGA_ADMIN",
    "LGA_AGENT",
    "LGA_C_AGENT",
    "VEHICLE_OWNER",
    "POS_AGENT",
  ],
  ADMIN: [
    "EIRS_ADMIN",
    "EIRS_AGENT",
    "LGA_ADMIN",
    "LGA_AGENT",
    "LGA_C_AGENT",
    "VEHICLE_OWNER",
    "POS_AGENT",
  ],
  EIRS_ADMIN: [
    "EIRS_AGENT",
    "LGA_ADMIN",
    "LGA_AGENT",
    "LGA_C_AGENT",
    "VEHICLE_OWNER",
    "POS_AGENT",
  ],
  LGA_ADMIN: ["LGA_AGENT", "LGA_C_AGENT", "VEHICLE_OWNER"],
  EIRS_AGENT: ["VEHICLE_OWNER"],
  LGA_AGENT: ["VEHICLE_OWNER"],
  LGA_C_AGENT: [],
  VEHICLE_OWNER: [],
  POS_AGENT: [],
};
