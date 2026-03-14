import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import { supabase } from "@/lib/supabase";
import { ClaimService } from "@/services/claim.service";
import { PaymentService } from "@/services/payment.service";

export async function GET() {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await ClaimService.getClaimsByUser(authUser.id, "both");

    return NextResponse.json({ success: true, data: claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { item_id, amount } = body;

    if (!item_id || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


    // Create payment intent
    const clientSecret = await PaymentService.createPaymentIntent(
      item_id,
      amount
    );

    // Create claim
    const claim = await ClaimService.createClaim(item_id, authUser.id);

    return NextResponse.json(
      { success: true, data: { claim, clientSecret } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating claim:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
