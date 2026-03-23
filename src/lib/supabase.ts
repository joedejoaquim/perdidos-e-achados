import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

<<<<<<< HEAD
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Flag used by middleware, server, and login page to check if env vars are set
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("placeholder")
) {
  // In production, this is a fatal error. In dev, it helps debug quickly.
  const msg =
    "Supabase env vars não configuradas ou inválidas: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.";

  if (process.env.NODE_ENV === "production") {
    throw new Error(msg);
  } else {
    console.error(`⚠️ ${msg}`);
  }
}

// Unified singleton client for all modules (SSR Compatible)
export const supabase =
  typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl, supabaseAnonKey, { isSingleton: true })
    : createClient(supabaseUrl, supabaseAnonKey);

// Aliases for compatibility with other files
export const supabaseBrowser = supabase;
=======
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
>>>>>>> origin/main

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  typeof window === "undefined" && supabaseServiceRoleKey
<<<<<<< HEAD
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
=======
    ? createClient(supabaseUrl!, supabaseServiceRoleKey, {
>>>>>>> origin/main
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;
