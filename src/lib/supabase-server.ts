import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

export async function createServerSupabaseClient() {
  if (!hasSupabaseConfig) {
    throw new Error("Missing Supabase environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may expose a read-only cookie store.
        }
      },
    },
  });
}
