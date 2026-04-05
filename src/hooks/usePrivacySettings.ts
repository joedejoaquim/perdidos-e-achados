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
  // Ref para aceder ao estado mais recente dentro de callbacks sem re-criar
  const settingsRef = useRef<UserPrivacySettings | null>(null);
  settingsRef.current = settings;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/settings/privacy")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSettings({ ...DEFAULTS, ...res.data });
        } else {
          setSettings({ ...DEFAULTS });
        }
      })
      .catch(() => setSettings({ ...DEFAULTS }))
      .finally(() => setLoading(false));
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  // patch usa settingsRef para evitar closures stale
  const patch = useCallback(async (updates: Partial<UserPrivacySettings>) => {
    const current = settingsRef.current;
    if (!current) return;

    // Actualiza sempre o estado local imediatamente (optimistic)
    setSettings(prev => prev ? { ...prev, ...updates } : prev);
    setError(null);

    // Só tenta guardar na API se tiver user_id real
    if (!current.user_id) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) {
        // Rollback apenas se a API falhar com erro real
        setSettings(current);
        setError(json.error || "Erro ao guardar");
      } else if (json.data) {
        setSettings(prev => prev ? { ...prev, ...json.data } : prev);
      }
    } catch {
      setSettings(current);
      setError("Erro ao guardar configurações");
    } finally {
      setSaving(false);
    }
  }, []); // sem dependências — usa sempre settingsRef.current

  const togglePublicProfile = useCallback(
    () => {
      const current = settingsRef.current;
      patch({ public_profile: !current?.public_profile });
    },
    [patch]
  );

  const toggleAllowContact = useCallback(
    () => {
      const current = settingsRef.current;
      patch({ allow_contact: !current?.allow_contact });
    },
    [patch]
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
