import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return (score * 100).toFixed(1) + '%';
}

export function getSeverityColor(severity: string) {
  switch (severity?.toLowerCase()) {
    case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
}
