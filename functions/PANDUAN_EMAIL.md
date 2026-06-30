# Panduan Mengaktifkan Email Onboarding (Gmail SMTP)

Email kredensial + link APK ke Gmail karyawan dikirim oleh Cloud Function
`onEmployeeCreated`. Kodenya **sudah jadi & ber-logo JNE** — yang perlu kamu
lakukan hanya mengaktifkan pengirimannya. Sekali setup, semua karyawan baru
otomatis dapat email.

> Kenapa kemarin tidak masuk? Karena kredensial SMTP belum diset, jadi fungsi
> melewati pengiriman email (lihat log: `[smtp] kredensial belum diset`).

---

## Langkah 1 — Pastikan Firebase plan **Blaze**

Cloud Functions hanya bisa di-deploy di plan **Blaze (pay-as-you-go)**. Onboarding
email gratis dalam kuota normal. Cek di Firebase Console → ⚙️ → Usage and billing.

## Langkah 2 — Buat **App Password** Gmail (bukan password biasa)

1. Pakai 1 akun Gmail sebagai pengirim (mis. `hrd.jne.mtp@gmail.com`).
2. Aktifkan **Verifikasi 2 Langkah** di akun itu:
   https://myaccount.google.com/security
3. Buat App Password: https://myaccount.google.com/apppasswords
   - Pilih app "Mail", device "Other" → namai "JNE Functions".
   - Salin 16 huruf yang muncul (tanpa spasi), mis. `abcd efgh ijkl mnop`.

## Langkah 3 — Set secret (sekali saja)

Jalankan dari folder `admin/` (atau `admin/functions/`):

```bash
npx firebase-tools functions:secrets:set SMTP_USER
# tempel alamat Gmail pengirim, mis. hrd.jne.mtp@gmail.com

npx firebase-tools functions:secrets:set SMTP_PASSWORD
# tempel 16 huruf App Password (boleh tanpa spasi)
```

Opsional (override default) lewat `admin/functions/.env`:

```
SMTP_FROM_NAME=JNE Martapura HR
APK_URL=https://storage.googleapis.com/admin-absensi-jne-mtp.firebasestorage.app/public/app-jne-absensi.apk
```

## Langkah 4 — Build & deploy fungsi

```bash
cd admin/functions
npm run build
npx firebase-tools deploy --only functions
```

> Deploy **semua** function sekaligus paling aman. Selain email, ini juga
> mengaktifkan **notifikasi push** lain yang sebelumnya tidak jalan kalau
> functions belum pernah di-deploy:
>
> - `onUserProfileUpdated` → tombol **"Kirim Ulang Email"**.
> - `onLeaveStatusUpdate` → notif **cuti disetujui (hijau) / ditolak (merah)**.
> - `onOvertimeStatusUpdate` → notif **lembur disetujui (hijau) / ditolak (merah)** + bunyi.
>
> Jadi kalau dulu "approve cuti/lembur tidak ada notifikasi di HP karyawan",
> kemungkinan besar penyebabnya functions belum di-deploy — sekali deploy,
> semuanya jalan.

## Langkah 5 — Pastikan logo email tampil

Email memakai logo `https://admin-absensi-jne-mtp.web.app/jne-email-logo.png`
(file ada di `admin/public/jne-email-logo.png`). Logo muncul setelah admin web
ter-deploy ke Hosting minimal sekali:

```bash
cd admin && npm run build && npx firebase-tools deploy --only hosting
```

---

## Cara pakai sehari-hari

- **Karyawan baru:** isi kolom **Email Pribadi (Gmail)** saat Tambah Karyawan →
  email otomatis terkirim ke Gmail itu (kredensial + link download APK + cara
  install).
- **Kirim ulang** (mis. karyawan lama yang dibuat sebelum SMTP aktif): buka
  **Detail Karyawan** → kartu "Kredensial Login Sementara" → tombol
  **Kirim Ulang Email**. (Hanya jalan selama karyawan belum ganti password,
  karena password sementara otomatis dihapus setelah diganti.)

## Cek kalau gagal

```bash
cd admin/functions && npx firebase-tools functions:log --only onEmployeeCreated
```

- `[smtp] kredensial belum diset` → secret belum ke-set / fungsi belum re-deploy.
- `Invalid login` → App Password salah, atau pakai password biasa (harus App
  Password + 2FA aktif).
- Email masuk **Spam** → tandai "Bukan spam" sekali; pakai nama pengirim yang
  jelas via `SMTP_FROM_NAME`.
