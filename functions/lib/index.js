"use strict";
/**
 * JNE MTP Firebase Cloud Functions
 *
 * Deploy: firebase deploy --only functions
 *
 * Functions:
 * 1. onEmployeeCreated     → Create Auth account + send onboarding email + notify admin
 * 2. onLeaveStatusUpdate   → FCM notification when leave approved/rejected
 * 3. onAttendanceCreated   → Mirror to adminNotifications
 * 4. onUserProfileUpdated  → FCM to employee when admin changes profile
 * 5. onFaceEnrolled        → Notify admin when employee completes face enrollment
 * 6. onAttendanceFailed    → Notify admin on 3x failed face recognition
 * 7. onOvertimeStatusUpdate → FCM + userNotification when admin approves/rejects overtime
 * 8. scheduledOvertimeCalc → Daily overtime calculation at 23:00 Asia/Jakarta
 *
 * SMTP config (set sebelum deploy):
 *   firebase functions:config:set smtp.user="bot@jne-mtp.com" smtp.password="APP_PASSWORD" smtp.from_name="JNE Martapura HR" apk.url="https://..."
 * App Password: aktifkan 2FA Gmail, lalu generate App Password di
 * https://myaccount.google.com/apppasswords
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOvertimeStatusUpdate = exports.scheduledOvertimeCalc = exports.onAttendanceFailed = exports.onFaceEnrolled = exports.onUserProfileUpdated = exports.onAttendanceCreated = exports.onLeaveStatusUpdate = exports.onEmployeeCreated = void 0;
const functions = require("firebase-functions/v1");
const functionsRegion = functions.region('asia-southeast2');
const admin = require("firebase-admin");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
// ── SMTP transporter (lazy, dibuat saat dibutuhkan agar tidak crash kalau
// config belum diset) ───────────────────────────────────────────────────
let _smtpTransporter = null;
function getSmtpTransporter() {
    if (_smtpTransporter)
        return _smtpTransporter;
    // Campuran: user & from_name dari functions.config() (non-rahasia),
    // password dari Firebase Secret Manager (process.env.SMTP_PASSWORD) yang
    // di-bind lewat .runWith({ secrets: ['SMTP_PASSWORD'] }) di function.
    const user = functions.config().smtp?.user;
    const pass = process.env.SMTP_PASSWORD;
    if (!user || !pass) {
        console.warn('[smtp] kredensial belum lengkap (perlu config smtp.user + secret SMTP_PASSWORD) — email onboarding di-skip');
        return null;
    }
    _smtpTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
    return _smtpTransporter;
}
/**
 * Kirim email onboarding berisi kredensial login + link APK ke karyawan baru.
 * Dipanggil dari onEmployeeCreated. Tidak melempar error — kalau gagal,
 * function tetap lanjut dan menulis admin notification.
 */
