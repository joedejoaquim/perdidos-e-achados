// Currency Formatting
export const formatCurrency = (amount: number, locale = "pt-BR"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

// XP and Level Management
export const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  legend: 5000,
};

export const calculateLevel = (xp: number) => {
  if (xp >= LEVEL_THRESHOLDS.legend) return "legend";
  if (xp >= LEVEL_THRESHOLDS.platinum) return "platinum";
  if (xp >= LEVEL_THRESHOLDS.gold) return "gold";
  if (xp >= LEVEL_THRESHOLDS.silver) return "silver";
  return "bronze";
};

export const getXpToNextLevel = (currentXp: number): number => {
  const levels = Object.values(LEVEL_THRESHOLDS).sort((a, b) => a - b);
  const nextThreshold = levels.find((threshold) => threshold > currentXp);
  return nextThreshold ? nextThreshold - currentXp : 0;
};

// Payment Distribution
export const calculatePaymentDistribution = (
  totalAmount: number
): { finder: number; platform: number } => {
  const finder = totalAmount * 0.8;
  const platform = totalAmount * 0.2;
  return { finder, platform };
};

// Distance Calculation (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

// Date Formatting
export const formatDate = (date: Date | string, locale = "pt-BR"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const formatTime = (date: Date | string, locale = "pt-BR"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "agora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;

  return formatDate(d);
};

// Validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const regex = /^(\+55|0)?\(?[1-9]{2}\)?9?[0-9]{4}-?[0-9]{4}$/;
  return regex.test(phone.replace(/\s/g, ""));
};

export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

// String utilities
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Array utilities
export const chunk = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const removeDuplicates = <T,>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// Object utilities
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
};

// Error Handling
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Local Storage utilities
export const storage = {
  get: <T,>(key: string, defaultValue?: T): T | null => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    if (!item) return defaultValue ?? null;
    try {
      return JSON.parse(item);
    } catch {
      return item as any;
    }
  },
  set: <T,>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

// Environment check
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";
