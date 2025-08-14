export enum VehicleSettings {
  NO_STICKER_PAYMENT = "NO_STICKER_PAYMENT",
  NO_CVOF_PAYMENT = "NO_CVOF_PAYMENT",
  NO_FAREFLEX_PAYMENT = "NO_FAREFLEX_PAYMENT",
  NO_CVOF_ALL = "NO_CVOF_ALL",
}

export interface VehicleSetting {
  id: string
  name: string
  description: string
  totalVehicles: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  vehicles?: Vehicle[]
}

export interface Vehicle {
  id: string
  plateNumber: string
  model: string
  make: string
}

export interface CreateVehicleSettingRequest {
  name: string
  description: string
  isActive?: boolean
}

export interface UpdateVehicleSettingRequest {
  description: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  rows: T[]
  meta: {
    total: number
    total_pages: number
    page: number
  }
}

export interface VehicleExemptionStatus {
  vehicleId: string
  isExempted: boolean
  reason: string
  exemptionType: string
}
