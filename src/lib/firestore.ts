import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { listen } from './firestoreListener';
export { db, auth };
import { fortressRetry } from './fortress';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import type {
  Employee,
  JamKerja,
  LeaveRequest,
  AttendanceRecord,
  AdminNotification,
  SystemSettings,
  LeaveStatus,
  CalendarEvent,
  DepartmentItem,
  OvertimeRequest,
  OvertimeStatus,
} from '@/types';

// ============================================================
// Collection References
// ============================================================
export const COLLECTIONS = {
  USERS: 'users',
  JAM_KERJA: 'shifts',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  OVERTIME: 'overtime',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'adminNotifications',
  USER_NOTIFICATIONS: 'userNotifications',
  EVENTS: 'calendarEvents',
  DEPARTMENTS: 'departments',
  AUDIT_LOG: 'audit_log',
  PRESENCE: 'user_presence',
  FCM_TOKENS: 'fcm_tokens',
  MESSAGES: 'messages',
  CHATS: 'chats',
  BROADCASTS: 'broadcasts',
  SOS_ALERTS: 'sos_alerts',
  EDIT_REQUESTS: 'edit_requests',
} as const;

// ============================================================
// Helpers
// ============================================================
function toDate(ts: Timestamp | string | undefined): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  return ts.toDate().toISOString();
}

