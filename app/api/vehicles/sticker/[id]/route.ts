import { auth } from "@/auth";
import { API } from "@/lib/const";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();

    // Validate request body
    if (!body.barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    const token = session?.user.access_token;

    // Validate barcode format
    if (!/^\d{10,}$/.test(body.barcode)) {
      return NextResponse.json(
        { error: "Barcode must be a numeric value with at least 10 digits" },
        { status: 400 }
      );
    }

    // Make request to external API
    const response = await fetch(`${API}/api/vehicles/sticker/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update vehicle sticker" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
