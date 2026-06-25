// ─────────────────────────────────────────────────────────────────────────
// CLEANUP DATA AKTIVITAS — siapkan project untuk dipakai dengan data ASLI.
//
// Menghapus PERMANEN koleksi transaksi/aktivitas, TAPI mempertahankan
// struktur: karyawan (users), departemen, jam kerja (shifts), settings,
// kuota cuti (leave_balances), dan token push (fcm_tokens).
//
// CARA PAKAI (dari folder admin/):
//   1) Taruh kunci service account di:  admin/serviceAccountKey.json
//      (Firebase Console → Project Settings → Service accounts → Generate key)
//   2) Tinjau dulu (DRY-RUN, tidak menghapus apa pun):
//        node scripts/cleanup_activity_data.mjs
//   3) Eksekusi sungguhan:
//        node scripts/cleanup_activity_data.mjs --yes
//
// TIDAK BISA DI-UNDO. Disarankan export/backup dulu (tombol Export CSV di
// tiap halaman, atau Firestore export) sebelum menjalankan dengan --yes.
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

// Koleksi AKTIVITAS yang akan dihapus (isi dokumen + subkoleksinya).
const DELETE_COLLECTIONS = [
  'attendance',
  'leaves',
  'overtime',
  'courier_packages',
  'daily_sales',
  'messages',
  'chats', // termasuk subkoleksi chats/{id}/typing
  'adminNotifications',
  'userNotifications',
  'sos_alerts',
  'user_heartbeats',
  'user_presence',
  'login_issues',
  'edit_requests',
  'calendarEvents',
  'meetingNotifications',
  'broadcasts',
  'audit_log',
];

// Koleksi yang SENGAJA DIPERTAHANKAN (jaring pengaman — kalau salah satu ini
// kebetulan masuk DELETE_COLLECTIONS, skrip berhenti).
const PROTECTED = new Set([
  'users',
  'departments',
  'shifts',
  'settings',
  'leave_balances',
  'fcm_tokens',
]);

function loadServiceAccount() {
  try {
    return JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url)));
  } catch {
    console.error(
      '\n✖ serviceAccountKey.json tidak ditemukan di folder admin/.\n' +
        '  Ambil dari Firebase Console → Project Settings → Service accounts →\n' +
        '  Generate new private key, simpan sebagai admin/serviceAccountKey.json.\n',
    );
    process.exit(1);
  }
}

async function main() {
  const apply = process.argv.includes('--yes');

  // Jaring pengaman: jangan pernah hapus koleksi yang dilindungi.
  const illegal = DELETE_COLLECTIONS.filter((c) => PROTECTED.has(c));
  if (illegal.length) {
    console.error(`✖ Koleksi terlindungi ada di daftar hapus: ${illegal.join(', ')}. Batal.`);
    process.exit(1);
  }

  const serviceAccount = loadServiceAccount();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  console.log(`\nProject : ${serviceAccount.project_id}`);
  console.log(`Mode    : ${apply ? '⚠️  HAPUS SUNGGUHAN (--yes)' : 'DRY-RUN (tinjau saja)'}`);
  console.log(`Pertahankan: ${[...PROTECTED].join(', ')}\n`);

  let grandTotal = 0;
  for (const name of DELETE_COLLECTIONS) {
    const ref = db.collection(name);
    // Hitung jumlah dokumen (akurat via aggregate count).
    let count = 0;
    try {
      count = (await ref.count().get()).data().count;
    } catch {
      count = (await ref.limit(1).get()).size; // fallback
    }
    grandTotal += count;

    if (!apply) {
      console.log(`  • ${name.padEnd(22)} ${count} dok  → akan dihapus`);
      continue;
    }

    if (count === 0) {
      console.log(`  • ${name.padEnd(22)} kosong, lewati`);
      continue;
    }
    process.stdout.write(`  • ${name.padEnd(22)} menghapus ${count} dok... `);
    // recursiveDelete: hapus semua dokumen + subkoleksi, otomatis batched.
    await db.recursiveDelete(ref);
    console.log('selesai ✓');
  }

  console.log(
    apply
      ? `\n✓ Selesai. Total ${grandTotal} dokumen aktivitas dihapus. Project bersih & siap pakai.\n`
      : `\nDRY-RUN: total ${grandTotal} dokumen AKAN dihapus. Jalankan ulang dengan --yes untuk eksekusi.\n`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error('✖ Gagal:', e);
  process.exit(1);
});
