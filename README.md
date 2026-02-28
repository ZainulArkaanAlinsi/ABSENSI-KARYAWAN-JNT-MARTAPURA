# ABSENSI-KARYAWAN-JNT-MARTAPURA

Employee Attendance Management System for JNT Martapura — built with [Next.js](https://nextjs.org).

## Overview

This Employee Attendance Management System is designed for logistics and delivery companies that have multiple departments with varying work schedules. This system doesn't apply the same rules to all employees, but rather adjusts the calculation of working hours, tardiness, and closing times based on each department.

Generally, standard office hours are 8:00 AM to 4:00 PM. However, each department has different start times and working conditions:

| Department              | Start Time | Notes                            |
| ----------------------- | ---------- | -------------------------------- |
| Sales Coordinator (SCO) | 9:00 AM    | —                                |
| Driver                  | 9:00 AM    | —                                |
| Admin Support           | 10:00 AM   | —                                |
| Courier / Field Staff   | 9:00 AM    | Target-based work system         |
| Pick-Up Operations      | 4:00 PM    | Tracking starts from home        |
| Inbound Operations      | 9:00 PM    | Night shift, works until 5:00 AM |
| Outbound Operations     | 9:00 PM    | Night shift, works until 5:00 AM |

For field employees, such as couriers, the rules differ from those of regular office employees. Couriers have a daily delivery target of 100 packages. If all packages have been delivered before 4:00 PM, employees are allowed to leave early without requiring additional permission. Conversely, if there are still outstanding packages even though it's close to closing time, employees are not allowed to leave their duties until all packages have been delivered.

For the Pick-Up Operations team, the system records attendance from the moment employees leave home, not from their arrival at the office. This is because the pick-up process begins at their departure point, traveling from home to the pick-up area and then to the office. For the Inbound and Outbound teams working night shifts, the system is designed to correctly calculate work durations past midnight without generating negative marks or errors.

Regarding tardiness, the system allows for delays of a few minutes. If an employee is more than the tolerance limit, the time difference will be deducted from the effective working hours for that day. Lateness is not counted as overtime, but rather as a reduction in working hours. For example, if an employee with a standard 9:00 AM start time only arrives at 9:25 AM, their effective working hours are reduced by 25 minutes from the total normal working hours for that day.

The system also features a meeting calendar feature. Admins can create meeting schedules involving one or more different departments. Once the schedule is saved, the system automatically sends notifications to all participants' devices one day before the meeting and 30 minutes before it starts, ensuring no one misses or forgets.

Each department has its own page and data table. There's no merging of departments within a single view. Each department page also displays the unique rules applicable to that department, ensuring admins always have clear context when viewing or managing attendance data.

## Deskripsi Sistem (Bahasa Indonesia)

Sistem Manajemen Kehadiran Karyawan ini dirancang untuk perusahaan logistik dan pengiriman yang memiliki beberapa departemen dengan aturan kerja yang berbeda-beda. Sistem ini tidak menyamakan semua karyawan dalam satu aturan, melainkan menyesuaikan perhitungan jam kerja, keterlambatan, dan jam pulang berdasarkan departemen masing-masing.

Secara umum, jam kerja standar kantor adalah pukul 08.00 hingga 16.00. Namun setiap departemen memiliki jam masuk dan kondisi kerja yang berbeda. Departemen Sales SCO dan Driver masuk pukul 09.00, Admin Support masuk pukul 10.00, Kurir atau petugas lapangan masuk pukul 09.00 dengan sistem kerja berbasis target, tim Operasional Pick-Up mulai pukul 16.00 dengan pelacakan yang dimulai dari rumah karyawan, serta tim Operasional Inbound dan Outbound masuk pukul 21.00 dan bekerja hingga pukul 05.00 keesokan harinya.

Untuk karyawan lapangan seperti kurir, aturannya berbeda dari karyawan kantor biasa. Kurir memiliki target pengiriman 100 paket per hari. Jika semua paket sudah selesai diantar sebelum pukul 16.00, karyawan diperbolehkan pulang lebih awal tanpa perlu izin tambahan. Sebaliknya, jika masih ada paket yang belum terkirim meskipun sudah mendekati jam pulang, karyawan tidak boleh meninggalkan tugas sampai seluruh paket habis diantar.

Untuk tim Operasional Pick-Up, sistem mencatat kehadiran sejak karyawan berangkat dari rumah, bukan sejak tiba di kantor. Ini karena proses pick-up dimulai dari titik awal keberangkatan mereka dengan rute dari rumah menuju area pick-up lalu ke kantor. Sementara untuk tim Inbound dan Outbound yang bekerja shift malam, sistem dirancang agar bisa menghitung durasi kerja yang melewati tengah malam dengan benar tanpa menghasilkan nilai minus atau error.

Soal keterlambatan, sistem memberikan toleransi untuk keterlambatan beberapa menit. Jika karyawan terlambat lebih dari batas toleransi, selisih waktu tersebut akan dikurangkan dari jam kerja efektif hari itu. Keterlambatan tidak dihitung sebagai lembur, melainkan murni sebagai pengurangan jam kerja. Misalnya jika seorang karyawan dengan jam masuk standar 09.00 baru masuk pukul 09.25, maka jam kerja efektifnya berkurang 25 menit dari total jam normal hari itu.

Sistem juga dilengkapi fitur kalender meeting. Admin dapat membuat jadwal pertemuan yang melibatkan satu atau lebih departemen berbeda. Setelah jadwal disimpan, sistem otomatis mengirimkan notifikasi ke perangkat semua peserta yang terlibat, yaitu satu hari sebelum meeting dan 30 menit sebelum meeting dimulai, sehingga tidak ada peserta yang terlewat atau lupa.

Dari sisi tampilan, setiap departemen memiliki halaman dan tabel datanya sendiri. Tidak ada penggabungan antar departemen dalam satu tampilan. Setiap halaman departemen juga menampilkan aturan unik yang berlaku di departemen tersebut agar admin selalu memiliki konteks yang jelas saat membaca atau mengelola data kehadiran.

---

## Key Features

### Department-Specific Rules

Each department has its own page and data table — there is no merging of departments within a single view. Each department page also displays the unique rules applicable to that department, ensuring admins always have clear context when viewing or managing attendance data.

### Courier / Field Staff

Couriers have a daily delivery target of 100 packages. If all packages have been delivered before 4:00 PM, employees are allowed to leave early without requiring additional permission. Conversely, if there are still outstanding packages even though it's close to closing time, employees are not allowed to leave their duties until all packages have been delivered.

### Pick-Up Operations

The system records attendance from the moment employees leave home, not from their arrival at the office. This is because the pick-up process begins at their departure point, traveling from home to the pick-up area and then to the office.

### Night Shift (Inbound & Outbound)

For the Inbound and Outbound teams working night shifts, the system is designed to correctly calculate work durations **past midnight** without generating negative marks or errors.

### Tardiness Calculation

The system allows for delays of a few minutes (configurable tolerance limit). If an employee exceeds the tolerance limit, the time difference will be deducted from the effective working hours for that day. Lateness is not counted as overtime, but rather as a **reduction in working hours**.

> **Example:** An employee with a 9:00 AM start time who arrives at 9:25 AM will have 25 minutes deducted from their total normal working hours for that day.

### Meeting Calendar

Admins can create meeting schedules involving one or more departments. Once a schedule is saved, the system automatically sends push notifications to all participants' devices:

- **1 day before** the meeting
- **30 minutes before** it starts

This ensures no one misses or forgets a scheduled meeting.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Database:** Firebase Firestore
- **Auth & Notifications:** Firebase
- **Font:** [Geist](https://vercel.com/font) via `next/font`
