import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const ITEM_SELECT =
  "id, title, description, photo_url, city, state, category, status, reward_value, created_at, updated_at";

 type ItemFilters = {
  category: string;
  city: string;
  q: string;
  status: string;
 };
 
 type FoundItemRow = {
   id: string;
   title: string;
   description: string | null;
   photo_url: string | null;
   city: string | null;
   state: string | null;
   category: string;
   status: string;
   reward_value: number | string | null;
   created_at: string;
   updated_at: string;
 };
 
 type ClaimRow = {
   id: string;
   item_id: string;
   status: string;
   payment_status: string;
   created_at: string;
   updated_at: string;
 };

function normalizeFilter(value: string | null) {
  return value?.trim() ?? "";
}

function applyItemFilters(query: any, filters: ItemFilters) {
  const normalizedQuery = filters.q.replace(/[,%]/g, " ").trim();

  if (normalizedQuery) {
    query = query.or(
      `title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,city.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%`
    );
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  return query;
}

 function mapItemRecord(item: FoundItemRow, ownerClaim?: ClaimRow) {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    photoUrl: item.photo_url ?? null,
    city: item.city ?? "",
    state: item.state ?? "",
    category: item.category,
    status: item.status,
    rewardValue: Number(item.reward_value ?? 0),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    ownerClaim: ownerClaim
      ? {
          id: ownerClaim.id,
          status: ownerClaim.status,
          paymentStatus: ownerClaim.payment_status,
          createdAt: ownerClaim.created_at,
          updatedAt: ownerClaim.updated_at,
        }
      : null,
  };
}

 function mapClaimRecord(claim: ClaimRow, item: FoundItemRow | null) {
  return {
    id: claim.id,
    itemId: claim.item_id,
    status: claim.status,
    paymentStatus: claim.payment_status,
    createdAt: claim.created_at,
    updatedAt: claim.updated_at,
    item: item ? mapItemRecord(item) : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    // Use getSession() for speed — the middleware already validated the user
    const {
      data: { session },
    } = await authSupabase.auth.getSession();

    const authUser = session?.user;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = supabaseAdmin ?? authSupabase;
    const { searchParams } = new URL(req.url);
    const filters: ItemFilters = {
      q: normalizeFilter(searchParams.get("q")),
      category: normalizeFilter(searchParams.get("category")),
      city: normalizeFilter(searchParams.get("city")),
      status: normalizeFilter(searchParams.get("status")),
    };

    const itemsQuery = applyItemFilters(
      client.from("found_items").select(ITEM_SELECT).order("created_at", { ascending: false }),
      filters
    );
    const itemsCountQuery = applyItemFilters(
      client.from("found_items").select("id", { count: "exact", head: true }),
      filters
    );
    const claimsQuery = client
      .from("claims")
      .select("id, item_id, status, payment_status, created_at, updated_at")
      .eq("owner_id", authUser.id)
      .order("created_at", { ascending: false });
    const lostItemsCountQuery = client
      .from("lost_items")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", authUser.id);

    const [
      { data: items, error: itemsError },
      { count: matchingItemsCount, error: itemsCountError },
      { data: claims, error: claimsError },
      { count: reportedLostItemsCount, error: lostItemsCountError },
    ] = await Promise.all([
      itemsQuery,
      itemsCountQuery,
      claimsQuery,
      lostItemsCountQuery,
    ]);

    if (itemsError) {
      throw itemsError;
    }

    if (itemsCountError) {
      throw itemsCountError;
    }

    if (claimsError) {
      throw claimsError;
    }

    if (lostItemsCountError) {
      console.error("Error fetching owner reports count:", lostItemsCountError);
    }

     const resolvedItems: FoundItemRow[] = items ?? [];
     const resolvedClaims: ClaimRow[] = claims ?? [];
     const claimByItemId = new Map<string, ClaimRow>();

    for (const claim of resolvedClaims) {
      if (!claimByItemId.has(claim.item_id)) {
        claimByItemId.set(claim.item_id, claim);
      }
    }

     const itemById = new Map<string, FoundItemRow>(
       resolvedItems.map((item: FoundItemRow) => [item.id, item] as const)
     );
    const missingClaimItemIds = Array.from(
      new Set(
        resolvedClaims
          .map((claim) => claim.item_id)
          .filter((itemId) => itemId && !itemById.has(itemId))
      )
    );

    if (missingClaimItemIds.length > 0) {
      const { data: missingItems, error: missingItemsError } = await client
        .from("found_items")
        .select(ITEM_SELECT)
        .in("id", missingClaimItemIds);

      if (missingItemsError) {
        console.error("Error fetching claim items:", missingItemsError);
      } else {
        for (const item of missingItems ?? []) {
          itemById.set(item.id, item);
        }
      }
    }

    const activeClaims = resolvedClaims.filter(
      (claim) => claim.status !== "completed" && claim.status !== "cancelled"
    );
    const completedRecoveries = resolvedClaims.filter(
      (claim) => claim.status === "completed"
    ).length;
    const protectedRewards = activeClaims.reduce((total, claim) => {
      const item = itemById.get(claim.item_id);
      return total + Number(item?.reward_value ?? 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          matchingItems: matchingItemsCount ?? resolvedItems.length,
          activeClaims: activeClaims.length,
          protectedRewards,
          completedRecoveries,
          reportedLostItems: reportedLostItemsCount ?? 0,
        },
         items: resolvedItems.map((item: FoundItemRow) =>
           mapItemRecord(item, claimByItemId.get(item.id))
         ),
        activeClaim: activeClaims[0]
          ? mapClaimRecord(
              activeClaims[0],
              itemById.get(activeClaims[0].item_id) ?? null
            )
          : null,
        recentClaims: resolvedClaims.slice(0, 4).map((claim) =>
          mapClaimRecord(claim, itemById.get(claim.item_id) ?? null)
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching owner dashboard:", error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar o dashboard do proprietario." },
      { status: 500 }
    );
  }
}
