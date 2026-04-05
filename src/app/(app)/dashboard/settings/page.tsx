'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import type { PrefsKey } from '@/hooks/useNotificationPreferences';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useSubscription } from '@/hooks/useSubscription';
import { ItemsVisibility } from '@/types';
import { ComparePlansModal } from '@/components/dashboard/ComparePlansModal';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useComparePlansModal } from '@/hooks/useComparePlansModal';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) setActiveTab(params.get('tab')!);
    if (params.get('success') === '1') {
      // limpa o URL sem reload
      window.history.replaceState({}, '', window.location.pathname + '?tab=assinatura');
    }
  }, []);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { prefs, loading: notifsLoading, saving: notifsSaving, toggle: toggleNotif, error: notifsError } = useNotificationPreferences();
  const {
    settings: privacySettings, loading: privacyLoading, saving: privacySaving,
    togglePublicProfile, toggleAllowContact, setVisibility,
    exportData, deleteAccount, error: privacyError,
  } = usePrivacySettings();
  const { subscription, loading: subLoading, actionLoading: subActionLoading, isPro, subscribe, cancel: cancelSub, error: subError, refetch: refetchSub } = useSubscription();

  const [showVisibilidadeMenu, setShowVisibilidadeMenu] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const comparePlansModal = useComparePlansModal();
  const comparePlansTriggerRef = useRef<HTMLButtonElement>(null);

  // Fluxo de assinatura com feedback de toast
  const handleSubscribe = useCallback(async () => {
    await subscribe();
  }, [subscribe]);

  // Fluxo de cancelamento com feedback de toast
  const handleCancelSubscription = useCallback(async () => {
    await cancelSub();
  }, [cancelSub]);

  // Retry ao carregar assinatura
  const handleRetrySubscription = useCallback(() => {
    refetchSub();
  }, [refetchSub]);

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return;
    const ok = await deleteAccount();
    if (ok) {
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } else {
      alert('Erro ao excluir conta. Tente novamente.');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      e.target.value = '';
      return;
    }
    // TODO: fazer upload do arquivo
    console.log('Foto selecionada:', file.name);
  };

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: formData.name, phone: formData.phone })
        .eq('id', user.id);
      
      if (error) throw error;
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
      <Header user={user} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <m.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 shrink-0"
          >
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Configurações</h1>
            <nav className="flex flex-col gap-2">
               {[
                 { id: 'perfil', icon: 'person', label: 'Dados de Perfil' },
                 { id: 'notificacoes', icon: 'notifications', label: 'Notificações' },
                 { id: 'seguranca', icon: 'shield', label: 'Privacidade & App' },
                 { id: 'assinatura', icon: 'workspace_premium', label: 'Localizador PRO' },
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm w-full text-left ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                 >
                   <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                   {tab.label}
                 </button>
               ))}
            </nav>
          </m.div>

          {/* Settings Content Area */}
          <m.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            {activeTab === 'perfil' && (
              <div className="max-w-xl">
                 <m.h2 variants={itemVariants} className="text-xl font-bold text-slate-900 dark:text-white mb-6">Informações Pessoais</m.h2>
                 
                 <m.div variants={itemVariants} className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 shrink-0">
                     {user?.name?.charAt(0).toUpperCase() || "A"}
                   </div>
                   <div>
                     <input
                       ref={fileInputRef}
                       type="file"
                       accept="image/jpeg,image/png"
                       className="hidden"
                       onChange={handleFileChange}
                     />
                     <button onClick={handlePhotoClick} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-sm font-bold shadow-sm hover:shadow transition-all border border-slate-200 dark:border-slate-700">Alterar Foto</button>
                     <p className="text-xs text-slate-500 mt-2">Formatos: JPG, PNG até 5MB</p>
                   </div>
                 </m.div>

                  <m.form variants={itemVariants} onSubmit={handleSave} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nome Completo</label>
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Celular</label>
                        <input 
                          type="tel" 
                          value={formData.phone} 
                          onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Principal</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">verified</span>
                        <input type="email" readOnly defaultValue={user?.email || ""} className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-500 dark:text-slate-400 shadow-sm outline-none cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </m.form>
              </div>
            )}

            {activeTab === 'notificacoes' && (
              <div className="max-w-xl">
                <m.div variants={itemVariants}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notificações</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Gerencie como você deseja ser alertado sobre seus itens e atividades.</p>
                </m.div>

                {notifsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </div>
                ) : (
                  <>
                    {notifsSaving && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] animate-spin text-primary">progress_activity</span>
                        A guardar...
                      </div>
                    )}
                    {notifsError && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                        <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                        {notifsError}
                      </div>
                    )}
                    {/* Grupo principal */}
                    <m.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700 mb-4">
                      {([
                        { key: 'push_enabled',    icon: 'notifications_active', label: 'Notificações Push',                desc: 'Receba alertas em tempo real' },
                        { key: 'email_enabled',   icon: 'mail',                  label: 'E-mail',                           desc: 'Atualizações por e-mail' },
                        { key: 'nearby_enabled',  icon: 'near_me',               label: 'Notificações de Achados Próximos', desc: 'Itens encontrados perto de você' },
                        { key: 'weekly_summary',  icon: 'calendar_month',        label: 'Resumo Semanal',                   desc: 'Receba um resumo toda segunda-feira' },
                      ] as { key: PrefsKey; icon: string; label: string; desc: string }[]).map(item => (
                        <div key={item.key} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">{item.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleNotif(item.key)}
                            disabled={notifsSaving || !prefs}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-60 ${prefs?.[item.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                            aria-label={`${prefs?.[item.key] ? 'Desactivar' : 'Activar'} ${item.label}`}
                            aria-pressed={!!prefs?.[item.key]}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${prefs?.[item.key] ? 'translate-x-6' : 'translate-x-0'}`}>
                              {prefs?.[item.key] && <span className="material-symbols-outlined text-[12px] text-primary">check</span>}
                            </span>
                          </button>
                        </div>
                      ))}
                    </m.div>

                    {/* Sons & Vibração */}
                    <m.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700 mb-4">
                      <p className="px-5 pt-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Sons & Vibração</p>
                      {([
                        { key: 'sound_enabled',     icon: 'volume_up',  label: 'Som de notificação', desc: 'Reproduzir um som ao receber alerta' },
                        { key: 'vibration_enabled', icon: 'vibration',  label: 'Vibração',            desc: 'Vibrar dispositivo para alertas críticos' },
                      ] as { key: PrefsKey; icon: string; label: string; desc: string }[]).map(item => (
                        <div key={item.key} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">{item.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleNotif(item.key)}
                            disabled={notifsSaving || !prefs}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-60 ${prefs?.[item.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                            aria-label={`${prefs?.[item.key] ? 'Desactivar' : 'Activar'} ${item.label}`}
                            aria-pressed={!!prefs?.[item.key]}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${prefs?.[item.key] ? 'translate-x-6' : 'translate-x-0'}`}>
                              {prefs?.[item.key] && <span className="material-symbols-outlined text-[12px] text-primary">check</span>}
                            </span>
                          </button>
                        </div>
                      ))}
                    </m.div>

                    {/* Aviso */}
                    <m.div variants={itemVariants} className="flex gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl px-5 py-4">
                      <span className="material-symbols-outlined text-blue-500 shrink-0 mt-0.5">info</span>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Atenção: Algumas notificações críticas de segurança (como recuperação de senha) não podem ser desativadas por motivos de segurança.
                      </p>
                    </m.div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div className="max-w-xl">
                <m.div variants={itemVariants} className="mb-6">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Central de Segurança</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Privacidade & App</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie como seus dados são exibidos e quem pode interagir com suas postagens no ecossistema Achados.</p>
                </m.div>

                {privacyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </div>
                ) : (
                  <>
                    {privacySaving && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] animate-spin text-primary">progress_activity</span>
                        A guardar...
                      </div>
                    )}
                    {privacyError && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                        <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                        {privacyError}
                      </div>
                    )}
                    {/* Privacidade */}
                    <m.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700 mb-4">
                      <p className="px-5 pt-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Privacidade</p>

                      {/* Mostrar perfil */}
                      <div className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">Mostrar meu perfil publicamente</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Outros utilizadores podem ver o seu perfil</p>
                        </div>
                        <button
                          onClick={togglePublicProfile}
                          disabled={privacySaving}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-60 ${privacySettings?.public_profile ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                          aria-label={`${privacySettings?.public_profile ? 'Desactivar' : 'Activar'} perfil público`}
                          aria-pressed={!!privacySettings?.public_profile}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${privacySettings?.public_profile ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Permitir contato */}
                      <div className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">Permitir que outros me contactem</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receba mensagens de outros utilizadores</p>
                        </div>
                        <button
                          onClick={toggleAllowContact}
                          disabled={privacySaving}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-60 ${privacySettings?.allow_contact ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                          aria-label={`${privacySettings?.allow_contact ? 'Desactivar' : 'Activar'} contacto`}
                          aria-pressed={!!privacySettings?.allow_contact}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${privacySettings?.allow_contact ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Visibilidade dos achados */}
                      <div className="flex items-center justify-between px-5 py-4 relative">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">Quem pode ver meus achados</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Controle a visibilidade dos seus itens registados</p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setShowVisibilidadeMenu(v => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-white shadow-sm hover:shadow transition-all"
                            aria-haspopup="listbox"
                            aria-expanded={showVisibilidadeMenu}
                          >
                            {{ everyone: 'Todos', friends: 'Apenas amigos', only_me: 'Somente eu' }[privacySettings?.items_visibility ?? 'friends']}
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                          </button>
                          {showVisibilidadeMenu && (
                            <>
                              {/* Overlay para fechar ao clicar fora */}
                              <div className="fixed inset-0 z-10" onClick={() => setShowVisibilidadeMenu(false)} aria-hidden="true" />
                              <div role="listbox" className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden min-w-[160px]">
                                {([
                                  { value: 'everyone', label: 'Todos' },
                                  { value: 'friends',  label: 'Apenas amigos' },
                                  { value: 'only_me',  label: 'Somente eu' },
                                ] as { value: ItemsVisibility; label: string }[]).map(opt => (
                                  <button
                                    key={opt.value}
                                    role="option"
                                    aria-selected={privacySettings?.items_visibility === opt.value}
                                    onClick={() => { setVisibility(opt.value); setShowVisibilidadeMenu(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${privacySettings?.items_visibility === opt.value ? 'font-bold text-primary' : 'text-slate-700 dark:text-white'}`}
                                  >
                                    {opt.label}
                                    {privacySettings?.items_visibility === opt.value && (
                                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </m.div>

                    {/* Dados & Permissões */}
                    <m.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700 mb-4">
                      <p className="px-5 pt-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Dados & Permissões</p>
                      {[
                        { icon: 'apps',     label: 'Permissões do Aplicativo',    onClick: () => alert('Em breve') },
                        { icon: 'storage',  label: 'Gerenciar dados armazenados', onClick: () => alert('Em breve') },
                        { icon: 'download', label: 'Exportar meus dados',         onClick: exportData },
                      ].map(item => (
                        <button key={item.label} onClick={item.onClick} className="flex items-center gap-4 px-5 py-4 w-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">{item.icon}</span>
                          </div>
                          <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white text-left">{item.label}</span>
                          <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                        </button>
                      ))}
                    </m.div>

                    {/* Zona de Risco */}
                    <m.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6">
                      <p className="px-5 pt-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Zona de Risco</p>
                      <div className="px-5 pb-4">
                        <button
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors text-sm font-semibold"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                          Excluir minha conta
                        </button>
                      </div>
                    </m.div>

                    {/* Cards rodapé */}
                    <m.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-primary rounded-2xl p-5 text-white relative overflow-hidden">
                        <p className="font-black text-base leading-snug mb-1">Privacidade Total no<br/>Localizador PRO</p>
                        <p className="text-xs text-white/80 mb-4">Ative o modo fantasma e oculte sua localização em tempo real.</p>
                        <button
                          onClick={() => setActiveTab('assinatura')}
                          className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg hover:bg-white/90 transition-colors"
                        >
                          Saber Mais →
                        </button>
                        <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-[80px] text-white/10">location_on</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 relative overflow-hidden">
                        <p className="font-bold text-slate-800 dark:text-white text-base mb-1">Dúvidas sobre seus dados?</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Leia nossa política de curadoria digital e entenda como protegemos você.</p>
                        <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                          Ver Política <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                        <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-[80px] text-slate-200 dark:text-slate-700">search</span>
                      </div>
                    </m.div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'assinatura' && (
              <div className="max-w-2xl">
                {subLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </div>
                ) : (
                  <>
                    {/* Hero PRO */}
                    <m.div variants={itemVariants} className={`rounded-3xl p-8 text-white text-center mb-8 relative overflow-hidden ${isPro ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-primary'}`}>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[28px] text-white">{isPro ? 'workspace_premium' : 'location_on'}</span>
                      </div>
                      <h2 className="text-3xl font-black mb-2">Localizador PRO</h2>
                      {isPro ? (
                        <>
                          <p className="text-white/80 text-sm mb-2">Você é um assinante PRO</p>
                          {subscription?.current_period_end && (
                            <p className="text-white/60 text-xs mb-6">
                              Renova em {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                              {subscription.cancel_at_period_end && ' · Cancelamento agendado'}
                            </p>
                          )}
                          {!subscription?.cancel_at_period_end ? (
                            <button
                              onClick={cancelSub}
                              disabled={subActionLoading}
                              className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50"
                            >
                              {subActionLoading ? 'Aguarde...' : 'Cancelar assinatura'}
                            </button>
                          ) : (
                            <p className="text-white/70 text-xs bg-white/10 rounded-xl px-4 py-2 inline-block">
                              Acesso ativo até o fim do período
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-white/80 text-sm mb-6">Encontre seus itens com precisão e velocidade</p>
                          <button
                            onClick={subscribe}
                            disabled={subActionLoading}
                            className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg text-sm disabled:opacity-50"
                          >
                            {subActionLoading ? 'Redirecionando...' : 'Assinar agora — R$ 14,90/mês'}
                          </button>
                        </>
                      )}
                      <span className="material-symbols-outlined absolute -bottom-6 -left-6 text-[120px] text-white/5">location_on</span>
                      <span className="material-symbols-outlined absolute -top-6 -right-6 text-[120px] text-white/5">shield</span>
                    </m.div>

                    {/* Por que ser PRO */}
                    <m.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Por que ser PRO?</h3>
                        <ul className="space-y-3">
                          {[
                            'Rastreamento em tempo real',
                            'Histórico completo de localizações',
                            'Alertas de zona personalizados',
                            'Suporte prioritário 24h',
                            'Sem anúncios',
                          ].map(feat => (
                            <li key={feat} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
                                <span className={`material-symbols-outlined text-[14px] ${isPro ? 'text-amber-500' : 'text-primary'}`}>check</span>
                              </span>
                              {feat}
                            </li>
                          ))}
                        </ul>
                        {!isPro && (
                          <button
                            ref={comparePlansTriggerRef}
                            onClick={() => comparePlansModal.open(comparePlansTriggerRef.current)}
                            disabled={subActionLoading}
                            className="mt-5 text-sm font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                            aria-label="Abrir comparação de planos"
                          >
                            Comparar planos <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                          </button>
                        )}
                      </div>

                      {/* Visual cards */}
                      <div className="flex flex-col gap-3">
                        <div className="bg-slate-800 rounded-2xl overflow-hidden h-36 flex items-end p-3 relative">
                          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-emerald-400 to-slate-800" />
                          <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[64px] text-emerald-400/40">map</span>
                          <div className="relative z-10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localização Precisa</p>
                            <p className="text-xs text-white font-semibold">Atualizado agora</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[36px] text-primary/60">my_location</span>
                          </div>
                          <div className={`rounded-2xl h-20 flex flex-col items-center justify-center gap-1 ${isPro ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-primary'}`}>
                            <span className="material-symbols-outlined text-[28px] text-white">verified_user</span>
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Premium Security</p>
                          </div>
                        </div>
                      </div>
                    </m.div>

                    {/* CTA dúvidas */}
                    <m.div variants={itemVariants} className="flex items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">Ficou com alguma dúvida?</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Nossa equipe está pronta para te ajudar a escolher o melhor plano.</p>
                      </div>
                      <button className="shrink-0 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow">
                        Falar com consultor
                      </button>
                    </m.div>
                  </>
                )}
              </div>
            )}

          </m.div>
        </div>
      </main>

      <ComparePlansModal
        isOpen={comparePlansModal.isOpen}
        onClose={comparePlansModal.close}
        subscription={subscription}
        subLoading={subLoading}
        subError={subError}
        subActionLoading={subActionLoading}
        isPro={isPro}
        onSubscribe={handleSubscribe}
        onCancelSubscription={handleCancelSubscription}
        onRetry={handleRetrySubscription}
        onToast={addToast}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

