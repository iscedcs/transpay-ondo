"use server";

import { auth } from "@/auth";
import { API, URLS } from "@/lib/const";

export const getComplianceRate = async () => {
  const session = await auth();
  if (!session || !session.user) {
    console.log("No session or user found");
    return {
      totalVehicles: 0,
      owingVehicles: 0,
      compliantVehicles: 0,
      complianceRate: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch compliance rate:", res.statusText);
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
    console.log("Compliance rate not found in the response data");
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
    console.log("No session or user found");
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch transaction summary:", res.statusText);
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const data = await res.json();

  const transaction_summary = data;
  if (!transaction_summary) {
    console.log("Transaction summary not found in the response data");
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
    console.log("No session or user found");
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch Owing summary:", res.statusText);
    return {
      totalAmount: 0,
      totalCount: 0,
    };
  }
  const data = await res.json();

  const owing_summary = data;
  if (!owing_summary) {
    console.log("Owing summary not found in the response data");
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
    console.log("No session or user found");
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "EQUAL",
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch monthly revenue change:", res.statusText);
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      change: "EQUAL",
    };
  }
  const data = await res.json();

  const monthly_revenue_change = data;
  if (!monthly_revenue_change) {
    console.log("Monthly revenue change not found in the response data");
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
    console.log("No session or user found");
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
    console.log("No access token found in the session");
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
    console.error("Failed to fetch users by role:", res.statusText);
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
    console.log("users by role not found in the response data");
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
    console.log("No session or user found");
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS_INTRASTATE", count: 0 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS_INTRASTATE", count: 0 },
    ];
  }
  const URL = `${API}${URLS.dashboard.superadmin.vehicle_category_count}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(URL, { headers, cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch vehicle category:", res.statusText);
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS_INTRASTATE", count: 0 },
    ];
  }
  const data = await res.json();

  const vehicle_category_count = data.data;
  if (!vehicle_category_count) {
    console.log("users by role not found in the response data");
    return [
      { type: "TRICYCLE", count: 0 },
      { type: "BUS_INTRASTATE", count: 0 },
    ];
  }
  return vehicle_category_count;
}

export async function fetchLGARevenue() {
  const session = await auth();
  if (!session || !session.user) {
    console.log("No session or user found");
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch vehicle count by lga:", res.statusText);
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const data = await res.json();

  const lga_revenue_all = data.data;
  if (!lga_revenue_all) {
    console.log("vehicle count by lga not found in the response data");
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
    console.log("No session or user found");
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const token = session?.user.access_token;
  if (!token) {
    console.log("No access token found in the session");
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
    console.error("Failed to fetch vehicle count by lga:", res.statusText);
    return [
      { lga: "ESAN SOUTH-EAST", count: 1, percentage: 50 },
      { lga: "OREDO", count: 1, percentage: 50 },
    ];
  }
  const data = await res.json();

  const vehicle_count_by_lga = data.data;
  if (!vehicle_count_by_lga) {
    console.log("vehicle count by lga not found in the response data");
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

