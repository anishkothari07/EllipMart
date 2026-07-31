import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = 'INR') {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function discountPct(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export * from './env';
export * from './data';
export * from './utils/cache';
export * from './utils/errorHandler';
export * from './utils/jwt';
export * from './utils/logger';
export * from './utils/password';
export * from './utils/rateLimit';
export * from './utils/response';
export * from './events/domain-event.bus';
export * from './responsive/responsive-hooks';
export * from './motion/presets';
export * from './motion/tokens';
export * from './utils/order';
