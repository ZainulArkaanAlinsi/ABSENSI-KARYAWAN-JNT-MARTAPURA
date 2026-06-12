'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { BarChart3, Search, Check, Loader2 } from 'lucide-react';
import {
  collection, query, where, getDocs, doc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmployees } from '@/lib/firestore';
import { format } from 'date-fns';
import type { Employee } from '@/types';

// Sales = karyawan di departemen penjualan / counter (SCO).
const isSales = (dept?: string): boolean =>
  !!dept && /sales|sco|counter|penjualan|kasir/i.test(dept);

const rupiah = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

interface Entry { amount: number; dirty: boolean; saving: boolean; saved: boolean; }

export default function SalesPage() {
  const [officers, setOfficers] = useState<Employee[]>([]);
  const [date, setDate]         = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries]   = useState<Record<string, Entry>>({});
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const emps = await getEmployees();
        if (alive) setOfficers(emps.filter((e) => isSales(e.department as string) && e.isActive !== false));
      } catch (e) { console.error('load sales officers', e); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'daily_sales'), where('date', '==', date)));
        const map: Record<string, Entry> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          map[data.userId] = { amount: data.amount ?? 0, dirty: false, saving: false, saved: true };
        });
        if (alive) setEntries(map);
      } catch (e) { console.error('load sales', e); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [date]);

  const setAmount = (uid: string, val: number) => {
    const n = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
    setEntries((prev) => ({ ...prev, [uid]: { amount: n, dirty: true, saving: false, saved: false } }));
  };

  const save = useCallback(async (o: Employee) => {
    const entry = entries[o.uid];
    if (!entry || !entry.dirty) return;
    setEntries((prev) => ({ ...prev, [o.uid]: { ...prev[o.uid], saving: true } }));
    try {
      await setDoc(
        doc(db, 'daily_sales', `${date}_${o.uid}`),
        {
          userId: o.uid,
          officerName: o.name,
          department: o.department ?? '',
          date,
          amount: entry.amount,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setEntries((prev) => ({ ...prev, [o.uid]: { ...prev[o.uid], dirty: false, saving: false, saved: true } }));
    } catch (e) {
      console.error('save sales', e);
      setEntries((prev) => ({ ...prev, [o.uid]: { ...prev[o.uid], saving: false } }));
    }
  }, [entries, date]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return officers
      .filter((o) => !term || o.name.toLowerCase().includes(term) || (o.department || '').toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [officers, q]);

  const total = useMemo(
    () => Object.values(entries).reduce((s, e) => s + (e.amount || 0), 0),
    [entries],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} style={{ color: '#E31E24' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Operasional</span>
          </div>
          <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
            Input <span style={{ color: '#E31E24' }}>Penjualan</span> Harian
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            Catat nilai penjualan tiap Sales Counter Officer per hari.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-black tabular-nums leading-none" style={{ color: '#E31E24' }}>{rupiah(total)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total hari ini</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          max={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        />
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari sales…"
            className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <BarChart3 size={26} />
          </div>
          <p className="text-sm font-bold text-slate-500">Belum ada sales officer</p>
          <p className="text-[12px] text-slate-400 mt-1">Tambah karyawan dept Sales/Counter di menu Karyawan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const entry = entries[o.uid] ?? { amount: 0, dirty: false, saving: false, saved: false };
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl px-4 py-3 border border-slate-100 flex items-center gap-4"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[14px] shrink-0">
                  {o.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{o.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{o.department || 'Sales'} · {rupiah(entry.amount)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={entry.amount}
                    onChange={(e) => setAmount(o.uid, parseInt(e.target.value, 10))}
                    onBlur={() => save(o)}
                    className="w-32 text-right text-[14px] font-bold tabular-nums px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  />
                </div>
                <div className="w-6 flex justify-center shrink-0">
                  {entry.saving
                    ? <Loader2 size={16} className="text-slate-400 animate-spin" />
                    : entry.saved
                      ? <Check size={16} className="text-emerald-500" />
                      : entry.dirty
                        ? <span className="text-[9px] font-bold text-amber-500 uppercase">simpan…</span>
                        : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Tersimpan otomatis saat keluar dari kolom. Pilih tanggal lain untuk riwayat.
      </p>
    </div>
  );
}
