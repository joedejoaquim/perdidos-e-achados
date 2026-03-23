import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { calculatePaymentDistribution } from "@/utils/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await authSupabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = supabaseAdmin ?? authSupabase;
    const { data: claims, error } = await client
      .from("claims")
      .select("*")
      .or(`finder_id.eq.${authUser.id},owner_id.eq.${authUser.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await authSupabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = supabaseAdmin ?? authSupabase;
    const body = await req.json();
    const { item_id, amount } = body ?? {};

    if (!item_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: item, error: itemError } = await client
      .from("found_items")
      .select("id, finder_id, title, status, reward_value")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item nao encontrado." }, { status: 404 });
    }

    const { data: existingClaim } = await client
      .from("claims")
      .select("id, status")
      .eq("item_id", item_id)
      .eq("owner_id", authUser.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json(
        { error: "Voce ja possui uma solicitacao para este item." },
        { status: 409 }
      );
    }

    const normalizedAmount = Number(amount ?? item.reward_value ?? 0);
    const { data: claim, error: claimError } = await authSupabase
      .from("claims")
      .insert([
        {
          item_id,
          owner_id: authUser.id,
          finder_id: item.finder_id,
          status: "pending",
          payment_status: normalizedAmount > 0 ? "pending" : "completed",
        },
      ])
      .select("*")
      .single();

    if (claimError || !claim) {
      throw claimError ?? new Error("Falha ao criar solicitacao");
    }

    if (supabaseAdmin) {
      const { error: updateItemError } = await supabaseAdmin
        .from("found_items")
        .update({ status: "claimed" })
        .eq("id", item_id);

      if (updateItemError) {
        console.error("Error updating found item status:", updateItemError);
      }
    }

    let clientSecret: string | null = null;
    let warning: string | null = null;

    if (normalizedAmount > 0 && supabaseAdmin && process.env.STRIPE_SECRET_KEY) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(normalizedAmount * 100),
          currency: "brl",
          metadata: {
            claimId: claim.id,
            itemId: item_id,
          },
        });
        const { finder, platform } = calculatePaymentDistribution(normalizedAmount);
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from("payments")
          .insert([
            {
              claim_id: claim.id,
              total_amount: normalizedAmount,
              finder_amount: finder,
              platform_fee: platform,
              status: "processing",
              provider: "stripe",
              stripe_payment_intent_id: paymentIntent.id,
            },
          ])
          .select("*")
          .single();

        if (paymentError || !payment) {
          throw paymentError ?? new Error("Falha ao criar pagamento");
        }

        const { error: claimUpdateError } = await supabaseAdmin
          .from("claims")
          .update({
            payment_id: payment.id,
            payment_status: "processing",
          })
          .eq("id", claim.id);

        if (claimUpdateError) {
          console.error("Error updating claim payment status:", claimUpdateError);
        }

        clientSecret = paymentIntent.client_secret ?? null;
      } catch (paymentError) {
        console.error("Error creating payment intent:", paymentError);
        warning =
          "A solicitacao foi criada, mas o pagamento protegido nao foi inicializado.";
      }
    }

    return NextResponse.json(
      { success: true, data: { claim, clientSecret }, warning },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating claim:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
