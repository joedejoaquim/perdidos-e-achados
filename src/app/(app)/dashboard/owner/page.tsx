'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import OwnerSidebar from '@/components/dashboard/OwnerSidebar';
import OwnerSearchBar from '@/components/dashboard/OwnerSearchBar';
import RewardFlowCard from '@/components/dashboard/RewardFlowCard';
import ItemSearchCard from '@/components/dashboard/ItemSearchCard';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  title: string;
  image: string;
  location: string;
  description: string;
  timeAgo: string;
  reward?: number;
  status: 'available' | 'in-negotiation' | 'claimed';
  kyc: boolean;
}

export default function OwnerDashboard() {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults] = useState(12);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSearchResults([
        {
          id: '1',
          title: 'Chave BMW Canivete',
          image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuByClSu0916UZKwRMufKGP4fPCqDX_c6kXOA4XWgo9oBHRO_yD2rh7Bj-aWTionUopF0_7UMYbwWFhh3XeifxGabAzrQOyHAB2Xsxod-QYNb64j5W1ZnJZ0Akh6bGqa3rR-EZ0qSDuycTBHLEhumHceoavxzlpeTLxJzRL1DYo8dHsTu2-b4bMNIkpO2W5O8HzdU4cOV5mpu7JJiUfS5h6gF73vRGwrGshRfep8UQiKkqXGNftHc9Dog3scNM7qeCKbJk-fnMeRuHo',
          location: 'Aeroporto de Congonhas, SP',
          description: 'Encontrei uma chave de BMW no estacionamento B. Possui um chaveiro de couro preto.',
          timeAgo: 'Há 2 horas',
          reward: 250,
          status: 'available',
          kyc: true,
        },
        {
          id: '2',
          title: 'Carteira Couro Marrom',
          image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDRztSTYeDlQvQA4RNqQwdOEKaBcou3Uey8865yoon6k0OEKw51iBVrepNbDQgQ1leiP4Xachg8JxFJiHqFwrxTmWb4YqQD0yGo69Jdou0In4dRJdspV9hebKtwWSNR8idDCINnghM0IgCyhtIQh-9q0LYCDVVIBRPsMl0U4vqnpsQHu7V9gnBn5XNrcUOWgYVstilD4mC9oiv28Ue9tUXMz3aNbuj1nHN6m3szRwowcQlOpXm9Mh84Rol3k20-8nrf5y4fWyAT3nc',
          location: 'Parque Ibirapuera, SP',
          description: 'Carteira encontrada perto do portão 3. Contém cartões em nome de "Lucas S."',
          timeAgo: 'Ontem',
          reward: undefined,
          status: 'in-negotiation',
          kyc: false,
        },
        {
          id: '3',
          title: 'iPhone 13 Grafite',
          image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDg5U128EZIELZiB4C5CaMHDuAK7sb2DP9I4Y7FEbCc1QDc_D4K0rCHyk54R-j5IrVk5kLaQkrrwar1rN_Q3PoQ7RCYA7QiiBFN0_rNlBdZdKTMDdLmq-QHOadEXKOCKsgdj1d8Mz-iEgCC5xN5tBRjOIs21NxERvWbN48ewBRod2FqTEJmTXQzCXjEaExeknO2_vPLq-2iLmLj_rkIYgIKytFkXIKSpvEGCbgdefyow67iXIOciGafqSWidPaiPVY_R9ZWLidqeF0',
          location: 'Shopping Eldorado, SP',
          description: 'Celular encontrado na praça de alimentação. Tela intacta, capinha transparente.',
          timeAgo: 'Há 5 horas',
          reward: 500,
          status: 'available',
          kyc: true,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic
  };

  const handleClaimItem = (itemId: string) => {
    console.log('Claiming item:', itemId);
    // Implement claim logic
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Header user={authUser} />

      <main className="flex flex-1 flex-col md:flex-row">
        <OwnerSidebar />

        <div className="flex-1 p-6 flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {/* Search Section */}
          <OwnerSearchBar onSearch={handleSearch} />

          {/* Active Reward Flow */}
          <RewardFlowCard
            title="Fluxo de Recompensa Seguro"
            itemDescription="Item: Chave BMW Série 3 • Protocolo #99281"
            status="Pagamento Retido"
            rewardAmount="R$ 250,00"
            currentStep={1}
            totalSteps={4}
            message="Seu pagamento de R$ 250,00 está protegido em custódia até que você confirme o recebimento do item."
          />

          {/* Search Results */}
          <section className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Resultados Encontrados
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {totalResults} itens
                </span>
              </h3>
              <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <ItemSearchCard
                  key={item.id}
                  {...item}
                  onClaim={() => handleClaimItem(item.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Success Notification */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 items-end z-[100]">
        <div className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce max-w-xs border-4 border-green-400">
          <div className="bg-white text-green-500 p-2 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined font-bold">payments</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Sucesso! Recompensa Liberada</h4>
            <p className="text-[10px] opacity-90">R$ 150,00 enviados para João M.</p>
          </div>
          <button className="ml-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
