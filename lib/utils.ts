import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
  } catch {
    return dateStr;
  }
}

export function formatMonth(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MM/yyyy', { locale: vi });
  } catch {
    return dateStr;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMonthLabel(date: Date): string {
  return format(date, 'Th. M/yyyy', { locale: vi });
}

// Get last N months as Date objects
export function getLastNMonths(n: number): Date[] {
  const months: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d);
  }
  return months;
}

export function isSameMonth(dateStr: string, month: Date): boolean {
  const d = new Date(dateStr);
  return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
}
