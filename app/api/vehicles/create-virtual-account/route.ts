import { NextResponse } from "next/server";
import { createVehicleVirtualAccount } from "@/actions/vehicles";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletId, bvn, dob } = body;

    if (!walletId) {
      return NextResponse.json(
        { success: false, message: "Wallet ID is required" },
        { status: 400 }
      );
    }

    if (!bvn) {
      return NextResponse.json(
        { success: false, message: "BVN is required" },
        { status: 400 }
      );
    }

    if (!dob) {
      return NextResponse.json(
        { success: false, message: "Date of birth is required" },
        { status: 400 }
      );
    }

    // Call the server action to create the virtual account
    const result = await createVehicleVirtualAccount({
      walletId,
      bvn,
      dob,
    });

    return NextResponse.json({
      success: true,
      message: "Virtual account created successfully",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create virtual account",
      },
      { status: 500 }
    );
  }
}
