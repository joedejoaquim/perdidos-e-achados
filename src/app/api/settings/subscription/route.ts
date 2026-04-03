import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// GET — busca assinatura atual do utilizador
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ success: true, data: { plan: "free", status: "inactive" } });
    }
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — cria sessão de checkout Stripe
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userRow } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", session.user.id)
      .single();

    // Busca ou cria customer no Stripe
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userRow?.email || session.user.email || "",
        name: userRow?.name || "",
        metadata: { user_id: session.user.id },
      });
      customerId = customer.id;
      await supabase.from("subscriptions").upsert(
        { user_id: session.user.id, stripe_customer_id: customerId, plan: "free", status: "inactive" },
        { onConflict: "user_id" }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/settings?tab=assinatura&success=1`,
      cancel_url: `${APP_URL}/dashboard/settings?tab=assinatura`,
      metadata: { user_id: session.user.id },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — cancela assinatura no fim do período
export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", session.user.id)
      .single();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq("user_id", session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
