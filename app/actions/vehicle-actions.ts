"use server";

import { db } from "@/lib/db";

type CheckResult = {
     exists: boolean;
     field: string;
     value: string;
     vehicle: Partial<any> | null;
};

export async function checkExistingVehicle(field: string, value: string): Promise<CheckResult> {
     if (value.length < 4) {
          return { exists: false, field, value, vehicle: null };
     }

     try {
       const existingVehicle = await db.vehicle.findFirst({
         where: {
           [field]: value,
           deletedAt: null, // Assuming we want to exclude soft-deleted vehicles
         },
         select: {
           id: true,
           [field]: true,
           User: true,
           VehicleGroup: {
             select: {
               groupName: true,
               id: true,
             },
           },
         },
       });

       return {
         exists: !!existingVehicle,
         field,
         value,
         vehicle: existingVehicle ? existingVehicle : null,
       };
     } catch (error) {
       throw new Error(`Failed to check existing vehicle for ${field}`);
     }
}

