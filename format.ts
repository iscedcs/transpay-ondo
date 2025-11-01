// Format currency in Nigerian Naira
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Calculate commission
export function calculateCommission(
  amount: number,
  rate: number,
  agentShare: number,
  agencyShare: number
) {
  const totalCommission = (amount * rate) / 100;
  const agentCommission = (totalCommission * agentShare) / 100;
  const agencyCommission = (totalCommission * agencyShare) / 100;

  return {
    totalCommission,
    agentCommission,
    agencyCommission,
  };
}

// Calculate payable amount for Mode A (discounted)
export function calculatePayableAmountModeA(
  amount: number,
  commissionRate: number
): number {
  const commission = (amount * commissionRate) / 100;
  return amount - commission;
}

// Calculate payable amount for Mode B (full amount)
export function calculatePayableAmountModeB(amount: number): number {
  return amount;
}
