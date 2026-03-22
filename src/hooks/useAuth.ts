"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          router.push("/auth/login");
          return;
        }

        // Fetch user profile from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError || !userData) {
          // Usuário autenticado mas sem perfil na tabela users (ex: primeiro login OAuth)
          // Cria o perfil automaticamente
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([{
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "Usuário",
              phone: authUser.user_metadata?.phone ?? "",
              xp: 0,
              level: "bronze",
              rating: 0,
              rank_position: 0,
              kyc_status: "not_started",
              verified: false,
            }])
            .select()
            .single();

          if (createError || !newUser) {
            setError("Erro ao criar perfil do usuário");
            router.push("/auth/login");
            return;
          }

          setUser(newUser);
          return;
        }

        setUser(userData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          setUser(userData);
        } else {
          // Cria perfil se não existir (primeiro login OAuth)
          const { data: newUser } = await supabase
            .from("users")
            .insert([{
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name ?? session.user.email?.split("@")[0] ?? "Usuário",
              phone: session.user.user_metadata?.phone ?? "",
              xp: 0,
              level: "bronze",
              rating: 0,
              rank_position: 0,
              kyc_status: "not_started",
              verified: false,
            }])
            .select()
            .single();

          if (newUser) setUser(newUser);
        }
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/auth/login");
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading, error };
};

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return logout;
};
