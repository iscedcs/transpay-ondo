import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
     try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const [payments, dailyTotal] = await Promise.all([
               db.paymentNotification.findMany({
                    select: {
                         id: true,
                         amount: true,
                         customerName: true,
                         createdAt: true,
                         revenueName: true,
                    },
                    where: {
                         revenueName: {
                              contains: "Device Maintenance & Service Charge",
                         },
                    },
                    take: 16,
                    orderBy: {
                         createdAt: "desc",
                    },
               }),
               db.paymentNotification.aggregate({
                    _sum: {
                         amount: true,
                    },
                    where: {
                         createdAt: {
                              gte: today,
                         },
                    },
               }),
          ]);

          return NextResponse.json({
               payments,
               dailyTotal: dailyTotal._sum.amount || 0,
          });
     } catch (error) {
       return NextResponse.json(
         { error: "Internal Server Error" },
         { status: 500 }
       );
     }
}
