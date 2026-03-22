import { supabase } from "@/lib/supabase";
import { UserService } from "./user.service";
import { calculateLevel } from "@/utils/helpers";

export class GamificationService {
  // XP Constants
  private static readonly XP_VALUES = {
    REGISTER_ITEM: 20,
    DELIVERY_COMPLETED: 100,
    POSITIVE_RATING: 10,
    "5_STAR_RATING": 25,
    FIRST_ITEM: 50,
  };

  static async addXpReward(userId: string, type: string): Promise<number> {
    const xpAmount = (this.XP_VALUES as Record<string, number>)[type] || 0;

    if (xpAmount > 0) {
      await UserService.addXp(userId, xpAmount);

      // Log activity
      await supabase.from("activities").insert([
        {
          user_id: userId,
          type: "reward_received",
          description: `Ganhou ${xpAmount} XP`,
          value: xpAmount,
        },
      ]);
    }

    return xpAmount;
  }

  static async rewardItemRegistration(userId: string): Promise<void> {
    await this.addXpReward(userId, "REGISTER_ITEM");

    // Check if this is first item
    const items = await supabase
      .from("found_items")
      .select("id")
      .eq("finder_id", userId);

    if (items.data?.length === 1) {
      await this.awardBadge(userId, "Primeiro Item");
      await this.addXpReward(userId, "FIRST_ITEM");
    }
  }

  static async rewardDelivery(userId: string): Promise<void> {
    await this.addXpReward(userId, "DELIVERY_COMPLETED");

    // Check milestone badges
    const claims = await supabase
      .from("claims")
      .select("id")
      .eq("finder_id", userId)
      .eq("status", "completed");

    const claimCount = claims.data?.length || 0;

    if (claimCount === 5) {
      await this.awardBadge(userId, "Bom Samaritano");
    } else if (claimCount === 25) {
      await this.awardBadge(userId, "Super Localizador");
    }
  }

  static async rewardRating(userId: string, rating: number): Promise<void> {
    if (rating === 5) {
      await this.addXpReward(userId, "5_STAR_RATING");

      // Check 5-star badge
      const ratings = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "reward_received")
        .contains("description", "5 estrelas");

      if ((ratings.data?.length || 0) >= 5) {
        await this.awardBadge(userId, "Herói do Dia");
      }
    } else {
      await this.addXpReward(userId, "POSITIVE_RATING");
    }
  }

  static async awardBadge(userId: string, badgeName: string): Promise<void> {
    // Get badge
    const { data: badge, error: badgeError } = await supabase
      .from("badges")
      .select("id")
      .eq("name", badgeName)
      .single();

    if (badgeError || !badge) return;

    // Check if user already has badge
    const { data: existing } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badge.id)
      .single();

    if (existing) return; // Already has badge

    // Award badge
    const { error } = await supabase.from("user_badges").insert([
      {
        user_id: userId,
        badge_id: badge.id,
      },
    ]);

    if (!error) {
      // Log activity
      await supabase.from("activities").insert([
        {
          user_id: userId,
          type: "badge_earned",
          description: `Conquistou badge "${badgeName}"`,
          value: 0,
        },
      ]);
    }
  }

  static async checkLevelUp(userId: string): Promise<boolean> {
    const user = await UserService.getUser(userId);
    if (!user) return false;

    const newLevel = calculateLevel(user.xp);

    if (newLevel !== user.level) {
      await UserService.updateUser(userId, { level: newLevel as import("@/types").UserLevel });

      // Log activity
      await supabase.from("activities").insert([
        {
          user_id: userId,
          type: "level_up",
          description: `Alcançou nível ${newLevel}`,
          value: 1,
        },
      ]);

      return true;
    }

    return false;
  }

  static async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to fetch badges: ${error.message}`);

    return data || [];
  }

  static async getRanking(limit: number = 10): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, avatar_url, xp, level, rank_position")
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch ranking: ${error.message}`);

    return data || [];
  }

  static async getLeaderboard(filters?: { level?: string; city?: string }) {
    let query = supabase.from("users").select("*");

    if (filters?.level) query = query.eq("level", filters.level);

    const { data, error } = await query.order("xp", { ascending: false }).limit(100);

    if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`);

    return data || [];
  }
}
