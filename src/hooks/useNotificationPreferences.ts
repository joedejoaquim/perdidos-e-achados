"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  // Ref para aceder ao estado mais recente sem re-criar callbacks
  const prefsRef = useRef<UserNotificationPreferences | null>(null);
  prefsRef.current = prefs;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/settings/notifications")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setPrefs({ ...DEFAULTS, ...res.data });
        } else {
          setPrefs({ user_id: '', ...DEFAULTS } as UserNotificationPreferences);
        }
      })
      .catch(() => {
        setPrefs({ user_id: '', ...DEFAULTS } as UserNotificationPreferences);
      })
      .finally(() => setLoading(false));
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  const toggle = useCallback(async (key: PrefsKey) => {
    const current = prefsRef.current;
    if (!current) return;

    // Actualiza sempre o estado local imediatamente
    const newValue = !current[key];
    setPrefs(prev => prev ? { ...prev, [key]: newValue } : prev);
    setError(null);

    // Só persiste na API se tiver user_id real
    if (!current.user_id) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPrefs(current); // rollback
        setError(json.error || "Erro ao guardar");
      } else if (json.data) {
        setPrefs(prev => prev ? { ...prev, ...json.data } : prev);
      }
    } catch {
      setPrefs(current); // rollback
      setError("Erro ao guardar preferências");
    } finally {
      setSaving(false);
    }
  }, []); // sem dependências — usa sempre prefsRef.current

  return { prefs, loading, saving, error, toggle, refetch };
}
