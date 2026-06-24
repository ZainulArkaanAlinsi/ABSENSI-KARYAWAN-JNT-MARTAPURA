'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trophy, Clock, Truck, Receipt, Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCsv } from '@/utils/exportCsv';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmployees } from '@/lib/firestore';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Employee, AttendanceRecord } from '@/types';

const rupiah = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const MEDALS = ['🥇', '🥈', '🥉'];

interface Row {
  uid: string;
  name: string;
  dept: string;
  value: number;
  sub?: string;
}

export default function LeaderboardPage() {
  const [emps, setEmps] = useState<Employee[]>([]);
  const [att, setAtt] = useState<AttendanceRecord[]>([]);
  const [pkgs, setPkgs] = useState<{ userId: string; value: number }[]>([]);
  const [sales, setSales] = useState<{ userId: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const monthPrefix = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy', { locale: idLocale });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const lo = `${monthPrefix}-01`,
          hi = `${monthPrefix}-31`;
        const [e, a, p, s] = await Promise.all([
          getEmployees(),
          getDocs(
            query(collection(db, 'attendance'), where('date', '>=', lo), where('date', '<=', hi)),
          ),
          getDocs(
            query(
              collection(db, 'courier_packages'),
              where('date', '>=', lo),
              where('date', '<=', hi),
            ),
          ),
          getDocs(
            query(collection(db, 'daily_sales'), where('date', '>=', lo), where('date', '<=', hi)),
          ),
        ]);
        if (!alive) return;
        setEmps(e);
        setAtt(a.docs.map((d) => d.data() as AttendanceRecord));
        setPkgs(p.docs.map((d) => ({ userId: d.data().userId, value: d.data().count || 0 })));
        setSales(s.docs.map((d) => ({ userId: d.data().userId, value: d.data().amount || 0 })));
      } catch (err) {
        console.error('leaderboard load', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [monthPrefix]);

  const nameOf = useMemo(() => {
    const m: Record<string, Employee> = {};
    emps.forEach((e) => {
      if (e.uid) m[e.uid] = e;
    });
    return m;
  }, [emps]);

  // 🏆 Paling rajin: hadir terbanyak, tie-break telat paling sedikit.
  const punctual = useMemo<Row[]>(() => {
    const agg: Record<string, { present: number; late: number }> = {};
    att.forEach((r) => {
      if (!r.userId) return;
      agg[r.userId] ??= { present: 0, late: 0 };
      if (['present', 'late', 'overtime'].includes(r.status)) agg[r.userId].present += 1;
      if (r.status === 'late') agg[r.userId].late += 1;
    });
    return Object.entries(agg)
      .map(([uid, v]) => ({
        uid,
        name: nameOf[uid]?.name ?? '—',
        dept: nameOf[uid]?.department ?? '',
        value: v.present,
        sub: v.late === 0 ? 'tanpa telat' : `${v.late}× telat`,
      }))
      .filter((r) => r.name !== '—' && r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [att, nameOf]);

  const sumBy = (rows: { userId: string; value: number }[]): Row[] => {
    const agg: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.userId) return;
      agg[r.userId] = (agg[r.userId] || 0) + (r.value || 0);
    });
    return Object.entries(agg)
      .map(([uid, value]) => ({
        uid,
        name: nameOf[uid]?.name ?? '—',
        dept: nameOf[uid]?.department ?? '',
        value,
      }))
      .filter((r) => r.name !== '—' && r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const topCouriers = useMemo(() => sumBy(pkgs), [pkgs, nameOf]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const topSales = useMemo(() => sumBy(sales), [sales, nameOf]);

  const handleExportCsv = () => {
    const all = [
      ...punctual.map((r, i) => ['Paling Rajin', i + 1, r.name, r.dept, r.value, r.sub ?? '']),
      ...topCouriers.map((r, i) => ['Top Kurir', i + 1, r.name, r.dept, r.value, 'paket']),
      ...topSales.map((r, i) => ['Top Sales', i + 1, r.name, r.dept, r.value, 'rupiah']),
    ];
    if (all.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }
    exportToCsv(
      `Leaderboard_${monthPrefix}`,
      ['Kategori', 'Peringkat', 'Nama', 'Departemen', 'Nilai', 'Keterangan'],
      all,
    );
    toast.success('Papan peringkat diekspor');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} style={{ color: '#E31E24' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Apresiasi
            </span>
          </div>
          <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
            Papan <span style={{ color: '#E31E24' }}>Peringkat</span>
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5 capitalize">
            Kinerja terbaik bulan {monthLabel}.
          </p>
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
        <div className="py-20 text-center text-slate-400 text-sm">Menghitung peringkat…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Board title="Paling Rajin" icon={Clock} rows={punctual} unit="hari hadir" />
          <Board title="Top Kurir" icon={Truck} rows={topCouriers} unit="paket" />
          <Board title="Top Sales" icon={Receipt} rows={topSales} format={rupiah} />
        </div>
      )}
    </div>
  );
}

function Board({
  title,
  icon: Icon,
  rows,
  unit,
  format: fmt,
}: {
  title: string;
  icon: React.ElementType;
  rows: Row[];
  unit?: string;
  format?: (n: number) => string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-slate-100"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h3 className="text-[14px] font-black text-slate-800 tracking-tight">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-slate-400">Belum ada data bulan ini.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div
              key={r.uid}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${i < 3 ? 'bg-amber-50/60' : ''}`}
            >
              <div className="w-6 text-center shrink-0 text-[14px] font-black tabular-nums text-slate-400">
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 truncate">{r.name}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {r.dept || '—'}
                  {r.sub ? ` · ${r.sub}` : ''}
                </p>
              </div>
              <p
                className="text-[14px] font-black tabular-nums shrink-0"
                style={{ color: i < 3 ? '#E31E24' : '#0f172a' }}
              >
                {fmt ? fmt(r.value) : r.value}
                {unit && !fmt ? (
                  <span className="text-[9px] font-bold text-slate-400 ml-1">{unit}</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
