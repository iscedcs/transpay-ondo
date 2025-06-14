import type {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleStickerData,
  VehicleFilters,
  VehicleStats,
} from "@/types/vehicles"

// Mock data - replace with actual API calls
export async function getVehicles(filters: VehicleFilters = {}): Promise<{
  vehicles: Vehicle[]
  total: number
  page: number
  pageSize: number
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockVehicles: Vehicle[] = [];

  let filteredVehicles = mockVehicles

  // Apply filters
  if (filters.category) {
    filteredVehicles = filteredVehicles.filter((v) => v.category === filters.category)
  }
  if (filters.status) {
    filteredVehicles = filteredVehicles.filter((v) => v.status === filters.status)
  }
  if (filters.complianceStatus) {
    filteredVehicles = filteredVehicles.filter((v) => v.complianceStatus === filters.complianceStatus)
  }
  if (filters.stateCode) {
    filteredVehicles = filteredVehicles.filter((v) => v.stateCode === filters.stateCode)
  }
  if (filters.lgaId) {
    filteredVehicles = filteredVehicles.filter((v) => v.lgaId === filters.lgaId)
  }
  if (filters.blacklisted !== undefined) {
    filteredVehicles = filteredVehicles.filter((v) => v.blacklisted === filters.blacklisted)
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredVehicles = filteredVehicles.filter(
      (v) =>
        v.plateNumber.toLowerCase().includes(searchLower) ||
        v.owner.firstName.toLowerCase().includes(searchLower) ||
        v.owner.lastName.toLowerCase().includes(searchLower) ||
        v.type.toLowerCase().includes(searchLower),
    )
  }

  return {
    vehicles: filteredVehicles,
    total: filteredVehicles.length,
    page: 1,
    pageSize: 10,
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { vehicles } = await getVehicles()
  return vehicles.find((vehicle) => vehicle.id === id) || null
}

export async function getVehicleStats(): Promise<VehicleStats> {
  const { vehicles } = await getVehicles()

  return {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "ACTIVE").length,
    compliant: vehicles.filter((v) => v.complianceStatus === "compliant").length,
    nonCompliant: vehicles.filter((v) => v.complianceStatus === "non_compliant").length,
    blacklisted: vehicles.filter((v) => v.blacklisted).length,
    pendingVerification: vehicles.filter((v) => v.status === "PENDING_VERIFICATION").length,
  }
}

export async function createVehicle(data: CreateVehicleData): Promise<Vehicle> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newVehicle: Vehicle = {
    id: `vehicle_${Date.now()}`,
    ...data,
    blacklisted: data.blacklisted || false,
    noBalanceUpdate: data.noBalanceUpdate || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    complianceStatus: "non_compliant", // Default until first payment
  }

  return newVehicle
}

export async function updateVehicle(id: string, data: UpdateVehicleData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log(`Updated vehicle ${id}:`, data)
}

export async function updateVehicleSticker(id: string, data: VehicleStickerData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  console.log(`Updated vehicle sticker ${id}:`, data)
}

export async function deleteVehicle(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log(`Deleted vehicle ${id}`)
}

export async function generateQRCode(vehicleId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  // In real implementation, this would call QR code generation service
  return `QR_${vehicleId}_${Date.now()}`
}
