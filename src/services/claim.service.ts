import { supabase } from "@/lib/supabase";
import { Claim } from "@/types";

export class ClaimService {
  static async createClaim(itemId: string, ownerId: string): Promise<Claim> {
    // Get item to find finder
    const { data: item, error: itemError } = await supabase
      .from("found_items")
      .select("finder_id")
      .eq("id", itemId)
      .single();

    if (itemError) throw new Error("Item not found");

    const { data, error } = await supabase
      .from("claims")
      .insert([
        {
          item_id: itemId,
          owner_id: ownerId,
          finder_id: item.finder_id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create claim: ${error.message}`);

    return data;
  }

  static async getClaim(claimId: string): Promise<Claim | null> {
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .eq("id", claimId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching claim:", error);
    }

    return data || null;
  }

  static async updateClaim(claimId: string, updates: Partial<Claim>): Promise<Claim> {
    const { data, error } = await supabase
      .from("claims")
      .update(updates)
      .eq("id", claimId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update claim: ${error.message}`);

    return data;
  }

  static async getClaimsByUser(
    userId: string,
    role: "finder" | "owner" | "both" = "both"
  ): Promise<Claim[]> {
    let query = supabase.from("claims").select("*");

    if (role === "finder") {
      query = query.eq("finder_id", userId);
    } else if (role === "owner") {
      query = query.eq("owner_id", userId);
    } else {
      query = query.or(`finder_id.eq.${userId},owner_id.eq.${userId}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch claims: ${error.message}`);

    return data || [];
  }

  static async acceptClaim(claimId: string): Promise<Claim> {
    return this.updateClaim(claimId, { status: "accepted" });
  }

  static async markInDelivery(claimId: string): Promise<Claim> {
    return this.updateClaim(claimId, { status: "in_delivery" });
  }

  static async completeClaim(claimId: string): Promise<Claim> {
    const claim = await this.getClaim(claimId);
    if (!claim) throw new Error("Claim not found");

    if (claim.payment_status !== "completed") {
      throw new Error("Payment must be completed before marking as delivered");
    }

    return this.updateClaim(claimId, { status: "completed" });
  }

  static async cancelClaim(claimId: string): Promise<Claim> {
    return this.updateClaim(claimId, { status: "cancelled" });
  }

  static async getPendingClaims(finderId: string): Promise<Claim[]> {
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .eq("finder_id", finderId)
      .eq("status", "pending");

    if (error) throw new Error(`Failed to fetch pending claims: ${error.message}`);

    return data || [];
  }
}
