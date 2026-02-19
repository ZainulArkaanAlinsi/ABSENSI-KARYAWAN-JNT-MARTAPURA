import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Employee,
  Shift,
  LeaveRequest,
  AttendanceRecord,
  AdminNotification,
  SystemSettings,
  LeaveStatus,
} from '@/types';

// ============================================================
// Collection References
// ============================================================
export const COLLECTIONS = {
  USERS: 'users',
  SHIFTS: 'shifts',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'adminNotifications',
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
    shiftId: data.shiftId || '',
    role: data.role || 'employee',
    faceRegistered: data.faceRegistered ?? false,
    fcmToken: data.fcmToken,
    deviceId: data.deviceId,
    deviceModel: data.deviceModel,
    registeredDeviceId: data.registeredDeviceId,
    photoUrl: data.photoUrl,
    joinDate: toDate(data.joinDate),
    contractType: data.contractType || 'permanent',
    isActive: data.isActive ?? true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapShift(id: string, data: DocumentData): Shift {
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
  return {
    id,
    userId: data.userId || '',
    employeeName: data.employeeName || '',
    employeeId: data.employeeId || '',
    department: data.department || '',
    shiftId: data.shiftId || '',
    date: data.date || '',
    status: data.status || 'absent',
    checkIn: data.checkIn,
    checkOut: data.checkOut,
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

// ============================================================
// Employees
// ============================================================
export async function getEmployees(): Promise<Employee[]> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('role', '==', 'employee'),
    orderBy('name')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapEmployee(d.id, d.data()));
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, id));
  if (!snap.exists()) return null;
  return mapEmployee(snap.id, snap.data());
}

export async function addEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.USERS), {
    ...data,
    faceRegistered: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.USERS, id));
}

export function subscribeToEmployees(callback: (employees: Employee[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('role', '==', 'employee'),
    orderBy('name')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapEmployee(d.id, d.data())));
  });
}

// ============================================================
// Shifts
// ============================================================
export async function getShifts(): Promise<Shift[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.SHIFTS));
  return snap.docs.map((d) => mapShift(d.id, d.data()));
}

export async function addShift(data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.SHIFTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateShift(id: string, data: Partial<Shift>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.SHIFTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteShift(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SHIFTS, id));
}

export function subscribeToShifts(callback: (shifts: Shift[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.SHIFTS), (snap) => {
    callback(snap.docs.map((d) => mapShift(d.id, d.data())));
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
  rejectionReason?: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.LEAVES, id), {
    status,
    reviewedBy,
    rejectionReason: rejectionReason || null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToLeaves(
  status: LeaveStatus | 'all',
  callback: (leaves: LeaveRequest[]) => void
) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(50)];
  if (status !== 'all') constraints.unshift(where('status', '==', status));
  const q = query(collection(db, COLLECTIONS.LEAVES), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapLeave(d.id, d.data())));
  });
}

// ============================================================
// Attendance
// ============================================================
export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where('date', '==', date),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAttendance(d.id, d.data()));
}

export async function getAttendanceByRange(
  startDate: string,
  endDate: string,
  userId?: string
): Promise<AttendanceRecord[]> {
  const constraints: QueryConstraint[] = [
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc'),
  ];
  if (userId) constraints.push(where('userId', '==', userId));
  const q = query(collection(db, COLLECTIONS.ATTENDANCE), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAttendance(d.id, d.data()));
}

export function subscribeToTodayAttendance(
  date: string,
  callback: (records: AttendanceRecord[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where('date', '==', date),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapAttendance(d.id, d.data())));
  });
}

// ============================================================
// Notifications
// ============================================================
export function subscribeToNotifications(callback: (notifs: AdminNotification[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapNotification(d.id, d.data())));
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { isRead: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
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
