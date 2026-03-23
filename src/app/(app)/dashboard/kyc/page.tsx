'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function KYCPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Documento', desc: 'Foto do RG ou CNH', icon: 'badge' },
    { title: 'Selfie', desc: 'Reconhecimento facial', icon: 'face' },
    { title: 'Endereço', desc: 'Comprovante recente', icon: 'home_pin' }
  ];

  const handleNext = async () => {
    if (step < 3) setStep(step + 1);
    else {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { error } = await supabase
          .from('users')
          .update({ kyc_status: 'pending' })
          .eq('id', user.id);
        
        if (error) throw error;
        
        setStep(4);
      } catch (err) {
        console.error("Erro no KYC:", err);
        alert("Erro ao enviar documentos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
      <Header user={user} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col items-center justify-center">
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {step < 4 ? (
            <>
              <div className="text-center mb-10">
                <span className="material-symbols-outlined text-primary text-[48px] mb-4">verified_user</span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Verificação de Identidade (KYC)</h1>
                <p className="text-slate-500 mt-2">Para garantir transações seguras e liberação de recompensas.</p>
              </div>

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 -z-10" />
                <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary transition-all duration-500 -z-10" style={{ width: `${(step - 1) * 50}%` }} />
                
                {steps.map((s, idx) => {
                  const active = step >= idx + 1;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg transition-colors duration-500 ${active ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                         <span className="material-symbols-outlined">{s.icon}</span>
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-slate-400'}`}>{s.title}</span>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <m.div 
                  key={step} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 text-center flex flex-col items-center border-dashed"
                >
                  <span className="material-symbols-outlined text-[64px] text-slate-400 mb-4 animate-bounce">upload_file</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Envie {steps[step - 1].desc}</h3>
                  <p className="text-sm text-slate-500 mb-6">Arraste e solte o arquivo ou clique para procurar no seu dispositivo.</p>
                  <button className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-white shadow-sm hover:shadow-md transition-all">
                    Selecionar Arquivo
                  </button>
                </m.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : (step === 3 ? 'Finalizar Envio' : 'Próxima Etapa')}
                </button>
              </div>
            </>
          ) : (
            <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
               <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                 <span className="material-symbols-outlined text-[48px]">check_circle</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Documentos Recebidos!</h2>
               <p className="text-slate-500">Sua verificação KYC está em análise de segurança. O status será atualizado em até 24 horas.</p>
               <button onClick={() => window.location.assign('/dashboard/owner')} className="mt-8 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Voltar ao Dashboard</button>
            </m.div>
          )}
        </m.div>
      </main>
    </div>
  );
}

