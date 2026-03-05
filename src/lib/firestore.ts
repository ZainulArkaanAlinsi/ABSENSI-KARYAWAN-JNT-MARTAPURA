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
import { db } from '@/lib/firebase';
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
} from '@/types';


// ============================================================
// Collection References
// ============================================================
export const COLLECTIONS = {
  USERS: 'users',
  JAM_KERJA: 'shifts', // Keeping 'shifts' as collection name for now but renaming constant
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'adminNotifications',
  EVENTS: 'events',
  DEPARTMENTS: 'departments',
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

    faceRegistered: data.faceRegistered ?? false,
    fcmToken: data.fcmToken,
    deviceId: data.deviceId,
    deviceModel: data.deviceModel,
    registeredDeviceId: data.registeredDeviceId,
    photoUrl: data.photoUrl,
    joinDate: toDate(data.joinDate),
    contractType: data.contractType || 'permanent',
    isActive: data.isActive ?? true,
    firstLogin: data.firstLogin ?? true,
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
  return {
    id,
    userId: data.userId || '',
    employeeName: data.employeeName || '',
    employeeId: data.employeeId || '',
    department: data.department || '',
    jamKerjaId: data.jamKerjaId || '',

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
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('role', '==', 'employee')
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => mapEmployee(d.id, d.data()));
  return data.sort((a, b) => a.name.localeCompare(b.name));
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
    where('role', '==', 'employee')
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => mapEmployee(d.id, d.data()));
    callback(data.sort((a, b) => a.name.localeCompare(b.name)));
  });
}

// ============================================================
// Jam Kerja
// ============================================================
export async function getJamKerjas(): Promise<JamKerja[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.JAM_KERJA));
  return snap.docs.map((d) => mapJamKerja(d.id, d.data()));
}

export async function addJamKerja(data: Omit<JamKerja, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
  return onSnapshot(collection(db, COLLECTIONS.JAM_KERJA), (snap) => {
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
  const constraints: QueryConstraint[] = [];
  if (status !== 'all') constraints.push(where('status', '==', status));
  
  const q = query(collection(db, COLLECTIONS.LEAVES), ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => mapLeave(d.id, d.data()));
    // Client-side sort to avoid index requirement for simple admin view
    const sorted = data.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    callback(sorted.slice(0, 50));
  });
}

// ============================================================
// Attendance
// ============================================================
export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => mapAttendance(d.id, d.data()));
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAttendanceByRange(
  startDate: string,
  endDate: string,
  userId?: string
): Promise<AttendanceRecord[]> {
  const constraints: QueryConstraint[] = [
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  ];
  if (userId) constraints.push(where('userId', '==', userId));
  
  const q = query(collection(db, COLLECTIONS.ATTENDANCE), ...constraints);
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => mapAttendance(d.id, d.data()));
  
  // Sort by date descending then by name/id
  return data.sort((a, b) => b.date.localeCompare(a.date));
}

export function subscribeToTodayAttendance(
  date: string,
  callback: (records: AttendanceRecord[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where('date', '==', date)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => mapAttendance(d.id, d.data()));
    const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sorted);
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

// ============================================================
// Events
// ============================================================
export async function getEvents(): Promise<CalendarEvent[]> {
  const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('startDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapEvent(d.id, d.data()));
}

export async function addEvent(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
  return onSnapshot(q, (snap) => {
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
  const dayBeforeMs  = startMs - 24 * 60 * 60 * 1000; // -1 day
  const thirtyMinMs  = startMs - 30 * 60 * 1000;       // -30 minutes

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

export async function addDepartment(data: Omit<DepartmentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
  return onSnapshot(collection(db, COLLECTIONS.DEPARTMENTS), (snap) => {
    const data = snap.docs.map((d) => mapDepartment(d.id, d.data()));
    callback(data.sort((a, b) => a.name.localeCompare(b.name)));
  });
}
