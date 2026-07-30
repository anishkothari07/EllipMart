import { NextRequest, NextResponse } from "next/server";
import { PincodeService } from '@corecart/shared/src/localization/pincode.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, error: "Invalid PIN code. Must be a 6-digit number." },
        { status: 400 }
      );
    }

    const info = await PincodeService.lookup(code);
    const promise = await PincodeService.getDeliveryPromise(code);

    return NextResponse.json({
      success: true,
      data: {
        ...info,
        promise,
      },
    });
  } catch (error: any) {
    console.error("Failed to lookup PIN code:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
