"use server";

import { db } from "@/lib/db";

export const getAgentRegisteredByAdminId = async ({ userId, page = 1, pageSize = 10 }: { userId: string; page?: number; pageSize?: number }) => {
     try {
          const skip = (page - 1) * pageSize;

          const allAgentsByAdminId = await db.auditTrail.findMany({
               skip,
               take: pageSize,
               where: {
                    userId,
                    name: "USER_CREATED",
                    description: {
                         contains: "AGENT",
                    },
               },
          });

          const totalAgents = await db.auditTrail.count({
               where: {
                    userId,
                    name: "USER_CREATED",
                    description: {
                         contains: "AGENT",
                    },
               },
          });
          return {
               success: {
                    message: "OKAY",
                    data: allAgentsByAdminId,
                    totalAgents, // Total count of users with the current filter
                    currentPage: page,
                    totalPages: Math.ceil(totalAgents / pageSize), // Calculate total pages for front-end
               },
          };
     } catch (error) {
       return { error: "Something went wrong!!!" };
     }
};

export const getVehicleRegistrar = async (plateNumber: string) => {
     try {
          const audit = await db.auditTrail.findFirst({
               where: {
                    description: {
                         contains: plateNumber,
                    },
               },
          });
          return audit;
     } catch (error) {
          return undefined;
     }
};

export const getVehicleRegistrarCreated = async (plateNumber: string) => {
     try {
          const audit = await db.auditTrail.findFirst({
               where: {
                    AND: [{ name: { contains: "VEHICLE_CREATED" } }, { description: { contains: plateNumber } }],
               },
          });
          return audit;
     } catch (error) {
          return undefined;
     }
};

export const getVehicleRegistrarUpdated = async (plateNumber: string) => {
     try {
          const audit = await db.auditTrail.findFirst({
               where: {
                    AND: [{ name: { contains: "VEHICLE_UPDATED" } }, { description: { contains: plateNumber } }],
               },
          });
          return audit;  
     } catch (error) {
          return undefined;
     }
};

export const getAllActivites = async () => {
     const allActivites = await db.auditTrail.count();
     return allActivites;
};

export const getActivities = async (page: number, limit: number) => {
     const activities = await db.auditTrail.findMany({
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
               createdAt: "desc",
          },
     });
     return activities;
};

export const getActivitiesById = async ({ id }: { id: string }) => {
     const singleActivities = await db.auditTrail.findUnique({
          where: { id: id },
     });
     return singleActivities;
};
export const getAllActivitiesById = async (userId: string) => {
     try {
          const audit = await db.auditTrail.findMany({
               where: {
                    userId,
               },
          });
          return audit;
     } catch (error) {
          return undefined;
     }
};
