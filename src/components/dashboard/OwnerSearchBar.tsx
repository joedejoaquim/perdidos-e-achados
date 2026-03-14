'use client';

import { useState } from 'react';

interface Suggestion {
  icon: string;
  text: string;
  highlight?: string;
}

interface OwnerSearchBarProps {
  onSearch?: (query: string) => void;
}

export default function OwnerSearchBar({ onSearch }: OwnerSearchBarProps) {
  const [query, setQuery] = useState('Chaves de carro');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions: Suggestion[] = [
    {
      icon: 'history',
      text: 'Chaves de carro ',
      highlight: 'Mercedes',
    },
    {
      icon: 'key',
      text: 'Chave canivete ',
      highlight: 'BMW',
    },
    {
      icon: 'smart_button',
      text: 'Chaveiro ',
      highlight: 'BMW',
    },
  ];

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text.trim());
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(text.trim());
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="relative w-full">
        <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <div className="text-slate-400 flex items-center justify-center pl-4">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-4 text-base placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            placeholder="O que você perdeu? Ex: Chaves de carro BMW, Carteira azul..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="flex items-center pr-2 gap-2">
            <button
              onClick={() => setQuery('')}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">cancel</span>
            </button>
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-6 h-10 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase text-slate-400 px-2 tracking-widest">
                Sugestões de busca
              </span>
            </div>
            <div className="flex flex-col max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text + suggestion.highlight)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors text-slate-700 dark:text-slate-300"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    {suggestion.icon}
                  </span>
                  <span className="text-sm font-medium">
                    {suggestion.text}
                    {suggestion.highlight && (
                      <strong className="text-slate-900 dark:text-slate-100">
                        {suggestion.highlight}
                      </strong>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary transition-all">
          <span className="material-symbols-outlined text-lg">category</span>
          <span>Categoria</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
        <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary transition-all">
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span>Últimos 7 dias</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
        <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary transition-all">
          <span className="material-symbols-outlined text-lg">location_on</span>
          <span>São Paulo, SP</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
        <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary transition-all">
          <span className="material-symbols-outlined text-lg">payments</span>
          <span>Com Recompensa</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>
    </section>
  );
}
