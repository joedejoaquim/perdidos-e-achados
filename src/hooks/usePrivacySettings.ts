"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserPrivacySettings, ItemsVisibility } from "@/types";

const DEFAULTS: Omit<UserPrivacySettings, "id" | "created_at" | "updated_at"> = {
  user_id: "",
  public_profile: true,
  allow_contact: false,
  items_visibility: "friends",
};

export function usePrivacySettings() {
  const [settings, setSettings] = useState<UserPrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  // Guarda o estado anterior para rollback correcto
  const previousRef = useRef<UserPrivacySettings | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/settings/privacy")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSettings({ ...DEFAULTS, ...res.data });
        } else {
          // Qualquer erro — mostra defaults para não bloquear o utilizador
          setSettings({ ...DEFAULTS });
        }
      })
      .catch(() => setSettings({ ...DEFAULTS }))
      .finally(() => setLoading(false));
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  const patch = useCallback(async (updates: Partial<UserPrivacySettings>) => {
    if (!settings) return;
    previousRef.current = settings;
    setSettings(prev => prev ? { ...prev, ...updates } : prev); // optimistic
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) {
        setSettings(previousRef.current); // rollback
        setError(json.error || "Erro ao guardar");
      } else if (json.data) {
        setSettings(prev => prev ? { ...prev, ...json.data } : prev);
      }
    } catch {
      setSettings(previousRef.current); // rollback
      setError("Erro ao guardar configurações");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const togglePublicProfile = useCallback(
    () => patch({ public_profile: !settings?.public_profile }),
    [patch, settings?.public_profile]
  );

  const toggleAllowContact = useCallback(
    () => patch({ allow_contact: !settings?.allow_contact }),
    [patch, settings?.allow_contact]
  );

  const setVisibility = useCallback(
    (v: ItemsVisibility) => patch({ items_visibility: v }),
    [patch]
  );

  const exportData = useCallback(() => {
    window.open("/api/settings/export", "_blank");
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/settings/privacy", { method: "DELETE" });
    return res.ok;
  }, []);

  return {
    settings, loading, saving, error,
    togglePublicProfile, toggleAllowContact, setVisibility,
    exportData, deleteAccount, refetch,
  };
}
