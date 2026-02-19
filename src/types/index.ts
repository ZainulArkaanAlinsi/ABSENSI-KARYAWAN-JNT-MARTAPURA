// ============================================================
// JNE MTP Admin Dashboard — TypeScript Type Definitions
// ============================================================

export type UserRole = 'admin' | 'superadmin' | 'employee';

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'leave'
  | 'overtime'
  | 'holiday';

export type LeaveType = 'sick' | 'annual' | 'personal' | 'emergency' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type ShiftDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type NotificationType =
  | 'leave_request'
  | 'face_enrolled'
  | 'face_failed'
  | 'new_employee'
  | 'attendance_alert'
  | 'system';

// ============================================================
// Employee
// ============================================================
export interface Employee {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  employeeId: string;
  shiftId: string;
  role: UserRole;
  faceRegistered: boolean;
  fcmToken?: string;
  deviceId?: string;
  deviceModel?: string;
  registeredDeviceId?: string;
  photoUrl?: string;
  joinDate: string; // ISO date string
  contractType: 'permanent' | 'contract' | 'intern';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Shift
// ============================================================
export interface Shift {
  id: string;
  name: string;
  checkInTime: string;  // "HH:mm"
  checkOutTime: string; // "HH:mm"
  toleranceMinutes: number;
  workingDays: ShiftDay[];
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Attendance
// ============================================================
export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  shiftId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  checkIn?: {
    time: string;
    latitude: number;
    longitude: number;
    distance: number;
    faceScore: number;
    photoUrl?: string;
  };
  checkOut?: {
    time: string;
    latitude: number;
    longitude: number;
    distance: number;
    faceScore: number;
    photoUrl?: string;
  };
  totalWorkMinutes?: number;
  overtimeMinutes?: number;
  lateMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Leave Request
// ============================================================
export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  documentName?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Admin Notification
// ============================================================
export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  employeeId?: string;
  employeeName?: string;
  relatedId?: string; // leave ID, attendance ID, etc.
  isRead: boolean;
  createdAt: string;
}

// ============================================================
// System Settings
// ============================================================
export interface OfficeSettings {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface AttendanceSettings {
  maxFaceAttempts: number;
  faceSimilarityThreshold: number; // 0-100
  allowOfflineAttendance: boolean;
  overtimeCalculation: boolean;
}

export interface NotificationSettings {
  notifyOnLeaveRequest: boolean;
  notifyOnFaceEnrollment: boolean;
  notifyOnFaceFailure: boolean;
  notifyOnNewEmployee: boolean;
  emailNotifications: boolean;
  adminEmail: string;
}

export interface CompanySettings {
  companyName: string;
  logoUrl?: string;
  hrEmail: string;
  hrPhone: string;
  appDownloadUrl: string;
}

export interface SystemSettings {
  office: OfficeSettings;
  attendance: AttendanceSettings;
  notifications: NotificationSettings;
  company: CompanySettings;
}

// ============================================================
// Dashboard Stats
// ============================================================
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  overtimeThisMonth: number; // in hours
  faceRegisteredCount: number;
}

// ============================================================
// Chart Data
// ============================================================
export interface WeeklyAttendanceData {
  day: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
}

export interface DepartmentData {
  department: string;
  present: number;
  absent: number;
  total: number;
}

// ============================================================
// Filter / Query
// ============================================================
export interface AttendanceFilter {
  employeeId?: string;
  department?: string;
  status?: AttendanceStatus | 'all';
  startDate?: string;
  endDate?: string;
}

export interface EmployeeFilter {
  search?: string;
  department?: string;
  faceRegistered?: boolean | 'all';
  isActive?: boolean | 'all';
}
