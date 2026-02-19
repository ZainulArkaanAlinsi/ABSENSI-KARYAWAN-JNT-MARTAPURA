"use strict";
/**
 * JNE MTP Firebase Cloud Functions
 *
 * Deploy: firebase deploy --only functions
 *
 * These functions handle server-side logic:
 * 1. onEmployeeCreated   → Send welcome email + FCM to new employee
 * 2. onLeaveStatusUpdate → Send FCM notification to employee when leave status changes
 * 3. onFaceEnrolled      → Notify admin when employee completes face enrollment
 * 4. onAttendanceFailed  → Notify admin when employee fails face recognition 3 times
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledOvertimeCalc = exports.onAttendanceFailed = exports.onFaceEnrolled = exports.onLeaveStatusUpdate = exports.onEmployeeCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
// ============================================================
// 1. onEmployeeCreated — Send welcome email when admin adds employee
// ============================================================
exports.onEmployeeCreated = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.role !== 'employee')
        return;
    // Create Firebase Auth account
    try {
        const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
        const userRecord = await admin.auth().createUser({
            uid: context.params.userId,
            email: data.email,
            password: tempPassword,
            displayName: data.name,
        });
        // Update Firestore with uid
        await snap.ref.update({ uid: userRecord.uid });
        // Send welcome email via your email service (e.g., SendGrid, Nodemailer)
        // await sendWelcomeEmail(data.email, data.name, tempPassword);
        // Add admin notification
        await db.collection('adminNotifications').add({
            type: 'new_employee',
            title: 'Karyawan Baru Ditambahkan',
            message: `${data.name} (${data.email}) telah ditambahkan. Email kredensial dikirim.`,
            employeeName: data.name,
            employeeId: data.employeeId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Employee created: ${data.name} (${data.email})`);
    }
    catch (error) {
        console.error('Error creating employee:', error);
    }
});
// ============================================================
// 2. onLeaveStatusUpdate — FCM to employee when leave approved/rejected
// ============================================================
exports.onLeaveStatusUpdate = functions.firestore
    .document('leaves/{leaveId}')
    .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only trigger when status changes from pending
    if (before.status === after.status || before.status !== 'pending')
        return;
    try {
        // Get employee's FCM token
        const userDoc = await db.collection('users').doc(after.userId).get();
        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken) {
            console.log('No FCM token for user:', after.userId);
            return;
        }
        const isApproved = after.status === 'approved';
        const title = isApproved ? '✅ Izin Disetujui' : '❌ Izin Ditolak';
        const body = isApproved
            ? `Pengajuan izin Anda untuk ${after.totalDays} hari telah disetujui.`
            : `Pengajuan izin Anda ditolak. Alasan: ${after.rejectionReason || 'Tidak ada alasan'}`;
        // Send FCM to employee
        await messaging.send({
            token: fcmToken,
            notification: { title, body },
            data: {
                type: 'leave_status',
                leaveId: change.after.id,
                status: after.status,
                screen: 'leave_history',
            },
            android: {
                priority: 'high',
                notification: { channelId: 'attendance_channel', sound: 'default' },
            },
        });
        console.log(`✅ FCM sent to ${after.employeeName}: ${after.status}`);
    }
    catch (error) {
        console.error('Error sending leave FCM:', error);
    }
});
// ============================================================
// 3. onFaceEnrolled — Notify admin when employee enrolls face
// ============================================================
exports.onFaceEnrolled = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only trigger when faceRegistered changes from false to true
    if (before.faceRegistered || !after.faceRegistered)
        return;
    await db.collection('adminNotifications').add({
        type: 'face_enrolled',
        title: 'Wajah Berhasil Didaftarkan',
        message: `${after.name} telah berhasil mendaftarkan wajah menggunakan ${after.deviceModel || 'perangkat tidak diketahui'}.`,
        employeeName: after.name,
        employeeId: after.employeeId,
        relatedId: change.after.id,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Face enrolled notification for: ${after.name}`);
});
// ============================================================
// 4. onAttendanceFailed — Notify admin of repeated face failures
// ============================================================
exports.onAttendanceFailed = functions.https.onCall(async (data) => {
    const { userId, employeeName, failCount } = data;
    if (failCount < 3)
        return { success: false };
    await db.collection('adminNotifications').add({
        type: 'face_failed',
        title: '⚠️ Kegagalan Verifikasi Wajah',
        message: `${employeeName} gagal verifikasi wajah ${failCount}x berturut-turut. Perlu perhatian admin.`,
        employeeName,
        relatedId: userId,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// ============================================================
// 5. scheduledOvertimeCalc — Daily overtime calculation (optional)
// ============================================================
exports.scheduledOvertimeCalc = functions.pubsub
    .schedule('0 23 * * *') // Run at 11 PM daily
    .timeZone('Asia/Jakarta')
    .onRun(async () => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceSnap = await db.collection('attendance')
        .where('date', '==', today)
        .where('status', '==', 'present')
        .get();
    for (const doc of attendanceSnap.docs) {
        const data = doc.data();
        if (!data.checkOut?.time || !data.shiftId)
            continue;
        const shiftDoc = await db.collection('shifts').doc(data.shiftId).get();
        const shift = shiftDoc.data();
        if (!shift)
            continue;
        const [sh, sm] = shift.checkOutTime.split(':').map(Number);
        const [ah, am] = data.checkOut.time.split(':').map(Number);
        const scheduledMins = sh * 60 + sm;
        const actualMins = ah * 60 + am;
        const overtimeMins = actualMins - scheduledMins;
        if (overtimeMins > 0) {
            await doc.ref.update({
                status: 'overtime',
                overtimeMinutes: overtimeMins,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
    console.log(`✅ Overtime calculation done for ${today}`);
});
//# sourceMappingURL=index.js.map