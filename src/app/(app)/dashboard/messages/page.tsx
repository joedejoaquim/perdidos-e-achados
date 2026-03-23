'use client';

import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadChats = async () => {
      try {
        const { data: claims, error } = await supabase
          .from('claims')
          .select(`
            id,
            status,
            created_at,
            found_items (
              title
            )
          `)
          .or(`owner_id.eq.${user.id},finder_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedChats: Chat[] = claims.map((c: any) => ({
          id: c.id,
          name: c.found_items?.title || 'Chamado de Devolução',
          lastMessage: `Status: ${c.status}`,
          time: new Date(c.created_at).toLocaleDateString(),
          unread: 0,
          avatar: (c.found_items?.title?.charAt(0) || 'D').toUpperCase()
        }));

        setChats(mappedChats);
      } catch (err) {
        console.error("Erro ao carregar chats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user?.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Em um sistema real aqui salvaríamos na tabela 'messages'
    // Por enquanto simulamos a interação baseada no Claim real selecionado
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
      <Header user={user} />
      
      <main className="flex-1 flex max-w-[1440px] mx-auto w-full p-4 md:p-6 overflow-hidden max-h-[calc(100vh-80px)]">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl"
        >
          {/* Sidebar Chats */}
          <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mensagens REAIS</h2>
              <div className="mt-4 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input type="text" placeholder="Buscar conversas..." className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center"><span className="animate-spin material-symbols-outlined text-primary">sync</span></div>
              ) : chats.length > 0 ? (
                chats.map(chat => (
                  <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors ${activeChat === chat.id ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{chat.name}</h3>
                        <span className="text-[10px] text-slate-400">{chat.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">Nenhum chamado ativo para conversar.</div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-slate-50/50 dark:bg-[#0a0f1c]">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {chats.find(c => c.id === activeChat)?.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{chats.find(c => c.id === activeChat)?.name}</h3>
                    <p className="text-xs text-emerald-500 font-medium">Chat do Chamado Ativo</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                   <div className="flex justify-center mb-6">
                     <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-3 py-1 rounded-full">Início da conversa</span>
                   </div>
                   
                   <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
                     <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm border border-slate-100 dark:border-slate-700">
                       <p className="text-sm text-slate-700 dark:text-slate-200">Olá! Este é o chat oficial para combinar a devolução do item: <strong>{chats.find(c => c.id === activeChat)?.name}</strong>. Como posso ajudar?</p>
                     </div>
                   </m.div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua mensagem para o outro usuário..." 
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                    />
                    <button type="submit" className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50" disabled={!message.trim()}>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-[64px] mb-4 opacity-20">forum</span>
                <p>Selecione um chamado real para conversar</p>
              </div>
            )}
          </div>
        </m.div>
      </main>
    </div>
  );
}

