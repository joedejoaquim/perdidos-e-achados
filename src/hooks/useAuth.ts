"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useOptionalAuthContext } from "@/components/auth/AuthProvider";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
import { User } from "@/types";

type UseAuthOptions = { enabled?: boolean; };
type AuthSnapshot = { user: User | null; error: string | null; };

let authSnapshot: AuthSnapshot = { user: null, error: null };
let authSnapshotReady = false;
let pendingAuthSnapshot: Promise<AuthSnapshot> | null = null;

function buildFallbackUser(authUser: { id: string; email?: string; user_metadata?: any; email_confirmed_at?: string }): User { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Usuario",
    phone: authUser.user_metadata?.phone || "",
    xp: 0, level: "bronze", rating: 0, rank_position: 0, kyc_status: "not_started",
    verified: Boolean(authUser.email_confirmed_at),
    avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
    created_at: new Date(), updated_at: new Date(),
  };
}

async function resolveAuthSnapshot(): Promise<AuthSnapshot> {
  if (pendingAuthSnapshot) return pendingAuthSnapshot;
  pendingAuthSnapshot = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      if (!authUser) return { user: null, error: null };
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (!userError && userData) return { user: userData, error: null };
      const syncResponse = await fetch("/api/auth/profile", { method: "POST" });
      const syncPayload = await syncResponse.json().catch(() => null);
      if (!syncResponse.ok || !syncPayload?.data) return { user: buildFallbackUser(authUser), error: syncPayload?.error || "Perfil não configurado." };
      return { user: syncPayload.data, error: null };
    } catch (e: unknown) {
      return { user: null, error: e instanceof Error ? e.message : "Erro auth" };
    }
  })();
  const snapshot = await pendingAuthSnapshot;
  authSnapshot = snapshot; authSnapshotReady = true; pendingAuthSnapshot = null;
  return snapshot;
}

function resetAuthSnapshot(nextSnapshot?: AuthSnapshot) {
  authSnapshot = nextSnapshot ?? { user: null, error: null };
  authSnapshotReady = Boolean(nextSnapshot); pendingAuthSnapshot = null;
}

export const useAuth = ({ enabled = true }: UseAuthOptions = {}) => {
  const authContext = useOptionalAuthContext();
  const [user, setUser] = useState<User | null>(enabled ? authContext?.user ?? (authSnapshotReady ? authSnapshot.user : null) : null);
  const [loading, setLoading] = useState(enabled ? !(authContext?.ready || authSnapshotReady) : false);
  const [error, setError] = useState<string | null>(enabled ? authContext?.error ?? (authSnapshotReady ? authSnapshot.error : null) : null);
  const router = useRouter();

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let isMounted = true;
    const syncState = async (forceRefresh = false) => {
      if (forceRefresh) resetAuthSnapshot();
      const snapshot = await resolveAuthSnapshot();
      if (!isMounted) return;
      setUser(snapshot.user); setError(snapshot.error); setLoading(false);
      if (authContext && authContext.user?.id !== snapshot.user?.id) {
         authContext.setUser(snapshot.user); authContext.setError(snapshot.error);
      }
    };
    if (authContext?.ready) { setUser(authContext.user); setError(authContext.error); setLoading(false); }
    else { syncState(); }

    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        resetAuthSnapshot({ user: null, error: null });
        if (isMounted) { setUser(null); setLoading(false); router.push("/auth/login"); }
        return;
      }
      if (event === "SIGNED_IN") { await syncState(true); router.refresh(); }
    });
    return () => { isMounted = false; data?.subscription.unsubscribe(); };
  }, [enabled, router, authContext]);

  return { user, loading, error };
};

export const useLogout = () => {
  return async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    resetAuthSnapshot({ user: null, error: null });
    window.location.href = "/auth/login";
  };
};
