'use client';

import { useEffect, useMemo, useState } from 'react';
import { Truck, Target, Search, Clock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmployees } from '@/lib/firestore';
import { getRuleByDept } from '@/lib/departmentRules';
import { format } from 'date-fns';
import type { Employee, AttendanceRecord } from '@/types';

// Kurir = karyawan di departemen pengiriman (rider/driver/delivery/kurir).
const isCourier = (dept?: string): boolean => !!dept && /rider|driver|delivery|kurir/i.test(dept);

const STATUS_META: Record<string, { label: string; cls: string }> = {
  present: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-600' },
  late: { label: 'Telat', cls: 'bg-amber-50 text-amber-600' },
  overtime: { label: 'Lembur', cls: 'bg-indigo-50 text-indigo-600' },
  leave: { label: 'Izin/Cuti', cls: 'bg-slate-100 text-slate-500' },
  absent: { label: 'Tidak Hadir', cls: 'bg-red-50 text-red-600' },
  belum: { label: 'Belum Absen', cls: 'bg-slate-100 text-slate-400' },
};

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const monthPrefix = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const emps = await getEmployees();
        const cs = emps.filter((e) => isCourier(e.department as string) && e.isActive !== false);
        const snap = await getDocs(
          query(collection(db, 'attendance'), where('date', '>=', `${monthPrefix}-01`)),
        );
        const recs = snap.docs.map((d) => d.data() as AttendanceRecord);
        if (!alive) return;
        setCouriers(cs);
        setRecords(recs);
      } catch (e) {
        console.error('CouriersPage load error', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [monthPrefix]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return couriers
      .map((c) => {
        const mine = records.filter((r) => r.userId === c.uid);
        const today = mine.find((r) => r.date === todayStr);
        const present = mine.filter((r) =>
          ['present', 'late', 'overtime'].includes(r.status),
        ).length;
        const late = mine.filter((r) => r.status === 'late').length;
        const rule = getRuleByDept(c.department as string);
        return {
          c,
          target: rule?.target ?? (rule?.dailyTarget ? `${rule.dailyTarget} paket/hari` : '—'),
          todayStatus: today ? today.status : 'belum',
          present,
          late,
        };
      })
      .filter(
        (r) =>
          !term ||
          r.c.name.toLowerCase().includes(term) ||
          (r.c.department || '').toLowerCase().includes(term),
      )
      .sort((a, b) => a.c.name.localeCompare(b.c.name));
  }, [couriers, records, q, todayStr]);

  const activeToday = rows.filter(
    (r) => r.todayStatus !== 'belum' && r.todayStatus !== 'absent',
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={18} style={{ color: '#E31E24' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Operasional
            </span>
          </div>
          <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
            Manajemen <span style={{ color: '#E31E24' }}>Kurir</span>
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            Pantau kurir aktif, target harian, & performa absensi bulan ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p
              className="text-[26px] font-black tabular-nums leading-none"
              style={{ color: '#E31E24' }}
            >
              {activeToday}
              <span className="text-slate-300">/{rows.length}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Aktif hari ini
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kurir / departemen…"
          className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Memuat data kurir…</div>
      ) : rows.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Truck size={26} />
          </div>
          <p className="text-sm font-bold text-slate-500">Belum ada kurir</p>
          <p className="text-[12px] text-slate-400 mt-1">
            Tambahkan karyawan dengan departemen pengiriman (Rider/Driver Delivery) di menu
            Karyawan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map(({ c, target, todayStatus, present, late }) => {
            const meta = STATUS_META[todayStatus] ?? STATUS_META.belum;
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-slate-100"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[15px] shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.department || 'Kurir'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Target size={13} className="text-slate-400" />
                  <span className="font-medium">{target}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                      Hadir (bln)
                    </p>
                    <p className="text-[16px] font-black text-slate-800 tabular-nums">{present}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={9} /> Telat (bln)
                    </p>
                    <p
                      className="text-[16px] font-black tabular-nums"
                      style={{ color: late > 0 ? '#E31E24' : '#0f172a' }}
                    >
                      {late}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
