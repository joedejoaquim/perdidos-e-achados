"use client";

import React from "react";
import { motion } from "framer-motion";
import { LEVEL_THRESHOLDS, getXpToNextLevel } from "@/utils/helpers";

interface XPProgressBarProps {
  xp: number;
  level: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ xp, level }) => {
  const levelThresholds = LEVEL_THRESHOLDS as Record<string, number>;
  const nextLevel = (Object.keys(levelThresholds) as string[]).find(
    (l) => levelThresholds[l] > levelThresholds[level]
  );
  
  const currentLevelXp = levelThresholds[level] || 0;
  const nextLevelXp = nextLevel 
    ? levelThresholds[nextLevel]
    : levelThresholds.legend;
  
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  const getLevelColor = (lvl: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-yellow-700",
      silver: "bg-gray-400",
      gold: "bg-yellow-400",
      platinum: "bg-blue-300",
      legend: "bg-purple-600",
    };
    return colors[lvl] || "bg-gray-500";
  };

  const getLevelEmoji = (lvl: string) => {
    const emojis: Record<string, string> = {
      bronze: "🥉",
      silver: "⭐",
      gold: "🥇",
      platinum: "💎",
      legend: "👑",
    };
    return emojis[lvl] || "🏅";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getLevelEmoji(level)}</span>
          <div>
            <p className="text-sm font-semibold capitalize">{level}</p>
            <p className="text-xs text-muted-foreground">{xp} XP</p>
          </div>
        </div>
        {nextLevel && (
          <span className="text-xs bg-secondary/50 px-2 py-1 rounded">
            {getXpToNextLevel(xp)} XP até {nextLevel}
          </span>
        )}
      </div>

      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getLevelColor(level)}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

interface BadgeItem {
  id: string;
  badges?: {
    icon?: string;
    name?: string;
  };
}

interface BadgeGridProps {
  badges: BadgeItem[];
  layout?: "grid" | "row";
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, layout = "grid" }) => {
  if (layout === "row") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.1 }}
            className="flex-shrink-0 text-center"
          >
            <div className="w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center text-2xl mb-2">
              {badge.badges?.icon || "🏅"}
            </div>
            <p className="text-xs font-medium text-center line-clamp-2">
              {badge.badges?.name}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <div className="w-full aspect-square rounded-lg bg-secondary/50 flex items-center justify-center text-3xl mb-2">
            {badge.badges?.icon || "🏅"}
          </div>
          <p className="text-xs font-medium line-clamp-2">
            {badge.badges?.name}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

interface RankingBoardProps {
  users: Array<{
    id: string;
    name: string;
    xp: number;
    level: string;
    avatar_url?: string;
    rank_position?: number;
  }>;
  limit?: number;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ users, limit = 10 }) => {
  const getLevelEmoji = (level: string) => {
    const emojis: Record<string, string> = {
      bronze: "🥉",
      silver: "⭐",
      gold: "🥇",
      platinum: "💎",
      legend: "👑",
    };
    return emojis[level] || "🏅";
  };

  return (
    <div className="space-y-2">
      {users.slice(0, limit).map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
              #{index + 1}
            </div>
            {user.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.xp} XP</p>
            </div>
          </div>
          <span className="text-xl">{getLevelEmoji(user.level)}</span>
        </motion.div>
      ))}
    </div>
  );
};
