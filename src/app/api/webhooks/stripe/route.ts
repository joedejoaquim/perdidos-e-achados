import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import { stripe } from "@/lib/stripe";

import { GamificationService } from "@/services/gamification.service";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Handle payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as any;

      // Get payment record
      const { data: payment } = await supabase
        .from("payments")
        .select("*, claims(finder_id)")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (payment) {
        // Update payment status
        await supabase
          .from("payments")
          .update({ status: "completed", transaction_id: paymentIntent.id })
          .eq("id", payment.id);

        // Update claim status
        await supabase
          .from("claims")
          .update({ payment_status: "completed" })
          .eq("id", payment.claim_id);

        // Reward finder
        const finderId = payment.claims.finder_id;
        await GamificationService.rewardDelivery(finderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
