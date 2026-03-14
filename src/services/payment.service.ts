import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { Payment } from "@/types";
import { calculatePaymentDistribution } from "@/utils/helpers";

export class PaymentService {
  static async createPaymentIntent(
    claimId: string,
    amount: number
  ): Promise<string> {
    const { finder, platform } = calculatePaymentDistribution(amount);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "brl",
      metadata: {
        claimId,
      },
    });

    // Store payment record
    const { error } = await supabase
      .from("payments")
      .insert([
        {
          claim_id: claimId,
          total_amount: amount,
          finder_amount: finder,
          platform_fee: platform,
          status: "pending",
          provider: "stripe",
          stripe_payment_intent_id: paymentIntent.id,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create payment record: ${error.message}`);

    return paymentIntent.client_secret || "";
  }

  static async confirmPayment(paymentIntentId: string): Promise<Payment> {
    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }

    // Update payment record
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        transaction_id: paymentIntentId,
      })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update payment: ${error.message}`);

    // Update claim status
    const claimId = data.claim_id;
    await supabase
      .from("claims")
      .update({ payment_status: "completed" })
      .eq("id", claimId);

    return data;
  }

  static async getPayment(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching payment:", error);
    }

    return data || null;
  }

  static async getUserPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*, claims(finder_id, owner_id)")
      .filter("claims.finder_id", "eq", userId)
      .or(`claims.owner_id.eq.${userId}`);

    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);

    return data || [];
  }

  static async processRefund(paymentId: string): Promise<void> {
    const payment = await this.getPayment(paymentId);
    if (!payment) throw new Error("Payment not found");

    if (!payment.transaction_id) throw new Error("No transaction to refund");

    // Create refund with Stripe
    await stripe.refunds.create({
      payment_intent: payment.transaction_id,
    });

    // Update payment status
    await supabase
      .from("payments")
      .update({ status: "refunded" })
      .eq("id", paymentId);
  }
}