function mapEmployee(id: string, data: DocumentData): Employee {
  return {
    id,
    uid: data.uid || id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone,
    department: data.department || '',
    position: data.position || '',
    employeeId: data.employeeId || '',
    jamKerjaId: data.jamKerjaId || '',

    role: data.role || 'employee',
    isOnline: data.isOnline ?? false,
    faceRegistered: data.faceRegistered ?? false,
    fcmToken: data.fcmToken,
    deviceId: data.deviceId,
    deviceModel: data.deviceModel,
    registeredDeviceId: data.registeredDeviceId,
    photoUrl: data.photoUrl,
    facePhotoUrl: data.facePhotoUrl,
    joinDate: toDate(data.joinDate),
    contractType: data.contractType || 'permanent',
    isActive: data.isActive ?? true,
    firstLogin: data.firstLogin ?? true,
    allowRemoteAttendance:
      data.allowRemoteAttendance ?? (data.role === 'kurir' || data.role === 'driver'),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapJamKerja(id: string, data: DocumentData): JamKerja {
  return {
    id,
    name: data.name || '',
    checkInTime: data.checkInTime || '08:00',
    checkOutTime: data.checkOutTime || '17:00',
    toleranceMinutes: data.toleranceMinutes ?? 15,
    workingDays: data.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    color: data.color || '#3B82F6',
    isActive: data.isActive ?? true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapLeave(id: string, data: DocumentData): LeaveRequest {
  return {
    id,
    userId: data.userId || '',
    employeeName: data.employeeName || '',
    employeeId: data.employeeId || '',
    department: data.department || '',
    type: data.type || 'personal',
    status: data.status || 'pending',
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    totalDays: data.totalDays ?? 1,
    reason: data.reason || '',
    documentUrl: data.documentUrl,
    documentName: data.documentName,
    rejectionReason: data.rejectionReason,
    reviewedBy: data.reviewedBy,
    reviewedAt: toDate(data.reviewedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapAttendance(id: string, data: DocumentData): AttendanceRecord {
  // Always return "HH:mm" string — never ISO or raw Timestamp
  const extractTime = (obj: unknown): string | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    const toHHMM = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const o = obj as { time?: unknown; toDate?: () => Date };
    if (o.time !== undefined && o.time !== null) {
      if (typeof o.time === 'string') {
        if (o.time.includes('T')) return toHHMM(new Date(o.time)); // ISO → HH:mm
        return o.time.slice(0, 5); // Already "HH:mm"
      }
      const t = o.time as { toDate?: () => Date };
      if (t.toDate) return toHHMM(t.toDate()); // Firestore Timestamp
    }
    if (o.toDate) return toHHMM(o.toDate()); // obj itself is a Timestamp
    return undefined;
  };

  // Handle nested (old) or flat (new Data Connect style) formats
  const checkIn = data.checkIn
    ? {
        ...data.checkIn,
        time: extractTime(data.checkIn),
      }
    : data.checkInTime
      ? {
          time: toDate(data.checkInTime),
          latitude: data.checkInLatitude,
          longitude: data.checkInLongitude,
          distance: data.checkInDistance,
          faceScore: data.checkInFaceScore,
          photoUrl: data.checkInPhotoUrl,
        }
      : undefined;

  const checkOut = data.checkOut
    ? {
        ...data.checkOut,
        time: extractTime(data.checkOut),
      }
    : data.checkOutTime
      ? {
          time: toDate(data.checkOutTime),
          latitude: data.checkOutLatitude,
          longitude: data.checkOutLongitude,
          distance: data.checkOutDistance,
          faceScore: data.checkOutFaceScore,
          photoUrl: data.checkOutPhotoUrl,
        }
      : undefined;

  return {
    id,
    userId: data.userId || '',
    employeeName: data.employeeName || '',
    employeeId: data.employeeId || '',
    department: data.department || '',
    jamKerjaId: data.jamKerjaId || '',
    date: data.date || data.attendanceDate || '',
    status: data.status || 'absent',
    checkIn,
    checkOut,
    totalWorkMinutes: data.totalWorkMinutes,
    overtimeMinutes: data.overtimeMinutes,
    lateMinutes: data.lateMinutes,
    notes: data.notes,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapNotification(id: string, data: DocumentData): AdminNotification {
  return {
    id,
    type: data.type || 'system',
    title: data.title || '',
    message: data.message || '',
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    relatedId: data.relatedId,
    isRead: data.isRead ?? false,
    createdAt: toDate(data.createdAt),
  };
}

function mapEvent(id: string, data: DocumentData): CalendarEvent {
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    location: data.location,
    category: data.category || 'other',
    attendees: data.attendees || [],
    departments: data.departments || [],
    organizerId: data.organizerId || '',
    color: data.color || '#8B5CF6',
    imageUrl: data.imageUrl,
    price: data.price,
    ticketsLeft: data.ticketsLeft,
    notificationSentDayBefore: data.notificationSentDayBefore ?? false,
    notificationSent30Min: data.notificationSent30Min ?? false,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapDepartment(id: string, data: DocumentData): DepartmentItem {
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    color: data.color || '#E31E24',
    isActive: data.isActive ?? true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// ============================================================
// Employees
// ============================================================
export async function getEmployees(): Promise<Employee[]> {
  const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => mapEmployee(d.id, d.data()));
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, id));
  if (!snap.exists()) return null;
  return mapEmployee(snap.id, snap.data());
}

export async function addEmployee(
  data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.USERS), {
    ...data,
    faceRegistered: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

const firebaseConfig = {
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
};

export async function getNextEmployeeId(): Promise<string> {
  const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
  const snap = await getDocs(q);
  const count = snap.size + 1;
  return `JNE-MTP-${count.toString().padStart(3, '0')}`;
}
export async function registerEmployee(
  employeeData: Omit<Employee, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
  password: string,
): Promise<string> {
  let secondaryApp;
  try {
    // 1. Pastikan domain email benar
    let finalEmail = employeeData.email;
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@jne.mtp.com`;
    }

    // 2. Buat Secondary Auth agar Admin tidak ter-logout
    secondaryApp =
      getApps().find((app) => app.name === 'SecondaryAuth') ||
      initializeApp(firebaseConfig, 'SecondaryAuth');
    const secondaryAuth = getAuth(secondaryApp);

    // 3. Buat User di Firebase Auth. Kalau email-nya SUDAH terdaftar (mis. akun
    //    lama yang profil Firestore-nya sudah dihapus), JANGAN tolak — pakai
    //    ulang akun itu: sign-in dgn password yang admin masukkan lalu tulis
    //    ulang profilnya (ID = uid akun lama). Karyawan tetap kebuat.
    let userCred: UserCredential;
    try {
      userCred = await createUserWithEmailAndPassword(secondaryAuth, finalEmail, password);
    } catch (createErr) {
      const code = (createErr as { code?: string }).code;
      if (code !== 'auth/email-already-in-use') throw createErr;
      try {
        userCred = await signInWithEmailAndPassword(secondaryAuth, finalEmail, password);
      } catch (signInErr) {
        const sCode = (signInErr as { code?: string }).code;
        if (sCode === 'auth/wrong-password' || sCode === 'auth/invalid-credential') {
          throw new Error(
            'Email ini sudah punya akun dengan password berbeda. Masukkan password akun tersebut yang benar untuk memakainya kembali, atau gunakan email lain.',
          );
        }
        throw signInErr;
      }
    }
    const uid = userCred.user.uid;

    // 4. Buat/Perbarui Profil di Firestore dengan ID = UID
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(userRef, {
      ...employeeData,
      uid: uid,
      email: finalEmail,
      faceRegistered: false,
      isActive: true,
      firstLogin: true, // legacy flag (admin panel reads this)
      passwordChanged: false, // mobile app reads this — must be false on create
      // so the auto-bridge first-login path triggers
      // Simpan password sementara supaya Cloud Function onEmployeeCreated bisa
      // kirim ke email pribadi karyawan + admin bisa bagikan manual. Dibaca
      // hanya admin & pemilik (rules), auto-hapus saat ganti password.
      tempPasswordPlain: password,
      allowRemoteAttendance:
        employeeData.allowRemoteAttendance ??
        (employeeData.role === 'kurir' || employeeData.role === 'driver'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return uid;
  } catch (error) {
    console.error('Error registering employee:', error);
    throw error;
  } finally {
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  // 1. Ambil semua data absensi terkait
  const attendanceQuery = query(collection(db, COLLECTIONS.ATTENDANCE), where('userId', '==', id));
  const attendanceSnap = await getDocs(attendanceQuery);
  const deleteAttendancePromises = attendanceSnap.docs.map((d) => deleteDoc(d.ref));

  // 2. Ambil semua data izin/cuti terkait
  const leaveQuery = query(collection(db, COLLECTIONS.LEAVES), where('userId', '==', id));
  const leaveSnap = await getDocs(leaveQuery);
  const deleteLeavePromises = leaveSnap.docs.map((d) => deleteDoc(d.ref));

  // 3. Hapus dokumen user utama
  const deleteUserPromise = deleteDoc(doc(db, COLLECTIONS.USERS, id));

  // Jalankan semua proses hapus secara paralel
  await Promise.all([...deleteAttendancePromises, ...deleteLeavePromises, deleteUserPromise]);
}

export function subscribeToEmployees(callback: (employees: Employee[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('role', 'in', ['employee', 'kurir', 'driver']),
  );
  return listen(
    q,
    (snap) => {
      const data = snap.docs.map((d) => mapEmployee(d.id, d.data()));
      callback(data.sort((a, b) => a.name.localeCompare(b.name)));
    },
    'subscribeToEmployees',
  );
}

// ============================================================
// Jam Kerja
// ============================================================
export async function getJamKerjas(): Promise<JamKerja[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.JAM_KERJA));
  return snap.docs.map((d) => mapJamKerja(d.id, d.data()));
}

export async function addJamKerja(
  data: Omit<JamKerja, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.JAM_KERJA), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateJamKerja(id: string, data: Partial<JamKerja>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.JAM_KERJA, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJamKerja(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.JAM_KERJA, id));
}

export function subscribeToJamKerjas(callback: (jamKerjas: JamKerja[]) => void) {
  return listen(collection(db, COLLECTIONS.JAM_KERJA), (snap) => {
    callback(snap.docs.map((d) => mapJamKerja(d.id, d.data())));
  });
}

// ============================================================
// Leaves
// ============================================================
export async function getLeaves(status?: LeaveStatus): Promise<LeaveRequest[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (status) constraints.unshift(where('status', '==', status));
  const q = query(collection(db, COLLECTIONS.LEAVES), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapLeave(d.id, d.data()));
}

export async function updateLeaveStatus(
  id: string,
  status: LeaveStatus,
  reviewedBy: string,
  rejectionReason?: string,
): Promise<void> {
  await fortressRetry(
    async () => {
      await updateDoc(doc(db, COLLECTIONS.LEAVES, id), {
        status,
        reviewedBy,
        rejectionReason: rejectionReason || null,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    { taskName: `Update Leave Status ${id}` },
  );
}

export async function deleteLeave(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.LEAVES, id));
}

export function subscribeToLeaves(
  status: LeaveStatus | 'all',
  callback: (leaves: LeaveRequest[]) => void,
) {
  const constraints: QueryConstraint[] = [];
  if (status !== 'all') constraints.push(where('status', '==', status));

  const q = query(collection(db, COLLECTIONS.LEAVES), ...constraints);
  return listen(q, (snap) => {
    const data = snap.docs.map((d) => mapLeave(d.id, d.data()));
    // Client-side sort to avoid index requirement for simple admin view
    const sorted = data.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    callback(sorted.slice(0, 50));
  });
}

// ============================================================
// Overtime
// ============================================================
function mapOvertime(id: string, data: DocumentData): OvertimeRequest {
  const minutes = (data.overtimeMinutes as number | undefined) ?? 0;
  return {
    id,
    userId: data.userId || '',
    employeeName: data.employeeName || '',
    employeeId: data.employeeId || '',
    department: data.department || '',
    date: data.date || '',
    overtimeMinutes: minutes,
    overtimeHours: (data.overtimeHours as number | undefined) ?? Math.ceil(minutes / 60),
    status: (data.status as OvertimeStatus) || 'pending',
    reason: data.reason || '',
    adminReason: data.adminReason ?? data.rejectionReason ?? undefined,
    rejectionReason: data.rejectionReason ?? undefined,
    reviewedBy: data.reviewedBy ?? undefined,
    reviewedAt: toDate(data.reviewedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function updateOvertimeStatus(
  id: string,
  status: OvertimeStatus,
  reviewedBy: string,
  rejectionReason?: string,
): Promise<void> {
  await fortressRetry(
    async () => {
      await updateDoc(doc(db, COLLECTIONS.OVERTIME, id), {
        status,
        reviewedBy,
        rejectionReason: rejectionReason || null,
        adminReason: rejectionReason || null,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    { taskName: `Update Overtime Status ${id}` },
  );
}

export async function deleteOvertime(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.OVERTIME, id));
}

export function subscribeToOvertimes(
  status: OvertimeStatus | 'all',
  callback: (overtimes: OvertimeRequest[]) => void,
) {
  const constraints: QueryConstraint[] = [];
  if (status !== 'all') constraints.push(where('status', '==', status));

  const q = query(collection(db, COLLECTIONS.OVERTIME), ...constraints);
  return listen(q, (snap) => {
    const data = snap.docs.map((d) => mapOvertime(d.id, d.data()));
    const sorted = data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    callback(sorted.slice(0, 100));
  });
}

// ============================================================
// Attendance
// ============================================================
export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COLLECTIONS.ATTENDANCE), where('date', '==', date));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => mapAttendance(d.id, d.data()));
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAttendanceByRange(
  startDate: string,
  endDate: string,
  userId?: string,
  limitCount: number = 100,
): Promise<AttendanceRecord[]> {
  const constraints: QueryConstraint[] = [
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc'),
    limit(limitCount),
  ];
  if (userId) constraints.push(where('userId', '==', userId));

  const q = query(collection(db, COLLECTIONS.ATTENDANCE), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAttendance(d.id, d.data()));
}

export async function deleteAttendance(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ATTENDANCE, id));
}

/**
 * Koreksi manual catatan absensi oleh admin (mis. karyawan iseng absen,
 * minta diperbaiki). Mengubah status &/atau jam masuk/keluar.
 *
 * Kontrak data (lihat CLAUDE.md): tiap check ditulis di DUA tempat — nested
 * `checkIn.time` (Timestamp, dibaca duluan oleh admin & mobile) + flat
 * `checkInTime` (ISO string). Pakai dot-notation untuk nested supaya
 * foto/lat/lng di dalamnya TIDAK ikut terhapus. Waktu WAJIB Timestamp/ISO —
 * mobile parse via `DateTime.tryParse`, jadi "HH:mm" polos akan gagal.
 * Kirim `null` untuk mengosongkan sebuah check (mis. batalkan jam keluar).
 */
export async function updateAttendance(
  id: string,
  changes: { status?: string; checkInTime?: Date | null; checkOutTime?: Date | null },
): Promise<void> {
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (changes.status !== undefined) patch.status = changes.status;
  if (changes.checkInTime !== undefined) {
    const v = changes.checkInTime;
    patch['checkIn.time'] = v ? Timestamp.fromDate(v) : null;
    patch.checkInTime = v ? v.toISOString() : null;
  }
  if (changes.checkOutTime !== undefined) {
    const v = changes.checkOutTime;
    patch['checkOut.time'] = v ? Timestamp.fromDate(v) : null;
    patch.checkOutTime = v ? v.toISOString() : null;
  }
  await updateDoc(doc(db, COLLECTIONS.ATTENDANCE, id), patch);
}

export function subscribeToTodayAttendance(
  date: string,
  callback: (records: AttendanceRecord[]) => void,
  limitCount: number = 100,
) {
  // Single-field query — no composite index needed.
  // Also accept attendanceDate (legacy field name used by some mobile records).
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where('date', '==', date),
    limit(limitCount),
  );
  return listen(q, (snap) => {
    const data = snap.docs.map((d) => mapAttendance(d.id, d.data()));
    // Sort newest-first client-side (avoids orderBy composite index)
    data.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );
    callback(data);
  });
}

// ============================================================
// Notifications
// ============================================================
export function subscribeToNotifications(callback: (notifs: AdminNotification[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  return listen(q, (snap) => {
    callback(snap.docs.map((d) => mapNotification(d.id, d.data())));
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { isRead: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), where('isRead', '==', false));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
}

/** Hapus foto absensi (check-in/out) — kosongkan URL nested + flat. */
export async function clearAttendancePhoto(
  id: string,
  which: 'checkIn' | 'checkOut',
): Promise<void> {
  const flat = which === 'checkIn' ? 'checkInPhotoUrl' : 'checkOutPhotoUrl';
  await updateDoc(doc(db, COLLECTIONS.ATTENDANCE, id), {
    [`${which}.photoUrl`]: null,
    [flat]: null,
    updatedAt: serverTimestamp(),
  });
}

/** Hapus semua notifikasi (kosongkan kotak masuk). */
export async function clearAllNotifications(): Promise<void> {
  const snap = await getDocs(query(collection(db, COLLECTIONS.NOTIFICATIONS)));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// ============================================================
// Settings
// ============================================================
export async function getSystemSettings(): Promise<SystemSettings | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'system'));
  if (!snap.exists()) return null;
  return snap.data() as SystemSettings;
}

export async function updateSystemSettings(data: Partial<SystemSettings>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.SETTINGS, 'system'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================
// Events
// ============================================================
export async function getEvents(): Promise<CalendarEvent[]> {
  const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('startDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapEvent(d.id, d.data()));
}

export async function addEvent(
  data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<CalendarEvent>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
}

export function subscribeToEvents(callback: (events: CalendarEvent[]) => void) {
  const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('startDate', 'asc'));
  return listen(q, (snap) => {
    callback(snap.docs.map((d) => mapEvent(d.id, d.data())));
  });
}

// ============================================================
// Meeting Notification Scheduling
// ============================================================
const MEETING_NOTIFICATIONS = 'meetingNotifications';

/**
 * Creates two notification schedule docs in Firestore:
 *  1. 1 day (86400 seconds) before the meeting
 *  2. 30 minutes before the meeting
 *
 * Called whenever a meeting-category event is saved.
 */
export async function scheduleMeetingNotifications(
  eventId: string,
  eventTitle: string,
  startDateISO: string,
  departments: string[],
  employees: string[] = [],
): Promise<void> {
  if (!departments.length && !employees.length) return;

  const startMs = new Date(startDateISO).getTime();
  const dayBeforeMs = startMs - 24 * 60 * 60 * 1000; // -1 day
  const thirtyMinMs = startMs - 30 * 60 * 1000; // -30 minutes

  const base = {
    eventId,
    eventTitle,
    targetDepartments: departments,
    targetEmployees: employees,
    sent: false,
    createdAt: serverTimestamp(),
  };

  await Promise.all([
    addDoc(collection(db, MEETING_NOTIFICATIONS), {
      ...base,
      type: 'day_before',
      scheduledAt: new Date(dayBeforeMs).toISOString(),
    }),
    addDoc(collection(db, MEETING_NOTIFICATIONS), {
      ...base,
      type: '30_min_before',
      scheduledAt: new Date(thirtyMinMs).toISOString(),
    }),
  ]);
}

// ============================================================
// Departments
// ============================================================
export async function getDepartments(): Promise<DepartmentItem[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
  const data = snap.docs.map((d) => mapDepartment(d.id, d.data()));
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addDepartment(
  data: Omit<DepartmentItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.DEPARTMENTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDepartment(id: string, data: Partial<DepartmentItem>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.DEPARTMENTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.DEPARTMENTS, id));
}

export function subscribeToDepartments(callback: (departments: DepartmentItem[]) => void) {
  return listen(collection(db, COLLECTIONS.DEPARTMENTS), (snap) => {
    const data = snap.docs.map((d) => mapDepartment(d.id, d.data()));
    callback(data.sort((a, b) => a.name.localeCompare(b.name)));
  });
}

// ============================================================
// Audit Log
// ============================================================
export async function logAudit(
  action: string,
  targetUserId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const currentUser = auth.currentUser;

    await addDoc(collection(db, COLLECTIONS.AUDIT_LOG), {
      action,
      actorId: currentUser?.uid || 'system',
      actorEmail: currentUser?.email || 'system@jne.mtp.com',
      actorName: currentUser?.displayName || 'System',
      targetUserId,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Audit log failed:', e);
    // Non-blocking - don't throw
  }
}

// ============================================================
// Presence System (Firestore-based Heartbeat)
// ============================================================
export function updatePresence(
  userId: string,
  isOnline: boolean,
  deviceId?: string,
): Promise<void> {
  return setDoc(
    doc(db, COLLECTIONS.PRESENCE, userId),
    {
      userId,
      isOnline,
      lastSeen: serverTimestamp(),
      deviceId: deviceId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeToPresence(
  userId: string,
  callback: (isOnline: boolean, lastSeen?: Date) => void,
) {
  const ref = doc(db, COLLECTIONS.PRESENCE, userId);
  return listen(ref, (snap) => {
    const data = snap.data();
    if (data) {
      const lastSeen = data.lastSeen?.toDate?.() || new Date(data.lastSeen as string | number);
      callback(data.isOnline === true, lastSeen);
    } else {
      callback(false);
    }
  });
}

export function subscribeToAllPresence(callback: Record<string, boolean>) {
  const q = query(collection(db, COLLECTIONS.PRESENCE));
  return listen(q, (snap) => {
    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data?.isOnline === true) {
        callback[doc.id] = true;
      } else if (callback[doc.id] !== undefined) {
        callback[doc.id] = false;
      }
    });
  });
}

// ============================================================
// FCM Token Management
// ============================================================
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  await setDoc(
    doc(db, COLLECTIONS.FCM_TOKENS, token),
    {
      userId,
      token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteFCMToken(token: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FCM_TOKENS, token));
}

export function subscribeToUserFCMTokens(userId: string, callback: (tokens: string[]) => void) {
  const q = query(collection(db, COLLECTIONS.FCM_TOKENS), where('userId', '==', userId));
  return listen(q, (snap) => {
    const tokens = snap.docs.map((d) => d.id); // doc ID is the token
    callback(tokens);
  });
}
