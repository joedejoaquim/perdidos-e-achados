import { supabase } from "@/lib/supabase";
import { FoundItem, CreateFoundItemDTO } from "@/types";

export class ItemService {
  static async getItem(itemId: string): Promise<FoundItem | null> {
    const { data, error } = await supabase
      .from("found_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching item:", error);
    }

    return data || null;
  }

  static async createItem(
    finderId: string,
    itemData: CreateFoundItemDTO
  ): Promise<FoundItem> {
    const { data, error } = await supabase
      .from("found_items")
      .insert([{ ...itemData, finder_id: finderId }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);

    return data;
  }

  static async updateItem(itemId: string, updates: Partial<FoundItem>): Promise<FoundItem> {
    const { data, error } = await supabase
      .from("found_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update item: ${error.message}`);

    return data;
  }

  static async getItemsByFinder(finderId: string): Promise<FoundItem[]> {
    const { data, error } = await supabase
      .from("found_items")
      .select("*")
      .eq("finder_id", finderId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch items: ${error.message}`);

    return data || [];
  }

  static async searchItems(filters: {
    category?: string;
    city?: string;
    state?: string;
    status?: string;
  }): Promise<FoundItem[]> {
    let query = supabase.from("found_items").select("*");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.city) query = query.eq("city", filters.city);
    if (filters.state) query = query.eq("state", filters.state);
    if (filters.status) query = query.eq("status", filters.status);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to search items: ${error.message}`);

    return data || [];
  }

  static async getItemNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<FoundItem[]> {
    const { data, error } = await supabase.rpc("get_items_nearby", {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
    });

    if (error) throw new Error(`Failed to fetch nearby items: ${error.message}`);

    return data || [];
  }

  static async uploadItemPhotos(
    itemId: string,
    files: File[]
  ): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      const path = `items/${itemId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("items").upload(path, file);

      if (error) {
        console.error("Error uploading file:", error);
        continue;
      }

      const { data } = supabase.storage.from("items").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return urls;
  }
}
