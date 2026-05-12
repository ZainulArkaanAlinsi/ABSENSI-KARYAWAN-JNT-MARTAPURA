import { format, parseISO, isValid } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { timeValueToISO } from '@/lib/departmentRules';

/** Helper to convert various date types to Date object safely */
function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object') {
    if ('seconds' in val) return new Date(val.seconds * 1000);
    if ('toDate' in val && typeof val.toDate === 'function') return val.toDate();
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/** Format a date safely — returns fallback (or '—') on invalid input, never throws. */
export function safeFormatDate(dateVal: any, fmt: string): string {
  const d = toDate(dateVal);
  if (!d) return typeof dateVal === 'string' ? dateVal : '—';
  try {
    return format(d, fmt, { locale: localeId });
  } catch { return '—'; }
}

/** Format a time value safely — returns '—' on invalid input, never throws. */
export function safeFormatTime(timeVal: unknown, fmt = 'HH:mm'): string {
  const d = toDate(timeVal);
  if (!d) return '—';
  try {
    return format(d, fmt);
  } catch { return '—'; }
}
