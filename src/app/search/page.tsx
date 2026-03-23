"use client";

import React, { useState, useEffect } from "react";
import { ItemService } from "@/services/item.service";
import { ItemList } from "@/components/ItemCard";
import { FoundItem, ItemCategory } from "@/types";
import { m } from "framer-motion";

export default function SearchPage() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    loadItems();
  }, [filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const searchFilters: any = {};

      if (filters.category) searchFilters.category = filters.category;
      if (filters.city) searchFilters.city = filters.city;
      if (filters.state) searchFilters.state = filters.state;

      const result = await ItemService.searchItems(searchFilters);
      setItems(result);
    } catch (err) {
      console.error("Error searching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories: { value: ItemCategory; label: string }[] = [
    { value: "document", label: "ðŸ“„ Documentos" },
    { value: "electronic", label: "ðŸ“± Eletrônicos" },
    { value: "key", label: "ðŸ”‘ Chaves" },
    { value: "other", label: "ðŸ“¦ Outro" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold mb-2">Buscar Itens Encontrados</h1>
        <p className="text-muted-foreground">
          Procure seus documentos ou objetos perdidos
        </p>
      </m.div>

      {/* Filters */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cidade</label>
            <input
              type="text"
              placeholder="Digite a cidade"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <input
              type="text"
              placeholder="UF ou estado"
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={2}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.category || filters.city || filters.state) && (
          <button
            onClick={() => setFilters({ category: "", city: "", state: "" })}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </m.div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {items.length === 0
            ? "Nenhum item encontrado"
            : `${items.length} item${items.length !== 1 ? "s" : ""} encontrado${items.length !== 1 ? "s" : ""}`}
        </h2>
        <ItemList items={items} isLoading={loading} />
      </div>
    </div>
  );
}


