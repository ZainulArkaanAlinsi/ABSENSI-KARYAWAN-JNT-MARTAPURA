import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/** Helper to convert various date types to Date object safely */
function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object') {
    if ('seconds' in val) return new Date((val as { seconds: number }).seconds * 1000);
    if ('toDate' in val && typeof (val as { toDate?: unknown }).toDate === 'function') {
      return (val as { toDate: () => Date }).toDate();
    }
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? null : d;
}

/** Format a date safely — returns fallback (or '—') on invalid input, never throws. */
export function safeFormatDate(dateVal: unknown, fmt: string): string {
  const d = toDate(dateVal);
  if (!d) return typeof dateVal === 'string' ? dateVal : '—';
  try {
    return format(d, fmt, { locale: localeId });
  } catch {
    return '—';
  }
}

/** Format a time value safely — returns '—' on invalid input, never throws. */
export function safeFormatTime(timeVal: unknown, fmt = 'HH:mm'): string {
  const d = toDate(timeVal);
  if (!d) return '—';
  try {
    return format(d, fmt);
  } catch {
    return '—';
  }
}
