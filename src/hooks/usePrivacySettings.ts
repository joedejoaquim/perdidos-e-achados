"use client";

import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    fetch("/api/settings/privacy")
      .then(r => r.json())
      .then(res => {
        if (res.success) setSettings({ ...DEFAULTS, ...res.data });
        else setError(res.error);
      })
      .catch(() => setError("Erro ao carregar configurações"))
      .finally(() => setLoading(false));
  }, []);

  const patch = useCallback(async (updates: Partial<UserPrivacySettings>) => {
    if (!settings) return;
    const optimistic = { ...settings, ...updates };
    setSettings(optimistic);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) {
        setSettings(settings); // rollback
        setError(json.error || "Erro ao salvar");
      }
    } catch {
      setSettings(settings); // rollback
      setError("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const togglePublicProfile = () => patch({ public_profile: !settings?.public_profile });
  const toggleAllowContact = () => patch({ allow_contact: !settings?.allow_contact });
  const setVisibility = (v: ItemsVisibility) => patch({ items_visibility: v });

  const exportData = () => {
    window.open("/api/settings/export", "_blank");
  };

  const deleteAccount = async (): Promise<boolean> => {
    const res = await fetch("/api/settings/privacy", { method: "DELETE" });
    return res.ok;
  };

  return {
    settings, loading, saving, error,
    togglePublicProfile, toggleAllowContact, setVisibility,
    exportData, deleteAccount,
  };
}
