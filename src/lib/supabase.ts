import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Valida apenas em runtime real (não durante o build do Next.js)
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!isBuildPhase && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Supabase env vars não configuradas: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);

// Server-side client with service role
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  typeof window === "undefined" && supabaseServiceRoleKey
    ? createClient(supabaseUrl!, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;
