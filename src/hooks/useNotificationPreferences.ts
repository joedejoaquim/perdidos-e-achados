"use client";

import { useState, useEffect, useCallback } from "react";
import { UserNotificationPreferences } from "@/types";

type PrefsKey = keyof Omit<UserNotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">;

export type { PrefsKey };

const DEFAULTS: Omit<UserNotificationPreferences, "id" | "user_id" | "created_at" | "updated_at"> = {
  push_enabled: true,
  email_enabled: true,
  nearby_enabled: true,
  weekly_summary: false,
  sound_enabled: true,
  vibration_enabled: true,
};

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/settings/notifications")
      .then(r => r.json())
      .then(res => {
        if (res.success) setPrefs({ ...DEFAULTS, ...res.data });
        else if (res.error === 'Unauthorized') setPrefs(null); // não autenticado
        else setError(res.error ?? "Erro ao carregar preferências");
      })
      .catch(() => setError("Erro ao carregar preferências"))
      .finally(() => setLoading(false));
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  const toggle = useCallback(async (key: PrefsKey) => {
    if (!prefs) return;
    const previous = prefs;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated); // optimistic update
    setSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !previous[key] }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPrefs(previous); // rollback
        setError(json.error || "Erro ao salvar");
      } else if (json.data) {
        setPrefs(prev => prev ? { ...prev, ...json.data } : prev);
      }
    } catch {
      setPrefs(previous); // rollback
      setError("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  return { prefs, loading, saving, error, toggle, refetch };
}
