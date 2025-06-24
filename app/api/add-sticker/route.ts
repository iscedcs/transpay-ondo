import { auth } from "@/auth";
import { API, URLS } from "@/lib/const";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  const url = `${API}${URLS.vehicle.sticker}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        code: body.code,
        vehicleId: body.id,
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
