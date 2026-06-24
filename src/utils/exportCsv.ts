// Utility export CSV terpusat — dipakai lintas halaman admin.
// Robust: escaping koma/kutip/newline + BOM UTF-8 agar Excel baca nama
// Indonesia & karakter khusus dengan benar.

type Cell = string | number | null | undefined;

export function exportToCsv(filename: string, headers: string[], rows: Cell[][]): void {
  const esc = (v: Cell): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
