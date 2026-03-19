'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

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
          <motion.div 
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
          </motion.div>

          {/* Settings Content Area */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            {activeTab === 'perfil' && (
              <div className="max-w-xl">
                 <motion.h2 variants={itemVariants} className="text-xl font-bold text-slate-900 dark:text-white mb-6">Informações Pessoais</motion.h2>
                 
                 <motion.div variants={itemVariants} className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 shrink-0">
                     {user?.name?.charAt(0).toUpperCase() || "A"}
                   </div>
                   <div>
                     <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-sm font-bold shadow-sm hover:shadow transition-all border border-slate-200 dark:border-slate-700">Alterar Foto</button>
                     <p className="text-xs text-slate-500 mt-2">Formatos: JPG, PNG até 5MB</p>
                   </div>
                 </motion.div>

                  <motion.form variants={itemVariants} onSubmit={handleSave} className="space-y-5">
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
                  </motion.form>
              </div>
            )}

            {activeTab !== 'perfil' && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-60">
                 <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">construction</span>
                 <p className="font-semibold text-slate-600 dark:text-slate-300">Esta aba ainda está sendo construída</p>
              </div>
            )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}
