import { API, URLS } from "@/lib/const";
import { getSSession } from "@/lib/get-data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
     const { access_token } = await getSSession();
    const body = await req.json();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${access_token}`,
     };
     const url = `${API}${URLS.vehicle.request}`;

     try {
          const response = await fetch(url, {
               method: "POST",
               headers,
               body: JSON.stringify({
                    asin: body.asin,
                    plateNumber: body.plateNumber
                }),
          });
          const result = await response.json();
          if (!response.ok) {
               return NextResponse.json(result.errors, {
                    status: result.status_code,
               });
          } else {
               return NextResponse.json(result);
          }
     } catch (error: any) {
          return NextResponse.json(error, { status: 500 });
     }
}
