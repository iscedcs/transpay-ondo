"use client";

import { z } from "zod";

// Owner information validation schema
// export const ownerFormSchema = z.object({
//   // Basic Information
//   firstName: z
//     .string()
//     .min(1, "First name is required")
//     .max(50, "First name must not exceed 50 characters"),
//   lastName: z
//     .string()
//     .min(1, "Last name is required")
//     .max(50, "Last name must not exceed 50 characters"),
//   phone: z
//     .string()
//     .min(1, "Phone number is required")
//     .regex(/^\+234\d{10}$/, "Please enter a valid Nigerian phone number"),
//   gender: z.enum(["MALE", "FEMALE", "OTHERS"], {
//     required_error: "Please select a gender",
//   }),
//   maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
//     required_error: "Please select marital status",
//   }),
//   email: z.string().email().optional(),
//   whatsappNumber: z.string().optional(),
//   maidenName: z.string().optional(),

//   // Address Information
//   residentialAddress: z.string().min(1, "Residential address is required"),
//   city: z.string().min(1, "City is required"),
//   lgaId: z.string().min(1, "LGA is required"),
//   country: z.string().default("Nigeria"),
//   postalCode: z.string().optional(),
// });

export const ownerFormSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHERS"], {
    required_error: "Please select a gender",
  }),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
    required_error: "Please select marital status",
  }),
  whatsappNumber: z.string().optional(),
  maidenName: z.string().optional(),
  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinPhone: z
    .string()
    .min(1, "Next of kin phone is required")
    .regex(/^\+234\d{10}$/, "Please enter a valid Nigerian phone number"),
  nextOfKinRelationship: z.string().min(1, "Relationship is required"),
});

export const driverFormSchema = z.object({
  // Basic Information
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+234\d{10}$/, "Please enter a valid Nigerian phone number"),
  // Address Information
  residentialAddress: z.string().min(1, "Residential address is required"),
  city: z.string().min(1, "City is required"),
  lgaId: z.string().min(1, "LGA is required"),
  country: z.string().default("Nigeria"),
  postalCode: z.string().optional(),
  email: z.string().email().optional(),
});

// Next of kin validation schema
// export const nextOfKinSchema = z.object({
//   name: z.string().min(1, "Next of kin name is required"),
//   phone: z
//     .string()
//     .min(1, "Next of kin phone is required")
//     .regex(/^\+234\d{10}$/, "Please enter a valid Nigerian phone number"),
//   relationship: z.string().min(1, "Relationship is required"),
// });

// Vehicle form validation schema
export const vehicleFormSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  category: z.string().min(1, "Category is required"),
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"])
    .default("ACTIVE"),
  registeredLgaId: z.string().min(1, "LGA is required"),
  vin: z.string().optional(),
  image: z.string().optional(),
  blacklisted: z.boolean().default(false),
});

// Complete registration schema
export const completeRegistrationSchema = z.object({
  owner: ownerFormSchema,
  nextOfKin: driverFormSchema,
  vehicle: vehicleFormSchema,
  createVirtualAccount: z.boolean().default(false),
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;
export type DriverFormValues = z.infer<typeof driverFormSchema>;
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
export type CompleteRegistrationValues = z.infer<
  typeof completeRegistrationSchema
>;

// Form field options
export const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export const maritalStatusOptions = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
];

export const vehicleStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const vehicleCategoryOptions = [
  { value: "TRICYCLE", label: "Tricycle" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "CAR", label: "Car" },
  { value: "TRUCK", label: "Truck" },
  { value: "BUS", label: "Bus" },
  { value: "VAN", label: "Van" },
  { value: "TAXI", label: "Taxi" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PRIVATE", label: "Private" },
];

export interface CreateVehicleRequest {
  category: string;
  plateNumber: string;
  owner: {
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      text: string;
      lga: string;
      city: string;
      state: string;
      unit: string;
      country: string;
      postal_code?: string;
    };
    gender: string;
    marital_status: string;
    whatsapp?: string;
    email?: string;
    nok_name: string;
    nok_phone: string;
    nok_relationship: string;
    maiden_name?: string;
    dateOfBirth?: string;
  };
  lgaId: string;
  image?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  vin?: string;
  blacklisted?: boolean;
}
