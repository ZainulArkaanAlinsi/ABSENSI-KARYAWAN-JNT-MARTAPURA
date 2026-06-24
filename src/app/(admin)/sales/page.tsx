'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { BarChart3, Search, Check, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCsv } from '@/utils/exportCsv';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmployees } from '@/lib/firestore';
import { format } from 'date-fns';
import type { Employee } from '@/types';
import MonthlyTrend from '@/components/charts/MonthlyTrend';

// Sales = karyawan di departemen penjualan / counter (SCO).
const isSales = (dept?: string): boolean =>
  !!dept && /sales|sco|counter|penjualan|kasir/i.test(dept);

const rupiah = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

interface Entry {
  amount: number;
  dirty: boolean;
  saving: boolean;
  saved: boolean;
}

export default function SalesPage() {
  const [officers, setOfficers] = useState<Employee[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [trend, setTrend] = useState<{ day: string; value: number }[]>([]);

  const monthPrefix = date.slice(0, 7);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const emps = await getEmployees();
        if (alive)
          setOfficers(emps.filter((e) => isSales(e.department as string) && e.isActive !== false));
      } catch (e) {
        console.error('load sales officers', e);
      }
    })();
    return () => {
      alive = false;
    };
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
      } catch (e) {
        console.error('load sales', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [date]);

  // Tren bulanan: total penjualan (Rp) per hari dalam bulan terpilih.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'daily_sales'),
            where('date', '>=', `${monthPrefix}-01`),
            where('date', '<=', `${monthPrefix}-31`),
          ),
        );
        const byDay: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const dd = (data.date as string)?.slice(8, 10);
          if (dd) byDay[dd] = (byDay[dd] || 0) + (data.amount || 0);
        });
        const [y, m] = monthPrefix.split('-').map(Number);
        const days = new Date(y, m, 0).getDate();
        const arr = Array.from({ length: days }, (_, i) => {
          const dd = String(i + 1).padStart(2, '0');
          return { day: String(i + 1), value: byDay[dd] || 0 };
        });
        if (alive) setTrend(arr);
      } catch (e) {
        console.error('load sales trend', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [monthPrefix]);

  const setAmount = (uid: string, val: number) => {
    const n = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
    setEntries((prev) => ({
      ...prev,
      [uid]: { amount: n, dirty: true, saving: false, saved: false },
    }));
  };

  const save = useCallback(
    async (o: Employee) => {
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
        setEntries((prev) => ({
          ...prev,
          [o.uid]: { ...prev[o.uid], dirty: false, saving: false, saved: true },
        }));
      } catch (e) {
        console.error('save sales', e);
        setEntries((prev) => ({ ...prev, [o.uid]: { ...prev[o.uid], saving: false } }));
      }
    },
    [entries, date],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return officers
      .filter(
        (o) =>
          !term ||
          o.name.toLowerCase().includes(term) ||
          (o.department || '').toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [officers, q]);

  const total = useMemo(
    () => Object.values(entries).reduce((s, e) => s + (e.amount || 0), 0),
    [entries],
  );

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }
    exportToCsv(
      `Penjualan_${date}`,
      ['Tanggal', 'Nama Sales', 'Departemen', 'Nilai Penjualan (Rp)'],
      filtered.map((o) => {
        const entry = entries[o.uid] ?? { amount: 0 };
        return [date, o.name, o.department ?? '', entry.amount ?? 0];
      }),
    );
    toast.success(`${filtered.length} data penjualan diekspor`);
  };

  // Recap bulanan dari data tren (total & rata-rata per hari aktif).
  const monthRecap = useMemo(() => {
    const totalMonth = trend.reduce((s, t) => s + t.value, 0);
    const activeDays = trend.filter((t) => t.value > 0).length;
    return {
      totalMonth,
      activeDays,
      avg: activeDays ? Math.round(totalMonth / activeDays) : 0,
    };
  }, [trend]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} style={{ color: '#E31E24' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Operasional
            </span>
          </div>
          <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
            Input <span style={{ color: '#E31E24' }}>Penjualan</span> Harian
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            Catat nilai penjualan tiap Sales Counter Officer per hari.
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[22px] font-black tabular-nums leading-none"
            style={{ color: '#E31E24' }}
          >
            {rupiah(total)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total hari ini
          </p>
        </div>
      </div>

      {/* Tren bulanan */}
      <div
        className="bg-white rounded-2xl p-5 border border-slate-100"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tren Penjualan Harian · {monthPrefix}
          </p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[15px] font-black tabular-nums leading-none text-slate-800">
                {rupiah(monthRecap.totalMonth)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Total bulan
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-black tabular-nums leading-none text-slate-800">
                {rupiah(monthRecap.avg)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Rata-rata/hari
              </p>
            </div>
          </div>
        </div>
        <MonthlyTrend
          data={trend}
          color="#E31E24"
          gradientId="salesTrend"
          valueFormatter={(n) =>
            n >= 1_000_000
              ? 'Rp ' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'jt'
              : n >= 1_000
                ? 'Rp ' + Math.round(n / 1_000) + 'rb'
                : 'Rp ' + n
          }
        />
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
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition-all shrink-0"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <BarChart3 size={26} />
          </div>
          <p className="text-sm font-bold text-slate-500">Belum ada sales officer</p>
          <p className="text-[12px] text-slate-400 mt-1">
            Tambah karyawan dept Sales/Counter di menu Karyawan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const entry = entries[o.uid] ?? {
              amount: 0,
              dirty: false,
              saving: false,
              saved: false,
            };
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
                  <p className="text-[11px] text-slate-400 truncate">
                    {o.department || 'Sales'} · {rupiah(entry.amount)}
                  </p>
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
                  {entry.saving ? (
                    <Loader2 size={16} className="text-slate-400 animate-spin" />
                  ) : entry.saved ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : entry.dirty ? (
                    <span className="text-[9px] font-bold text-amber-500 uppercase">simpan…</span>
                  ) : null}
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
