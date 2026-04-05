'use client';

import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Permission {
  key: string;
  name: PermissionName | 'notifications';
  label: string;
  desc: string;
  icon: string;
  status: PermissionState | 'unsupported' | 'loading';
}

const PERMISSIONS_CONFIG: Omit<Permission, 'status'>[] = [
  {
    key: 'notifications',
    name: 'notifications',
    label: 'Notificações Push',
    desc: 'Receber alertas sobre reivindicações e itens encontrados',
    icon: 'notifications_active',
  },
  {
    key: 'geolocation',
    name: 'geolocation',
    label: 'Localização',
    desc: 'Mostrar itens encontrados perto de si no mapa',
    icon: 'location_on',
  },
  {
    key: 'camera',
    name: 'camera',
    label: 'Câmara',
    desc: 'Fotografar documentos ao registar um item encontrado',
    icon: 'photo_camera',
  },
];

async function queryPermission(name: string): Promise<PermissionState | 'unsupported'> {
  try {
    if (name === 'notifications') {
      if (!('Notification' in window)) return 'unsupported';
      const p = Notification.permission;
      if (p === 'granted') return 'granted';
      if (p === 'denied') return 'denied';
      return 'prompt';
    }
    if (!('permissions' in navigator)) return 'unsupported';
    const result = await navigator.permissions.query({ name: name as PermissionName });
    return result.state;
  } catch {
    return 'unsupported';
  }
}

async function requestPermission(name: string): Promise<PermissionState | 'unsupported'> {
  try {
    if (name === 'notifications') {
      if (!('Notification' in window)) return 'unsupported';
      const result = await Notification.requestPermission();
      return result === 'default' ? 'prompt' : result;
    }
    if (name === 'geolocation') {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (err) => resolve(err.code === 1 ? 'denied' : 'prompt'),
          { timeout: 5000 }
        );
      });
    }
    if (name === 'camera') {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      return 'granted';
    }
    return 'unsupported';
  } catch {
    return 'denied';
  }
}

interface AppPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppPermissionsModal({ isOpen, onClose }: AppPermissionsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(
    PERMISSIONS_CONFIG.map(p => ({ ...p, status: 'loading' }))
  );
  const [requesting, setRequesting] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Carrega o estado actual de cada permissão ao abrir
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeRef.current?.focus(), 50);

    const load = async () => {
      const results = await Promise.all(
        PERMISSIONS_CONFIG.map(async p => ({
          ...p,
          status: await queryPermission(p.key),
        }))
      );
      setPermissions(results);
    };
    load();

    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleToggle = useCallback(async (perm: Permission) => {
    if (requesting) return;

    // Se já está negada, o browser não permite re-pedir — instruir o utilizador
    if (perm.status === 'denied') {
      alert(`A permissão "${perm.label}" foi bloqueada.\n\nPara activar, aceda às definições do seu browser:\nDefinições → Privacidade e Segurança → Permissões do Site.`);
      return;
    }

    if (perm.status === 'granted') {
      // Browsers não permitem revogar permissões via JS — instruir o utilizador
      alert(`Para revogar "${perm.label}", aceda às definições do seu browser:\nDefinições → Privacidade e Segurança → Permissões do Site.`);
      return;
    }

    // status === 'prompt' — pedir permissão
    setRequesting(perm.key);
    const newStatus = await requestPermission(perm.key);
    setPermissions(prev =>
      prev.map(p => p.key === perm.key ? { ...p, status: newStatus } : p)
    );
    setRequesting(null);
  }, [requesting]);

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    granted:     { label: 'Activa',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    denied:      { label: 'Bloqueada',   color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-900/30' },
    prompt:      { label: 'Não pedida',  color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30' },
    unsupported: { label: 'Não suportada', color: 'text-slate-400',                       bg: 'bg-slate-100 dark:bg-slate-800' },
    loading:     { label: 'A verificar…', color: 'text-slate-400',                        bg: 'bg-slate-100 dark:bg-slate-800' },
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        >
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="permissions-title"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-0.5">Achados</p>
                <h2 id="permissions-title" className="text-base font-black text-slate-900 dark:text-white">
                  Permissões do Aplicativo
                </h2>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Fechar permissões"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Lista de permissões */}
            <div className="px-6 py-4 space-y-3">
              {permissions.map(perm => {
                const meta = statusLabel[perm.status] ?? statusLabel.loading;
                const isLoading = perm.status === 'loading' || requesting === perm.key;
                const canRequest = perm.status === 'prompt';

                return (
                  <div
                    key={perm.key}
                    className="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-4"
                  >
                    {/* Ícone */}
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">
                        {perm.icon}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{perm.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{perm.desc}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                        {isLoading && requesting === perm.key ? 'A pedir…' : meta.label}
                      </span>
                    </div>

                    {/* Acção */}
                    {perm.status !== 'unsupported' && (
                      <button
                        onClick={() => handleToggle(perm)}
                        disabled={isLoading}
                        aria-label={`${canRequest ? 'Activar' : 'Gerir'} ${perm.label}`}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                          canRequest
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {isLoading && requesting === perm.key
                          ? '…'
                          : canRequest
                            ? 'Activar'
                            : 'Gerir'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nota informativa */}
            <div className="mx-6 mb-6 flex gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-blue-500 text-[16px] shrink-0 mt-0.5">info</span>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Para revogar permissões já concedidas, aceda às definições de privacidade do seu browser e procure as permissões do site.
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
