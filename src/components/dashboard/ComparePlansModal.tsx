'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Map, X } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Subscription } from '@/types';
import { ToastData } from '@/components/ui/Toast';

// ---------------------------------------------------------------------------
// Analytics helper (fire-and-forget, não bloqueia)
// ---------------------------------------------------------------------------
function track(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).analytics) {
      (window as unknown as { analytics: { track: (e: string, p?: unknown) => void } }).analytics.track(event, props);
    }
  } catch { /* silencioso */ }
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type ModalState = 'loading' | 'upsell' | 'subscribed' | 'error';

interface ComparePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Assinatura já carregada pela página pai (pode ser null enquanto carrega) */
  subscription: Subscription | null;
  subLoading: boolean;
  subError: string | null;
  subActionLoading: boolean;
  isPro: boolean;
  onSubscribe: () => Promise<void>;
  onCancelSubscription: () => Promise<void>;
  onRetry: () => void;
  onToast: (msg: string, type: ToastData['type']) => void;
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------
function PlanSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-700" style={{ width: `${55 + i * 10}%` }} />
          </div>
        ))}
      </div>
      <div className="h-11 rounded-xl bg-slate-200 dark:bg-slate-700 mt-2" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de confirmação de downgrade (secundário)
// ---------------------------------------------------------------------------
interface DowngradeConfirmProps {
  periodEnd?: Date;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DowngradeConfirmModal({ periodEnd, isLoading, onConfirm, onCancel }: DowngradeConfirmProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { cancelRef.current?.focus(); }, []);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-3xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Tem a certeza?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Ao fazer downgrade, perderá acesso ao rastreamento em tempo real, alertas de zona e suporte
          prioritário no final do período actual
          {periodEnd ? ` (${periodEnd.toLocaleDateString('pt-BR')})` : ''}.
        </p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">
                progress_activity
              </span>
            )}
            Confirmar downgrade
          </button>
        </div>
      </m.div>
    </m.div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function ComparePlansModal({
  isOpen,
  onClose,
  subscription,
  subLoading,
  subError,
  subActionLoading,
  isPro,
  onSubscribe,
  onCancelSubscription,
  onRetry,
  onToast,
}: ComparePlansModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Necessário para createPortal (SSR safe)
  useEffect(() => { setMounted(true); }, []);

  // Determina estado do modal
  const modalState: ModalState = subLoading
    ? 'loading'
    : subError
      ? 'error'
      : isPro
        ? 'subscribed'
        : 'upsell';

  // Foco no botão fechar ao abrir; analytics
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
      track('plans_modal_opened', { source: 'localizador_pro_tab' });
      track('plan_viewed', { plan: 'free' });
      track('plan_viewed', { plan: 'pro' });
    }
  }, [isOpen]);

  // Fechar com Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !containerRef.current) return;
    const focusable = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  // Fluxo de assinatura
  const handleSubscribe = async () => {
    track('subscribe_clicked', { plan: 'pro', price: 14.90 });
    setCheckoutLoading(true);
    try {
      track('checkout_started', { plan: 'pro' });
      await onSubscribe();
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fluxo de downgrade
  const handleDowngradeConfirm = async () => {
    track('downgrade_confirmed', { from: 'pro', to: 'free' });
    await onCancelSubscription();
    setShowDowngradeConfirm(false);
    const periodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
      : '';
    onToast(
      `Downgrade agendado. O seu plano PRO permanece activo${periodEnd ? ` até ${periodEnd}` : ''}.`,
      'info'
    );
  };

  // Botão suporte
  const handleSupport = () => {
    track('support_contact_clicked', { source: 'plans_modal' });
    const channel = (typeof window !== 'undefined' && (window as unknown as Record<string, string>).__SUPPORT_CHANNEL__) || 'whatsapp';
    const number = (typeof window !== 'undefined' && (window as unknown as Record<string, string>).__WHATSAPP_NUMBER__) || '';
    if (channel === 'whatsapp' && number) {
      window.open(`https://wa.me/${number}?text=Ol%C3%A1%2C+tenho+d%C3%BAvidas+sobre+os+planos+do+Achados`, '_blank');
    } else if (channel === 'intercom' && typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Intercom) {
      (window as unknown as { Intercom: (cmd: string, opts?: unknown) => void }).Intercom('showNewMessage', 'Olá, tenho dúvidas sobre os planos do Achados');
    }
  };

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : undefined;

  const isSubscribeLoading = checkoutLoading || subActionLoading;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        // Overlay
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        >
          {/* Container do modal */}
          <m.div
            ref={containerRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Downgrade confirm overlay */}
            <AnimatePresence>
              {showDowngradeConfirm && (
                <DowngradeConfirmModal
                  periodEnd={periodEnd}
                  isLoading={subActionLoading}
                  onConfirm={handleDowngradeConfirm}
                  onCancel={() => setShowDowngradeConfirm(false)}
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center relative">
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Fechar modal de comparação de planos"
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
              <h2 id={titleId} className="text-2xl font-black text-slate-900 dark:text-white">
                Comparar Planos
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Escolha o plano ideal para gerenciar seus itens perdidos e achados.
              </p>
            </div>

            {/* Estado de erro */}
            {modalState === 'error' && (
              <div className="px-6 pb-6">
                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center">
                  <span className="material-symbols-outlined text-red-500 text-[32px] mb-3 block" aria-hidden="true">
                    error_outline
                  </span>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-4">
                    Não foi possível carregar os dados do plano. Tente novamente.
                  </p>
                  <button
                    onClick={onRetry}
                    className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {/* Cards de planos */}
            {modalState !== 'error' && (
              <div className="px-6 pb-6 grid sm:grid-cols-2 gap-4">
                {/* Card Grátis */}
                <m.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.22 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col"
                >
                  {modalState === 'loading' ? (
                    <PlanSkeleton />
                  ) : (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                        Plano Grátis
                      </p>
                      <div className="flex items-end gap-1 mb-6">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
                        <span className="text-sm text-slate-400 mb-1">/mês</span>
                      </div>
                      <ul className="space-y-3 flex-1" aria-label="Funcionalidades do plano grátis">
                        {[
                          { label: 'Até 3 itens cadastrados', active: true },
                          { label: 'Busca simples', active: true },
                          { label: 'Notificações em tempo real', active: false },
                          { label: 'Mapa de calor de perdas', active: false },
                        ].map((feat) => (
                          <li key={feat.label} className="flex items-center gap-2.5 text-sm">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feat.active ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}
                              aria-hidden="true"
                            >
                              <span className={`material-symbols-outlined text-[13px] ${feat.active ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>
                                {feat.active ? 'check' : 'remove'}
                              </span>
                            </span>
                            <span className={feat.active ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}>
                              {feat.label}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {isPro ? (
                        <button
                          onClick={() => { track('downgrade_initiated', { from: 'pro', to: 'free' }); setShowDowngradeConfirm(true); }}
                          className="mt-6 w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                          aria-label="Fazer downgrade para o plano grátis"
                        >
                          Fazer downgrade
                        </button>
                      ) : (
                        <div
                          className="mt-6 w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
                          aria-label="Plano actual"
                        >
                          Plano actual
                        </div>
                      )}
                    </>
                  )}
                </m.div>

                {/* Card PRO */}
                <m.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.13, duration: 0.22 }}
                  className="relative rounded-2xl border-2 border-primary bg-white dark:bg-slate-900 p-6 flex flex-col shadow-lg shadow-primary/10"
                >
                  {modalState === 'loading' ? (
                    <PlanSkeleton />
                  ) : (
                    <>
                      {/* Badge topo */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {isPro ? (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]" aria-hidden="true">check_circle</span>
                            Ativo
                          </span>
                        ) : (
                          <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow">
                            Mais Popular
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plano Pro</p>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]" aria-hidden="true">workspace_premium</span>
                          PRO
                        </span>
                      </div>

                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 14,90</span>
                        <span className="text-sm text-slate-400 mb-1">/mês</span>
                      </div>

                      {/* Feature icons */}
                      <div className="flex gap-2 mb-5" aria-hidden="true">
                        {[
                          { isLucide: true, label: 'Mapa' },
                          { icon: 'my_location', label: 'Alvo' },
                          { icon: 'verified_user', label: 'Escudo' },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-xl py-3 flex flex-col items-center gap-1 ${i === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                          >
                            {item.isLucide ? (
                              <Map className="w-5 h-5" aria-hidden="true" />
                            ) : (
                              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            )}
                            <span className="text-[10px] font-semibold">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      <ul className="space-y-3 flex-1" aria-label="Funcionalidades do plano PRO">
                        {[
                          'Itens ilimitados',
                          'Notificações Instantâneas',
                          'Suporte prioritário 24/7',
                          'Verificação de identidade',
                        ].map((feat) => (
                          <li key={feat} className="flex items-center gap-2.5 text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                              <span className="material-symbols-outlined text-[13px] text-primary">check</span>
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {isPro ? (
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={handleSubscribe}
                            disabled={isSubscribeLoading}
                            className="w-full py-3.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            aria-label="Gerir assinatura PRO"
                          >
                            {isSubscribeLoading && (
                              <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">
                                progress_activity
                              </span>
                            )}
                            Gerir assinatura
                          </button>
                          {periodEnd && (
                            <p className="text-center text-xs text-slate-400">
                              Renovação automática em {periodEnd.toLocaleDateString('pt-BR')}
                              {subscription?.cancel_at_period_end && ' · Cancelamento agendado'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleSubscribe}
                          disabled={isSubscribeLoading}
                          className="mt-6 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-[#D93800] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          aria-label="Assinar o plano PRO por R$ 14,90 por mês"
                        >
                          {isSubscribeLoading && (
                            <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">
                              progress_activity
                            </span>
                          )}
                          {isSubscribeLoading ? 'Redirecionando...' : 'Assinar agora'}
                        </button>
                      )}
                    </>
                  )}
                </m.div>
              </div>
            )}

            {/* Footer */}
            <div className="mx-6 mb-6 flex items-center justify-between gap-4 bg-slate-800 dark:bg-slate-950 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="material-symbols-outlined text-[16px] text-slate-300">support_agent</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Dúvidas sobre qual plano escolher para sua empresa?{' '}
                  Nossa equipe está pronta para ajudar.
                </p>
              </div>
              <button
                onClick={handleSupport}
                aria-label="Falar com consultor de vendas"
                className="shrink-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Falar com consultor
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
