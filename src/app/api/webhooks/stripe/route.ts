import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import Stripe from "stripe";
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
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const { data: payment } = await supabase
        .from("payments")
        .select("*, claims(finder_id)")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({ status: "completed", transaction_id: paymentIntent.id })
          .eq("id", payment.id);

        await supabase
          .from("claims")
          .update({ payment_status: "completed" })
          .eq("id", payment.claim_id);

        const finderId = payment.claims.finder_id;
        await GamificationService.rewardDelivery(finderId);
      }
    }

    // Handle subscription activated / renewed
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const { data: existing } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (existing) {
        await supabase.from("subscriptions").update({
          stripe_subscription_id: sub.id,
          plan: sub.status === "active" ? "pro" : "free",
          status: sub.status as string,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);
      }
    }

    // Handle subscription deleted / expired
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase.from("subscriptions").update({
        plan: "free",
        status: "cancelled",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq("stripe_customer_id", customerId);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