async function sendOnboardingEmail(opts) {
    const transporter = getSmtpTransporter();
    if (!transporter)
        return false;
    const cfg = functions.config();
    const fromName = cfg.smtp?.from_name || 'JNE Martapura HR';
    const fromAddr = cfg.smtp.user;
    const apkUrl = cfg.apk?.url || 'https://storage.googleapis.com/admin-absensi-jne-mtp.firebasestorage.app/public/app-jne-absensi.apk';
    const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;">
    <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
      <h1 style="color:#E31E24;margin:0 0 8px;font-size:22px;letter-spacing:-0.5px">Selamat Datang di JNE Martapura</h1>
      <p style="color:#475569;font-size:14px;margin:0 0 24px">Halo <strong>${opts.employeeName}</strong>, akun Anda di sistem absensi JNE sudah aktif.</p>

      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px">Kredensial Login</p>
        <p style="margin:0;font-size:14px;color:#0f172a"><strong>Email:</strong> ${opts.loginEmail}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#0f172a"><strong>Password Sementara:</strong> <code style="background:#fef3c7;padding:3px 8px;border-radius:4px;font-family:monospace;font-size:14px">${opts.tempPassword}</code></p>
      </div>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 20px">
        Saat login pertama, Anda akan diminta mengganti password. Setelah itu, lakukan registrasi wajah sebelum bisa melakukan absensi.
      </p>

      <a href="${apkUrl}" style="display:inline-block;background:#E31E24;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">Download Aplikasi (APK)</a>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-top:24px">
        <p style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 12px">Cara Install Aplikasi (Android)</p>
        <ol style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.9">
          <li>Tap tombol <strong>"Download Aplikasi (APK)"</strong> di atas, lalu tunggu sampai selesai terunduh.</li>
          <li>Buka file <strong>app-release.apk</strong> di folder Unduhan / notifikasi.</li>
          <li>Jika muncul peringatan, pilih <strong>"Setelan"</strong> lalu aktifkan <strong>"Izinkan dari sumber ini"</strong> (Install dari sumber tidak dikenal).</li>
          <li>Tap <strong>"Pasang / Install"</strong> dan tunggu hingga selesai.</li>
          <li>Buka aplikasi <strong>JNE Absensi MTP</strong>, lalu login pakai email &amp; password sementara di atas.</li>
          <li>Ganti password saat diminta, lalu daftarkan wajah Anda sebelum mulai absen.</li>
        </ol>
        <p style="margin:12px 0 0;color:#94a3b8;font-size:11px">Butuh Android 5.0+ · ukuran ± 37 MB · kalau link tidak bisa dibuka, hubungi admin HR.</p>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0">
      <p style="color:#94a3b8;font-size:11px;margin:0">Email ini dikirim otomatis. Jika ada masalah, hubungi admin HR JNE Martapura.</p>
    </div>
  </div>`;
    try {
        await transporter.sendMail({
            from: `"${fromName}" <${fromAddr}>`,
            to: opts.to,
            subject: 'Akun JNE Martapura Anda Sudah Aktif',
            html,
        });
        console.log(`[smtp] onboarding email terkirim ke ${opts.to}`);
        return true;
    }
    catch (err) {
        console.error('[smtp] gagal kirim onboarding email:', err);
        return false;
    }
}
// Helper: safely parse HH:MM time string into total minutes (returns null on invalid).
function parseTimeToMinutes(value) {
    if (typeof value !== 'string')
        return null;
    const parts = value.split(':');
    if (parts.length < 2)
        return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m))
        return null;
    if (h < 0 || h > 23 || m < 0 || m > 59)
        return null;
    return h * 60 + m;
}
/**
 * Mobile clients save FCM registration tokens to the `fcm_tokens` collection
 * keyed by the token itself (see user_mobile/lib/providers/app_provider.dart
 * `_saveFCMToken`). Look up every active token for a userId, then send to
 * the lot via sendEachForMulticast so the user gets push on every device
 * they've signed in on. Tokens that come back as unregistered are deleted.
 */
async function sendPushToUser(userId, payload) {
    const snap = await db
        .collection('fcm_tokens')
        .where('userId', '==', userId)
        .get();
    if (snap.empty) {
        console.log(`No FCM tokens for user ${userId}`);
        return 0;
    }
    const tokens = snap.docs.map(d => d.id);
    const res = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: {
            priority: 'high',
            notification: {
                channelId: payload.channelId ?? 'high_importance_channel',
                sound: 'default',
            },
        },
    });
    // Clean up tokens the FCM service told us are dead.
    await Promise.all(res.responses.map(async (r, i) => {
        if (r.success)
            return;
        const code = r.error?.code ?? '';
        if (code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token') {
            try {
                await db.collection('fcm_tokens').doc(tokens[i]).delete();
            }
            catch (e) {
                console.warn('Failed to delete stale FCM token', tokens[i], e);
            }
        }
    }));
    console.log(`sendPushToUser(${userId}): ${res.successCount}/${tokens.length} delivered`);
    return res.successCount;
}
// ============================================================
// 1. onEmployeeCreated — Create Auth account + notify admin when employee is added
// ============================================================
exports.onEmployeeCreated = functionsRegion
    .runWith({ secrets: ['SMTP_PASSWORD'] })
    .firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || data.role !== 'employee')
        return;
    if (!data.email || !data.name) {
        console.error('onEmployeeCreated: missing email or name', { userId: context.params.userId });
        return;
    }
    // Idempotency: if uid already set, skip auth creation
    if (data.uid) {
        console.log(`onEmployeeCreated: user ${context.params.userId} already has uid, skipping`);
        return;
    }
    try {
        // Password sementara: 12 byte random base64-url (16 char) — entropy
        // ~96 bit. Math.random sebelumnya hanya ~40 bit dan tidak crypto-safe.
        const tempPassword = crypto.randomBytes(12).toString('base64url');
        const userRecord = await admin.auth().createUser({
            uid: context.params.userId,
            email: data.email,
            password: tempPassword,
            displayName: data.name,
        });
        // Update Firestore with uid
        await snap.ref.update({ uid: userRecord.uid });
        // Kirim email onboarding ke email pribadi (kalau ada) atau ke email
        // login. Email pribadi dipakai supaya karyawan tetap bisa baca
        // kredensial walaupun belum punya akses email JNE-nya.
        const emailTo = data.personalEmail || data.email;
        const emailOk = await sendOnboardingEmail({
            to: emailTo,
            employeeName: data.name,
            loginEmail: data.email,
            tempPassword,
        });
        // Add admin notification — pesan menyesuaikan apakah email berhasil
        try {
            await db.collection('adminNotifications').add({
                type: 'new_employee',
                title: 'Karyawan Baru Ditambahkan',
                message: emailOk
                    ? `${data.name} (${data.email}) telah ditambahkan. Email kredensial sudah dikirim ke ${emailTo}.`
                    : `${data.name} (${data.email}) telah ditambahkan. Email gagal terkirim — share kredensial manual.`,
                employeeName: data.name,
                employeeId: data.employeeId || null,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        catch (notifError) {
            console.error('Failed to write adminNotification:', notifError);
        }
        console.log(`Employee created: ${data.name} (${data.email}) emailSent=${emailOk}`);
    }
    catch (error) {
        console.error('Error creating employee auth account:', error);
    }
});
// ============================================================
// 2. onLeaveStatusUpdate — FCM to employee when leave approved/rejected
// ============================================================
exports.onLeaveStatusUpdate = functionsRegion.firestore
    .document('leaves/{leaveId}')
    .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return;
    if (!after.userId) {
        console.error('onLeaveStatusUpdate: missing userId on leave', { leaveId: change.after.id });
        return;
    }
    // Only trigger when status changes from pending
    if (before.status === after.status || before.status !== 'pending')
        return;
    try {
        const isApproved = after.status === 'approved';
        const title = isApproved ? 'Izin Disetujui' : 'Izin Ditolak';
        const totalDays = after.totalDays || 0;
        const body = isApproved
            ? `Pengajuan izin Anda untuk ${totalDays} hari telah disetujui.`
            : `Pengajuan izin Anda ditolak. Alasan: ${after.rejectionReason || 'Tidak ada alasan'}`;
        await sendPushToUser(after.userId, {
            title,
            body,
            data: {
                type: 'leave_status',
                leaveId: change.after.id,
                status: String(after.status || ''),
                screen: 'leave_history',
            },
        });
        // Mirror to userNotifications so the mobile bell list also shows it
        // even if the device push silently dropped.
        try {
            await db.collection('userNotifications').add({
                userId: after.userId,
                type: 'leave_request',
                title,
                message: body,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                relatedId: change.after.id,
            });
        }
        catch (mirrorError) {
            console.error('Failed to mirror leave notification:', mirrorError);
        }
        console.log(`Leave decision delivered to ${after.employeeName || after.userId}: ${after.status}`);
    }
    catch (error) {
        console.error('Error sending leave FCM:', error);
    }
});
// ============================================================
// 2b. onAttendanceCreated — Mirror to adminNotifications so admin bell rings
// ============================================================
exports.onAttendanceCreated = functionsRegion.firestore
    .document('attendance/{attendanceId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data)
        return;
    try {
        const status = String(data.status ?? 'present');
        const title = status === 'late' ? 'Karyawan Terlambat' : 'Absen Masuk Baru';
        const name = data.employeeName || data.userId || 'Karyawan';
        const message = status === 'late'
            ? `${name} absen masuk dengan status TERLAMBAT.`
            : `${name} sudah absen masuk hari ini.`;
        await db.collection('adminNotifications').add({
            type: 'attendance_new',
            title,
            message,
            employeeName: name,
            employeeId: data.employeeId || null,
            relatedId: context.params.attendanceId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (e) {
        console.error('onAttendanceCreated mirror error:', e);
    }
});
// ============================================================
// 2c. onUserProfileUpdated — Tell mobile when admin changes their account
// ============================================================
exports.onUserProfileUpdated = functionsRegion.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return;
    // Surface the small set of admin-driven changes the employee actually
    // needs to know about. Skip the high-volume churn fields (isOnline,
    // updatedAt, fcmToken legacy field, faceRegistered — handled elsewhere,
    // passwordChanged — internal, deviceModel — telemetry).
    const watched = [
        { key: 'department', label: 'departemen' },
        { key: 'position', label: 'jabatan' },
        { key: 'role', label: 'role' },
        { key: 'jamKerjaId', label: 'jam kerja' },
        { key: 'isActive', label: 'status akun' },
        { key: 'allowRemoteAttendance', label: 'akses absen remote' },
    ];
    const changed = watched.filter(w => before[w.key] !== after[w.key]);
    if (changed.length === 0)
        return;
    const title = 'Profil Akun Diperbarui';
    const body = changed.length === 1
        ? `Admin memperbarui ${changed[0].label} akun Anda.`
        : `Admin memperbarui ${changed.length} data akun Anda.`;
    await sendPushToUser(context.params.userId, {
        title,
        body,
        data: { type: 'profile_updated', screen: 'profile' },
    });
    try {
        await db.collection('userNotifications').add({
            userId: context.params.userId,
            type: 'profile_updated',
            title,
            message: body,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (e) {
        console.error('Failed to mirror profile_updated notification:', e);
    }
});
// ============================================================
// 3. onFaceEnrolled — Notify admin when employee enrolls face
// ============================================================
exports.onFaceEnrolled = functionsRegion.firestore
    .document('users/{userId}')
    .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return;
    // Only trigger when faceRegistered changes from false to true
    if (before.faceRegistered || !after.faceRegistered)
        return;
    try {
        await db.collection('adminNotifications').add({
            type: 'face_enrolled',
            title: 'Wajah Berhasil Didaftarkan',
            message: `${after.name || 'Karyawan'} telah berhasil mendaftarkan wajah menggunakan ${after.deviceModel || 'perangkat tidak diketahui'}.`,
            employeeName: after.name || null,
            employeeId: after.employeeId || null,
            relatedId: change.after.id,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Face enrolled notification for: ${after.name || change.after.id}`);
    }
    catch (error) {
        console.error('Error writing face_enrolled notification:', error);
    }
});
// ============================================================
// 4. onAttendanceFailed — Notify admin of repeated face failures
// ============================================================
exports.onAttendanceFailed = functionsRegion.https.onCall(async (data) => {
    try {
        const userId = data?.userId;
        const employeeName = data?.employeeName;
        const failCount = Number(data?.failCount ?? 0);
        if (!userId || !employeeName) {
            return { success: false, error: 'missing_params' };
        }
        if (failCount < 3)
            return { success: false };
        await db.collection('adminNotifications').add({
            type: 'face_failed',
            title: 'Kegagalan Verifikasi Wajah',
            message: `${employeeName} gagal verifikasi wajah ${failCount}x berturut-turut. Perlu perhatian admin.`,
            employeeName,
            relatedId: userId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    }
    catch (error) {
        console.error('onAttendanceFailed error:', error);
        return { success: false, error: 'internal' };
    }
});
// ============================================================
// 5. scheduledOvertimeCalc — Daily overtime calculation at 23:00 Asia/Jakarta
// ============================================================
exports.scheduledOvertimeCalc = functionsRegion.pubsub
    .schedule('0 23 * * *') // Run at 11 PM daily
    .timeZone('Asia/Jakarta')
    .onRun(async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
        // Sertakan status 'late' — karyawan yang terlambat tetap bisa
        // dapat overtime kalau pulangnya melewati shift end. Sebelumnya
        // hanya 'present' yang dihitung dan ini sumber complaint.
        const attendanceSnap = await db.collection('attendance')
            .where('date', '==', today)
            .where('status', 'in', ['present', 'late'])
            .get();
        let updated = 0;
        let skipped = 0;
        for (const doc of attendanceSnap.docs) {
            try {
                const data = doc.data();
                if (!data?.checkOut?.time || !data?.shiftId) {
                    skipped++;
                    continue;
                }
                const shiftDoc = await db.collection('shifts').doc(data.shiftId).get();
                const shift = shiftDoc.data();
                if (!shift) {
                    skipped++;
                    continue;
                }
                const scheduledMins = parseTimeToMinutes(shift.checkOutTime);
                const actualMins = parseTimeToMinutes(data.checkOut.time);
                if (scheduledMins === null || actualMins === null) {
                    console.warn('Invalid time format', { docId: doc.id, scheduled: shift.checkOutTime, actual: data.checkOut.time });
                    skipped++;
                    continue;
                }
                const overtimeMins = actualMins - scheduledMins;
                if (overtimeMins > 0) {
                    await doc.ref.update({
                        status: 'overtime',
                        overtimeMinutes: overtimeMins,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    updated++;
                }
            }
            catch (innerErr) {
                console.error('Overtime calc error for doc', doc.id, innerErr);
            }
        }
        console.log(`Overtime calc done for ${today}: updated=${updated} skipped=${skipped} total=${attendanceSnap.size}`);
    }
    catch (error) {
        console.error('scheduledOvertimeCalc failed:', error);
    }
});
// ============================================================
// 6. onOvertimeStatusUpdate — FCM ke karyawan saat pengajuan lembur
//    di-approve / di-reject oleh admin (mirror dari onLeaveStatusUpdate)
// ============================================================
exports.onOvertimeStatusUpdate = functionsRegion.firestore
    .document('overtime/{overtimeId}')
    .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return;
    if (!after.userId) {
        console.error('onOvertimeStatusUpdate: missing userId', { id: change.after.id });
        return;
    }
    // Hanya trigger saat status berubah dari pending → approved/rejected
    if (before.status === after.status || before.status !== 'pending')
        return;
    try {
        const isApproved = after.status === 'approved';
        const title = isApproved ? 'Lembur Disetujui' : 'Lembur Ditolak';
        const hours = after.overtimeHours ?? Math.ceil((after.overtimeMinutes || 0) / 60);
        const body = isApproved
            ? `Pengajuan lembur Anda (${hours} jam) telah disetujui.`
            : `Pengajuan lembur Anda ditolak. Alasan: ${after.rejectionReason || after.adminReason || 'Tidak ada alasan'}`;
        await sendPushToUser(after.userId, {
            title,
            body,
            data: {
                type: 'overtime_status',
                overtimeId: change.after.id,
                status: String(after.status || ''),
                screen: 'overtime_history',
            },
        });
        try {
            await db.collection('userNotifications').add({
                userId: after.userId,
                type: 'overtime_request',
                title,
                message: body,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                relatedId: change.after.id,
            });
        }
        catch (mirrorError) {
            console.error('Failed to mirror overtime notification:', mirrorError);
        }
        console.log(`Overtime decision delivered to ${after.employeeName || after.userId}: ${after.status}`);
    }
    catch (error) {
        console.error('Error sending overtime FCM:', error);
    }
});
//# sourceMappingURL=index.js.map