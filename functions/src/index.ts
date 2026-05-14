/**
 * JNE MTP Firebase Cloud Functions
 *
 * Deploy: firebase deploy --only functions
 *
 * These functions handle server-side logic:
 * 1. onEmployeeCreated   → Create Auth account + notify admin when new employee is added
 * 2. onLeaveStatusUpdate → Send FCM notification to employee when leave status changes
 * 3. onFaceEnrolled      → Notify admin when employee completes face enrollment
 * 4. onAttendanceFailed  → Notify admin when employee fails face recognition 3 times
 * 5. scheduledOvertimeCalc → Daily overtime calculation at 23:00 Asia/Jakarta
 */


import * as functions from 'firebase-functions/v1';
const functionsRegion = functions.region('asia-southeast2');

import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Helper: safely parse HH:MM time string into total minutes (returns null on invalid).
function parseTimeToMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const parts = value.split(':');
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Mobile clients save FCM registration tokens to the `fcm_tokens` collection
 * keyed by the token itself (see user_mobile/lib/providers/app_provider.dart
 * `_saveFCMToken`). Look up every active token for a userId, then send to
 * the lot via sendEachForMulticast so the user gets push on every device
 * they've signed in on. Tokens that come back as unregistered are deleted.
 */
async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
    channelId?: string;
  },
): Promise<number> {
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
  await Promise.all(
    res.responses.map(async (r, i) => {
      if (r.success) return;
      const code = r.error?.code ?? '';
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        try {
          await db.collection('fcm_tokens').doc(tokens[i]).delete();
        } catch (e) {
          console.warn('Failed to delete stale FCM token', tokens[i], e);
        }
      }
    }),
  );
  console.log(
    `sendPushToUser(${userId}): ${res.successCount}/${tokens.length} delivered`,
  );
  return res.successCount;
}


// ============================================================
// 1. onEmployeeCreated — Create Auth account + notify admin when employee is added
// ============================================================
export const onEmployeeCreated = functionsRegion.firestore

  .document('users/{userId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const data = snap.data();
    if (!data || data.role !== 'employee') return;
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
      try {
        await db.collection('adminNotifications').add({
          type: 'new_employee',
          title: 'Karyawan Baru Ditambahkan',
          message: `${data.name} (${data.email}) telah ditambahkan. Email kredensial dikirim.`,
          employeeName: data.name,
          employeeId: data.employeeId || null,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (notifError) {
        console.error('Failed to write adminNotification:', notifError);
      }

      console.log(`Employee created: ${data.name} (${data.email})`);
    } catch (error) {
      console.error('Error creating employee auth account:', error);
    }
  });


// ============================================================
// 2. onLeaveStatusUpdate — FCM to employee when leave approved/rejected
// ============================================================
export const onLeaveStatusUpdate = functionsRegion.firestore

  .document('leaves/{leaveId}')
  .onUpdate(async (change: functions.Change<functions.firestore.QueryDocumentSnapshot>) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;
    if (!after.userId) {
      console.error('onLeaveStatusUpdate: missing userId on leave', { leaveId: change.after.id });
      return;
    }

    // Only trigger when status changes from pending
    if (before.status === after.status || before.status !== 'pending') return;

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
      } catch (mirrorError) {
        console.error('Failed to mirror leave notification:', mirrorError);
      }

      console.log(`Leave decision delivered to ${after.employeeName || after.userId}: ${after.status}`);
    } catch (error) {
      console.error('Error sending leave FCM:', error);
    }
  });


// ============================================================
// 2b. onAttendanceCreated — Mirror to adminNotifications so admin bell rings
// ============================================================
export const onAttendanceCreated = functionsRegion.firestore
  .document('attendance/{attendanceId}')
  .onCreate(async (
    snap: functions.firestore.QueryDocumentSnapshot,
    context: functions.EventContext,
  ) => {
    const data = snap.data();
    if (!data) return;
    try {
      const status = String(data.status ?? 'present');
      const title = status === 'late' ? 'Karyawan Terlambat' : 'Absen Masuk Baru';
      const name = data.employeeName || data.userId || 'Karyawan';
      const message =
        status === 'late'
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
    } catch (e) {
      console.error('onAttendanceCreated mirror error:', e);
    }
  });


