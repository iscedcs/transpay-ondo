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
                              contains: "Fair Flex Device Installation",
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
                         AND: [
                              {
                                   createdAt: {
                                        gte: today,
                                   },
                                   revenueName: {
                                        contains: "Fair Flex Device Installation",
                                   },
                              },
                         ],
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
