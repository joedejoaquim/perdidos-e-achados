"use client";

import React from "react";
import { FoundItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers";
import Link from "next/link";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: FoundItem;
  showActions?: boolean;
  onClaim?: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  showActions = true,
  onClaim,
}) => {
  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      document: "📄",
      electronic: "📱",
      key: "🔑",
      other: "📦",
    };
    return emojis[category] || "📦";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getCategoryEmoji(item.category)}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
          {formatCurrency(item.reward_value)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.city}, {item.state}
            </p>
          </div>
          <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded inline-flex whitespace-nowrap ml-2">
            {item.category === "document"
              ? "Documento"
              : item.category === "electronic"
                ? "Eletrônico"
                : item.category === "key"
                  ? "Chave"
                  : "Outro"}
          </span>
        </div>

        <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{formatDate(item.created_at)}</span>
          <span>
            Status:{" "}
            <span className="font-medium">{item.status === "available" ? "Disponível" : "Reivindicado"}</span>
          </span>
        </div>

        {/* Actions */}
        {showActions && item.status === "available" && (
          <div className="flex gap-2">
            <Link
              href={`/item/${item.id}`}
              className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition text-center"
            >
              Ver Detalhes
            </Link>
            {onClaim && (
              <button
                onClick={() => onClaim(item.id)}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition"
              >
                Reivindicar
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export interface ItemListProps {
  items: FoundItem[];
  isLoading?: boolean;
  onClaim?: (itemId: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({ items, isLoading, onClaim }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-border rounded-lg bg-card animate-pulse h-80"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Nenhum item encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
};
