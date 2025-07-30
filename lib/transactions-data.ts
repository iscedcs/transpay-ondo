import { getMe } from "@/actions/users";
import type {
  AuditLogEntry,
  Transaction,
  TransactionFilters,
  TransactionStats,
} from "@/types/transactions";

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    reference: "TXN-2024-001",
    vehicleId: "veh_001",
    vehiclePlateNumber: "LAG-123-AB",
    amount: 5000,
    type: "fee",
    status: "success",
    lgaId: "lga_001",
    lgaName: "Ikeja",
    stateId: "state_001",
    stateName: "Lagos",
    timestamp: "2024-01-15T10:30:00Z",
    channel: "pos",
    collectedBy: "agent_001",
    collectedByName: "John Doe",
    description: "Vehicle registration fee",
  },
  {
    id: "txn_002",
    reference: "TXN-2024-002",
    vehicleId: "veh_002",
    vehiclePlateNumber: "ABJ-456-CD",
    amount: 2500,
    type: "fine",
    status: "success",
    lgaId: "lga_002",
    lgaName: "Abuja Municipal",
    stateId: "state_002",
    stateName: "FCT",
    timestamp: "2024-01-15T11:45:00Z",
    channel: "wallet",
    description: "Traffic violation fine",
  },
  {
    id: "txn_003",
    reference: "TXN-2024-003",
    vehicleId: "veh_003",
    vehiclePlateNumber: "KAN-789-EF",
    amount: 3000,
    type: "route_fee",
    status: "pending",
    lgaId: "lga_003",
    lgaName: "Kano Municipal",
    stateId: "state_003",
    stateName: "Kano",
    timestamp: "2024-01-15T12:15:00Z",
    channel: "bank_transfer",
    description: "Route permit fee",
  },
  {
    id: "txn_004",
    reference: "TXN-2024-004",
    vehicleId: "veh_004",
    vehiclePlateNumber: "PH-321-GH",
    amount: 1500,
    type: "payment",
    status: "failed",
    lgaId: "lga_004",
    lgaName: "Port Harcourt",
    stateId: "state_004",
    stateName: "Rivers",
    timestamp: "2024-01-15T13:20:00Z",
    channel: "pos",
    collectedBy: "agent_002",
    collectedByName: "Jane Smith",
    description: "Daily permit payment",
  },
  {
    id: "txn_005",
    reference: "TXN-2024-005",
    vehicleId: "veh_005",
    vehiclePlateNumber: "IBD-654-IJ",
    amount: 4000,
    type: "fee",
    status: "success",
    lgaId: "lga_005",
    lgaName: "Ibadan North",
    stateId: "state_005",
    stateName: "Oyo",
    timestamp: "2024-01-15T14:10:00Z",
    channel: "cash",
    collectedBy: "agent_003",
    collectedByName: "Mike Johnson",
    description: "Annual vehicle permit",
  },
];

const mockAuditLogs: Record<string, AuditLogEntry[]> = {
  txn_001: [
    {
      id: "audit_001",
      action: "Transaction Created",
      timestamp: "2024-01-15T10:30:00Z",
      userId: "agent_001",
      userName: "John Doe",
      details: "Transaction initiated by agent",
      ipAddress: "192.168.1.100",
    },
    {
      id: "audit_002",
      action: "Payment Processed",
      timestamp: "2024-01-15T10:30:30Z",
      userId: "system",
      userName: "System",
      details: "Payment processed successfully via POS",
      ipAddress: "192.168.1.100",
    },
  ],
};

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<{
  transactions: Transaction[];
  total: number;
  stats: TransactionStats;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user: any = (await getMe()).user;
  let filteredTransactions = [...mockTransactions];

  // Apply role-based filtering
  if (user.role === "admin") {
    filteredTransactions = filteredTransactions.filter((t) =>
      user.assignedStates?.includes(t.stateId)
    );
  } else if (user.role === "lga_admin") {
    filteredTransactions = filteredTransactions.filter((t) =>
      user.assignedLgas?.includes(t.lgaId)
    );
  }

  // Apply filters
  if (filters.type) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.type === filters.type
    );
  }

  if (filters.status) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.status === filters.status
    );
  }

  if (filters.stateId) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.stateId === filters.stateId
    );
  }

  if (filters.lgaId) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.lgaId === filters.lgaId
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (t) =>
        t.vehiclePlateNumber.toLowerCase().includes(searchLower) ||
        t.reference.toLowerCase().includes(searchLower) ||
        t.vehicleId.toLowerCase().includes(searchLower)
    );
  }

  if (filters.dateRange) {
    filteredTransactions = filteredTransactions.filter((t) => {
      const transactionDate = new Date(t.timestamp);
      const fromDate = new Date(filters.dateRange!.from);
      const toDate = new Date(filters.dateRange!.to);
      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    filteredTransactions.sort((a, b) => {
      let aValue: any, bValue: any;

      if (filters.sortBy === "timestamp") {
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
      } else if (filters.sortBy === "amount") {
        aValue = a.amount;
        bValue = b.amount;
      }

      if (filters.sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }

  // Calculate stats
  const stats: TransactionStats = {
    totalTransactions: filteredTransactions.length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    successfulTransactions: filteredTransactions.filter(
      (t) => t.status === "success"
    ).length,
    failedTransactions: filteredTransactions.filter(
      (t) => t.status === "failed"
    ).length,
    pendingTransactions: filteredTransactions.filter(
      (t) => t.status === "pending"
    ).length,
    byType: {},
    byStatus: {},
  };

  // Calculate by type
  filteredTransactions.forEach((t) => {
    stats.byType[t.type] = (stats.byType[t.type] || 0) + 1;
    stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
  });

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + limit
  );

  return {
    transactions: paginatedTransactions,
    total: filteredTransactions.length,
    stats,
  };
}

export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user: any = (await getMe()).user;
  const transaction = mockTransactions.find((t) => t.id === id);

  if (!transaction) return null;

  // Check access permissions
  if (
    user.role === "admin" &&
    !user.assignedStates?.includes(transaction.stateId)
  ) {
    return null;
  }

  if (
    user.role === "lga_admin" &&
    !user.assignedLgas?.includes(transaction.lgaId)
  ) {
    return null;
  }

  return transaction;
}

export async function getTransactionAuditLog(
  transactionId: string
): Promise<AuditLogEntry[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return mockAuditLogs[transactionId] || [];
}

export async function exportTransactions(
  filters: TransactionFilters = {}
): Promise<string> {
  // Simulate export process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { transactions } = await getTransactions(filters);

  // Create CSV content
  const headers = [
    "Reference",
    "Vehicle Plate",
    "Amount",
    "Type",
    "Status",
    "LGA",
    "Date",
  ];
  const csvContent = [
    headers.join(","),
    ...transactions.map((t) =>
      [
        t.reference,
        t.vehiclePlateNumber,
        t.amount,
        t.type,
        t.status,
        t.lgaName,
        new Date(t.timestamp).toLocaleDateString(),
      ].join(",")
    ),
  ].join("\n");

  // Create blob URL for download
  const blob = new Blob([csvContent], { type: "text/csv" });
  return URL.createObjectURL(blob);
}