// ============================================================
// 2c. onUserProfileUpdated — Tell mobile when admin changes their account
// ============================================================
export const onUserProfileUpdated = functionsRegion.firestore
  .document('users/{userId}')
  .onUpdate(async (
    change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
    context: functions.EventContext,
  ) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;

    // Surface the small set of admin-driven changes the employee actually
    // needs to know about. Skip the high-volume churn fields (isOnline,
    // updatedAt, fcmToken legacy field, faceRegistered — handled elsewhere,
    // passwordChanged — internal, deviceModel — telemetry).
    const watched: Array<{ key: keyof typeof after; label: string }> = [
      { key: 'department',            label: 'departemen'        },
      { key: 'position',              label: 'jabatan'           },
      { key: 'role',                  label: 'role'              },
      { key: 'jamKerjaId',            label: 'jam kerja'         },
      { key: 'isActive',              label: 'status akun'       },
      { key: 'allowRemoteAttendance', label: 'akses absen remote'},
    ];
    const changed = watched.filter(w => before[w.key] !== after[w.key]);
    if (changed.length === 0) return;

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
    } catch (e) {
      console.error('Failed to mirror profile_updated notification:', e);
    }
  });


// ============================================================
// 3. onFaceEnrolled — Notify admin when employee enrolls face
// ============================================================
export const onFaceEnrolled = functionsRegion.firestore

  .document('users/{userId}')
  .onUpdate(async (change: functions.Change<functions.firestore.QueryDocumentSnapshot>) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;

    // Only trigger when faceRegistered changes from false to true
    if (before.faceRegistered || !after.faceRegistered) return;

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
    } catch (error) {
      console.error('Error writing face_enrolled notification:', error);
    }
  });


// ============================================================
// 4. onAttendanceFailed — Notify admin of repeated face failures
// ============================================================
export const onAttendanceFailed = functionsRegion.https.onCall(async (data: any) => {
  try {
    const userId = data?.userId;
    const employeeName = data?.employeeName;
    const failCount = Number(data?.failCount ?? 0);

    if (!userId || !employeeName) {
      return { success: false, error: 'missing_params' };
    }
    if (failCount < 3) return { success: false };

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
  } catch (error) {
    console.error('onAttendanceFailed error:', error);
    return { success: false, error: 'internal' };
  }
});


// ============================================================
// 5. scheduledOvertimeCalc — Daily overtime calculation at 23:00 Asia/Jakarta
// ============================================================
export const scheduledOvertimeCalc = functionsRegion.pubsub

  .schedule('0 23 * * *') // Run at 11 PM daily
  .timeZone('Asia/Jakarta')
  .onRun(async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const attendanceSnap = await db.collection('attendance')
        .where('date', '==', today)
        .where('status', '==', 'present')
        .get();

      let updated = 0;
      let skipped = 0;

      for (const doc of attendanceSnap.docs) {
        try {
          const data = doc.data();
          if (!data?.checkOut?.time || !data?.shiftId) { skipped++; continue; }

          const shiftDoc = await db.collection('shifts').doc(data.shiftId).get();
          const shift = shiftDoc.data();
          if (!shift) { skipped++; continue; }

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
        } catch (innerErr) {
          console.error('Overtime calc error for doc', doc.id, innerErr);
        }
      }

      console.log(`Overtime calc done for ${today}: updated=${updated} skipped=${skipped} total=${attendanceSnap.size}`);
    } catch (error) {
      console.error('scheduledOvertimeCalc failed:', error);
    }
  });
