"use client";

import { useState, useEffect, useCallback } from "react";
import { UserNotificationPreferences } from "@/types";

type PrefsKey = keyof Omit<UserNotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">;

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

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then(r => r.json())
      .then(res => {
        if (res.success) setPrefs({ ...DEFAULTS, ...res.data });
        else setError(res.error);
      })
      .catch(() => setError("Erro ao carregar preferências"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(async (key: PrefsKey) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated); // optimistic update
    setSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !prefs[key] }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPrefs(prefs); // rollback
        setError(json.error || "Erro ao salvar");
      }
    } catch {
      setPrefs(prefs); // rollback
      setError("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  return { prefs, loading, saving, error, toggle };
}
