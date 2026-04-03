'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MODAL_PARAM = 'modal';
const MODAL_VALUE = 'comparar-planos';

export function useComparePlansModal() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Abre o modal: actualiza URL e bloqueia scroll
  const open = useCallback((trigger?: HTMLButtonElement | null) => {
    if (trigger) triggerRef.current = trigger;
    const url = new URL(window.location.href);
    url.searchParams.set(MODAL_PARAM, MODAL_VALUE);
    window.history.pushState({}, '', url.toString());
    document.body.style.overflow = 'hidden';
    setIsOpen(true);
  }, []);

  // Fecha o modal: limpa URL e restaura scroll
  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(MODAL_PARAM);
    window.history.replaceState({}, '', url.toString());
    document.body.style.overflow = '';
    setIsOpen(false);
    // Devolve foco ao trigger
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  // Abre automaticamente se URL já tem o parâmetro
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(MODAL_PARAM) === MODAL_VALUE) {
      document.body.style.overflow = 'hidden';
      setIsOpen(true);
    }
  }, []);

  // Fecha com botão voltar do browser
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get(MODAL_PARAM) !== MODAL_VALUE && isOpen) {
        document.body.style.overflow = '';
        setIsOpen(false);
        setTimeout(() => triggerRef.current?.focus(), 50);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  return { isOpen, open, close, triggerRef };
}
