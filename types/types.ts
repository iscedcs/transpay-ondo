import { UserRole } from "@/lib/constants";

// Transaction statuses
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING";

// Commission modes
export type CommissionMode = "MODE_A" | "MODE_B";

// Vehicle interface
export interface Vehicle {
  id: string;
  plateNumber: string;
  securityCode: string;
  stickerNumber: string;
  vehicleType: string;
  ownerName: string;
  ownerPhone: string;
  walletBalance: number;
  isCompliant: boolean;
  lgaName: string;
  agencyId?: string;
}

// Transaction interface
export interface Transaction {
  id: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  agentId: string;
  agentName: string;
  requestedAmount: number;
  payableAmount: number;
  commissionAmount: number;
  agentCommission: number;
  agencyCommission: number;
  status: TransactionStatus;
  paymentReference?: string;
  createdAt: string;
  completedAt?: string;
}

// Receivable/Payable interface
export interface FinancialRecord {
  id: string;
  transactionId: string;
  agentId: string;
  agentName: string;
  amount: number;
  status: "PENDING" | "REMITTED" | "PAID" | "RECONCILED";
  reference?: string;
  dueDate: string;
  settledAt?: string;
}

// Agent interface
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agencyId: string;
  agencyName: string;
  role: UserRole;
  isActive: boolean;
  totalTransactions: number;
  totalCommission: number;
  createdAt: string;
}

// Commission settings
export interface CommissionSettings {
  systemRate: number; // e.g., 5 for 5%
  agentShare: number; // e.g., 60 for 60%
  agencyShare: number; // e.g., 40 for 40%
  mode: CommissionMode;
}
