"use server";

import { auth } from "@/auth";
import { API } from "@/lib/const";
import { revalidatePath } from "next/cache";
import { Vehicle } from "./vehicles";

interface ScanRequest {
  barcode: string;
  latitude: number;
  longitude: number;
}

interface ScanResponse {
  success: boolean;
  message: string;
  scan: {
    id: string;
    vehicleId: string;
    userId: string;
    latitude: number;
    longitude: number;
    detectedLgaId: string | null;
    declaredRouteHit: boolean;
    extraCharge: number;
    createdAt: string;
  };
  vehicle: Vehicle;
  agent: User;
  tracker: any;
  charged: {
    base: number;
    lga: number;
    total: number;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  gender: string | null;
  marital_status: string | null;
  whatsapp: string | null;
  nok_name: string | null;
  nok_phone: string | null;
  nok_relationship: string | null;
  maiden_name: string | null;
  blacklisted: boolean;
  address: string | null;
  identification: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  createdBy: string | null;
  lgaId: string | null;
  status: string;
  lga?: LGA | null;
}

interface Wallet {
  id: string;
  vehicleId: string;
  walletBalance: string;
  amountOwed: string;
  netTotal: string;
  lastTransactionDate: string;
  nextTransactionDate: string;
  cvofBalance: string;
  fareflexBalance: string;
  isceBalance: string;
  cvofOwing: string;
  fareflexOwing: string;
  isceOwing: string;
  accountNumber: string | null;
  bankCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Transaction {
  id: string;
  vehicleId: string;
  lgaId: string | null;
  transactionReference: string;
  inReference: string | null;
  outReference: string | null;
  description: string;
  type: string;
  paymentType: string;
  paymentDate: string;
  transactionType: string;
  transactionDate: string;
  transactionCategory: string | null;
  sender: string | null;
  recipient: string | null;
  amount: string;
  currency: string;
  revenueAmount: string;
  trackerAmount: string;
  walletCharges: string;
  gatewayFeeIn: string;
  gatewayFeeOut: string;
  walletBefore: string;
  walletAfter: string;
  status: string;
  meta: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface LGA {
  id: string;
  name: string;
  fee: string;
}

interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle;
}

export async function scanVehicle(data: ScanRequest): Promise<ScanResponse> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    const response = await fetch(`${API}/api/scan/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath(`/vehicles/${result.vehicle?.id}`);

    return result;
  } catch (error) {
    console.error("Error scanning vehicle:", error);
    throw new Error("Failed to scan vehicle");
  }
}

export async function getVehicleByBarcode(
  barcode: string
): Promise<VehicleResponse> {
  try {
    const response = await fetch(`${API}/api/vehicles/barcode/${barcode}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: "Vehicle not found",
          data: null as any,
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching vehicle by barcode:", error);
    return {
      success: false,
      message: "Failed to fetch vehicle",
      data: null as any,
    };
  }
}

export async function getCurrentUserLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  // This would typically be handled on the client side
  // Return null for server-side, client components will handle geolocation
  return null;
}
