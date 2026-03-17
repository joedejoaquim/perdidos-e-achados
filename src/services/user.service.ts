import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export class UserService {
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user by email:", error);
    }

    return data || null;
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);

    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);

    return data;
  }

  static async addXp(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newXp = user.xp + amount;
    await this.updateUser(userId, { xp: newXp });
  }

  static async getRanking(limit: number = 10, offset: number = 0): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("xp", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch ranking: ${error.message}`);

    return data || [];
  }

  static async getUserStats(userId: string) {
    const { data, error } = await supabase.rpc("get_user_stats", {
      user_id: userId,
    });

    if (error) throw new Error(`Failed to fetch user stats: ${error.message}`);

    return data;
  }

  static async verifyKyc(userId: string, kycData: Record<string, unknown>): Promise<void> {
    // This would typically call an external KYC service
    // For now, we'll just update the user
    await this.updateUser(userId, {
      kyc_status: "pending",
      kyc_data: kycData,
    });
  }
}
