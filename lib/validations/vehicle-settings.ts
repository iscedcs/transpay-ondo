import { z } from "zod"

export const createVehicleSettingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  isActive: z.boolean().optional().default(false),
})

export const updateVehicleSettingSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
})

export const vehicleExemptionSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID format"),
})

export type CreateVehicleSettingFormData = z.infer<typeof createVehicleSettingSchema>
export type UpdateVehicleSettingFormData = z.infer<typeof updateVehicleSettingSchema>
export type VehicleExemptionFormData = z.infer<typeof vehicleExemptionSchema>
