'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const styles: Record<ToastType, string> = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-800 text-white',
  };

  const icons: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${styles[toast.type]}`}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">
        {icons[toast.type]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        className="opacity-70 hover:opacity-100 transition-opacity ml-1"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
      </button>
    </m.div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
