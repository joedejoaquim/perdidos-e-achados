"use client";

import { useState, useEffect, useCallback } from "react";
import { Subscription } from "@/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/settings/subscription")
      .then(r => r.json())
      .then(res => {
        if (res.success) setSubscription(res.data);
        else if (res.error === 'Unauthorized') setSubscription(null); // não autenticado = sem subscrição
        else setError(res.error);
      })
      .catch(() => setError("Erro ao carregar assinatura"))
      .finally(() => setLoading(false));
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const subscribe = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/settings/subscription", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else setError(json.error || "Erro ao iniciar checkout");
    } catch {
      setError("Erro ao iniciar checkout");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/settings/subscription", { method: "DELETE" });
      const json = await res.json();
      if (res.ok) setSubscription(prev => prev ? { ...prev, cancel_at_period_end: true } : prev);
      else setError(json.error || "Erro ao cancelar");
    } catch {
      setError("Erro ao cancelar assinatura");
    } finally {
      setActionLoading(false);
    }
  }, []);

  return { subscription, loading, actionLoading, error, isPro, subscribe, cancel, refetch };
}
