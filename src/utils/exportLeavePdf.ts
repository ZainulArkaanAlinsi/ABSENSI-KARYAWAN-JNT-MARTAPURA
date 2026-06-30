// Laporan PDF Cuti & Izin — dibangun sebagai HTML ber-brand JNE lalu dibuka di
// jendela cetak (Save as PDF). Tanpa dependency tambahan, kontrol layout penuh,
// aman untuk static export. Data DIKELOMPOKKAN per tipe (semua cuti jadi satu
// grup, semua sakit jadi satu grup, dst.) + rekap total hari per grup & grand
// total, plus pemisahan "Terpakai (Cuti/Sakit)".

import { safeFormatDate } from './dateFormatters';

export interface LeavePdfRow {
  employeeName?: string;
  employeeId?: string;
  type: string;
  startDate?: unknown;
  endDate?: unknown;
  totalDays?: number;
  status?: string;
  reason?: string;
  reviewedBy?: string;
}

// Urutan tampil grup. Cuti tahunan dulu, lalu sakit, lalu izin-izin.
const TYPE_ORDER = ['annual', 'sick', 'permission', 'personal', 'urgent'] as const;
const TYPE_LABELS: Record<string, string> = {
  annual: 'Cuti Tahunan',
  sick: 'Sakit',
  permission: 'Izin Keperluan',
  personal: 'Keperluan Pribadi',
  urgent: 'Keperluan Keluarga',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};
const STATUS_COLOR: Record<string, string> = {
  pending: '#b45309',
  approved: '#047857',
  rejected: '#dc2626',
};

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function exportLeavePdf(opts: { periodLabel: string; leaves: LeavePdfRow[] }): void {
  const { periodLabel, leaves } = opts;
  const generatedAt = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Kelompokkan per tipe.
  const groups = new Map<string, LeavePdfRow[]>();
  for (const l of leaves) {
    const key = l.type || 'lainnya';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(l);
  }
  const orderedKeys = [
    ...TYPE_ORDER.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !TYPE_ORDER.includes(k as (typeof TYPE_ORDER)[number])),
  ];

  const daysOf = (rows: LeavePdfRow[], status?: string) =>
    rows
      .filter((r) => (status ? r.status === status : true))
      .reduce((s, r) => s + (Number(r.totalDays) || 0), 0);

  // Rekap utama: total approved days per kategori penting.
  const approved = leaves.filter((l) => l.status === 'approved');
  const totalCutiDays = daysOf(
    approved.filter((l) => l.type === 'annual'),
  );
  const totalSakitDays = daysOf(approved.filter((l) => l.type === 'sick'));
  const totalIzinDays = daysOf(
    approved.filter((l) => !['annual', 'sick'].includes(l.type)),
  );

  const sectionsHtml = orderedKeys
    .map((key) => {
      const rows = groups.get(key)!;
      const label = TYPE_LABELS[key] ?? key;
      const grpApproved = daysOf(rows, 'approved');
      const body = rows
        .map(
          (r, i) => `
          <tr style="background:${i % 2 ? '#f8fafc' : '#ffffff'}">
            <td>${esc(r.employeeName)}<div class="sub">${esc(r.employeeId)}</div></td>
            <td>${safeFormatDate(r.startDate, 'dd MMM yyyy')} → ${safeFormatDate(r.endDate, 'dd MMM yyyy')}</td>
            <td class="num">${Number(r.totalDays) || 0}</td>
            <td><span class="pill" style="color:${STATUS_COLOR[r.status ?? ''] ?? '#475569'};background:${(STATUS_COLOR[r.status ?? ''] ?? '#475569') + '18'}">${STATUS_LABELS[r.status ?? ''] ?? esc(r.status)}</span></td>
            <td>${esc(r.reason) || '<span class="dim">—</span>'}</td>
          </tr>`,
        )
        .join('');
      return `
        <div class="group">
          <div class="group-head">
            <h3>${esc(label)}</h3>
            <span class="group-meta">${rows.length} pengajuan · ${grpApproved} hari disetujui</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:24%">Karyawan</th>
                <th style="width:24%">Periode</th>
                <th style="width:8%" class="num">Hari</th>
                <th style="width:14%">Status</th>
                <th>Alasan</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>`;
    })
    .join('');

  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8" />
  <title>Laporan Cuti & Izin — JNE Martapura</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;padding:28px 32px;font-size:12px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #E31E24;padding-bottom:16px;margin-bottom:20px}
    .brand{font-size:26px;font-weight:900;letter-spacing:-1px;color:#E31E24}
    .brand span{color:#0f172a}
    .top h1{font-size:16px;margin-top:4px;font-weight:800}
    .meta{text-align:right;color:#64748b;font-size:11px;line-height:1.6}
    .cards{display:flex;gap:12px;margin-bottom:22px;flex-wrap:wrap}
    .card{flex:1;min-width:120px;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px}
    .card .lbl{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#94a3b8}
    .card .val{font-size:22px;font-weight:900;margin-top:2px}
    .group{margin-bottom:22px;break-inside:avoid}
    .group-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;border-left:4px solid #E31E24;padding-left:10px}
    .group-head h3{font-size:14px;font-weight:800}
    .group-meta{font-size:10px;color:#64748b;font-weight:700}
    table{width:100%;border-collapse:collapse}
    th{background:#0f172a;color:#fff;font-size:9px;text-transform:uppercase;letter-spacing:.6px;padding:8px 10px;text-align:left}
    td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}
    td.num,th.num{text-align:center}
    .sub{font-size:9px;color:#94a3b8;margin-top:1px}
    .dim{color:#cbd5e1}
    .pill{padding:2px 8px;border-radius:6px;font-size:9px;font-weight:800}
    .foot{margin-top:18px;border-top:1px solid #e2e8f0;padding-top:10px;color:#94a3b8;font-size:10px;text-align:center}
    @media print{body{padding:0}@page{margin:14mm}}
  </style></head><body>
    <div class="top">
      <div>
        <div class="brand">JNE<span> Martapura</span></div>
        <h1>Laporan Cuti &amp; Izin Karyawan</h1>
      </div>
      <div class="meta">
        Periode: <b>${esc(periodLabel)}</b><br/>
        Dicetak: ${esc(generatedAt)}<br/>
        Total pengajuan: <b>${leaves.length}</b>
      </div>
    </div>

    <div class="cards">
      <div class="card"><div class="lbl">Terpakai Cuti</div><div class="val" style="color:#047857">${totalCutiDays} <span style="font-size:11px;color:#94a3b8">hari</span></div></div>
      <div class="card"><div class="lbl">Terpakai Sakit</div><div class="val" style="color:#dc2626">${totalSakitDays} <span style="font-size:11px;color:#94a3b8">hari</span></div></div>
      <div class="card"><div class="lbl">Terpakai Izin</div><div class="val" style="color:#b45309">${totalIzinDays} <span style="font-size:11px;color:#94a3b8">hari</span></div></div>
      <div class="card"><div class="lbl">Disetujui</div><div class="val">${approved.length}</div></div>
    </div>

    ${sectionsHtml || '<p style="color:#94a3b8">Tidak ada data pada periode ini.</p>'}

    <div class="foot">Dokumen dihasilkan otomatis oleh JNE Attendance System · ${esc(generatedAt)}</div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    alert('Popup diblokir. Izinkan popup untuk mengunduh PDF.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Tunggu render lalu buka dialog cetak (pilih "Save as PDF").
  w.onload = () => {
    w.focus();
    w.print();
  };
}
