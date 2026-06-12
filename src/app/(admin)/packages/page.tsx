'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Package, Search, Check, Loader2 } from 'lucide-react';
import {
  collection, query, where, getDocs, doc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmployees } from '@/lib/firestore';
import { getRuleByDept } from '@/lib/departmentRules';
import { format } from 'date-fns';
import type { Employee } from '@/types';
import MonthlyTrend from '@/components/charts/MonthlyTrend';

// Kurir = karyawan di departemen pengiriman.
const isCourier = (dept?: string): boolean =>
  !!dept && /rider|driver|delivery|kurir/i.test(dept);

interface Entry { count: number; dirty: boolean; saving: boolean; saved: boolean; }

export default function PackagesPage() {
  const [couriers, setCouriers] = useState<Employee[]>([]);
  const [date, setDate]         = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries]   = useState<Record<string, Entry>>({});
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');
  const [trend, setTrend]       = useState<{ day: string; value: number }[]>([]);

  const monthPrefix = date.slice(0, 7); // yyyy-MM dari tanggal terpilih

  // Daftar kurir (sekali).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const emps = await getEmployees();
        if (alive) {
          setCouriers(emps.filter((e) => isCourier(e.department as string) && e.isActive !== false));
        }
      } catch (e) { console.error('load couriers', e); }
    })();
    return () => { alive = false; };
  }, []);

  // Data paket untuk tanggal terpilih.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courier_packages'), where('date', '==', date)));
        const map: Record<string, Entry> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          map[data.userId] = { count: data.count ?? 0, dirty: false, saving: false, saved: true };
        });
        if (alive) setEntries(map);
      } catch (e) { console.error('load packages', e); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [date]);

  // Tren bulanan: total paket per hari dalam bulan terpilih.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'courier_packages'),
          where('date', '>=', `${monthPrefix}-01`),
          where('date', '<=', `${monthPrefix}-31`),
        ));
        const byDay: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const dd = (data.date as string)?.slice(8, 10);
          if (dd) byDay[dd] = (byDay[dd] || 0) + (data.count || 0);
        });
        const [y, m] = monthPrefix.split('-').map(Number);
        const days = new Date(y, m, 0).getDate();
        const arr = Array.from({ length: days }, (_, i) => {
          const dd = String(i + 1).padStart(2, '0');
          return { day: String(i + 1), value: byDay[dd] || 0 };
        });
        if (alive) setTrend(arr);
      } catch (e) { console.error('load package trend', e); }
    })();
    return () => { alive = false; };
  }, [monthPrefix]);

  const setCount = (uid: string, val: number) => {
    const n = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
    setEntries((prev) => ({ ...prev, [uid]: { count: n, dirty: true, saving: false, saved: false } }));
  };

  const save = useCallback(async (c: Employee) => {
    const entry = entries[c.uid];
    if (!entry || !entry.dirty) return;
    setEntries((prev) => ({ ...prev, [c.uid]: { ...prev[c.uid], saving: true } }));
    const rule = getRuleByDept(c.department as string);
    try {
      await setDoc(
        doc(db, 'courier_packages', `${date}_${c.uid}`),
        {
          userId: c.uid,
          courierName: c.name,
          department: c.department ?? '',
          date,
          count: entry.count,
          target: rule?.dailyTarget ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setEntries((prev) => ({ ...prev, [c.uid]: { ...prev[c.uid], dirty: false, saving: false, saved: true } }));
    } catch (e) {
      console.error('save package', e);
      setEntries((prev) => ({ ...prev, [c.uid]: { ...prev[c.uid], saving: false } }));
    }
  }, [entries, date]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return couriers
      .filter((c) => !term || c.name.toLowerCase().includes(term) || (c.department || '').toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [couriers, q]);

  const total = useMemo(
    () => Object.values(entries).reduce((s, e) => s + (e.count || 0), 0),
    [entries],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} style={{ color: '#E31E24' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Operasional</span>
          </div>
          <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
            Input <span style={{ color: '#E31E24' }}>Paket</span> Harian
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            Catat jumlah paket terkirim tiap kurir per hari, dibandingkan target.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[26px] font-black tabular-nums leading-none" style={{ color: '#E31E24' }}>{total}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total paket</p>
          </div>
        </div>
      </div>

      {/* Tren bulanan */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tren Paket Harian · {monthPrefix}</p>
        <MonthlyTrend data={trend} color="#E31E24" gradientId="pkgTrend" />
      </div>

      {/* Controls */}
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
            placeholder="Cari kurir…"
            className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Package size={26} />
          </div>
          <p className="text-sm font-bold text-slate-500">Belum ada kurir</p>
          <p className="text-[12px] text-slate-400 mt-1">Tambah karyawan dept pengiriman di menu Karyawan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const entry = entries[c.uid] ?? { count: 0, dirty: false, saving: false, saved: false };
            const rule = getRuleByDept(c.department as string);
            const target = rule?.dailyTarget ?? null;
            const pct = target ? Math.min(100, Math.round((entry.count / target) * 100)) : null;
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl px-4 py-3 border border-slate-100 flex items-center gap-4"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[14px] shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {c.department || 'Kurir'}{target ? ` · target ${target}` : ''}
                  </p>
                  {pct !== null && (
                    <div className="mt-1.5 h-1.5 w-full max-w-[180px] rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: pct >= 100 ? '#10B981' : '#E31E24' }}
                      />
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  value={entry.count}
                  onChange={(e) => setCount(c.uid, parseInt(e.target.value, 10))}
                  onBlur={() => save(c)}
                  className="w-20 text-center text-[15px] font-bold tabular-nums px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                />
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
        Angka tersimpan otomatis saat keluar dari kolom input. Pilih tanggal lain untuk melihat / mengubah riwayat.
      </p>
    </div>
  );
}
