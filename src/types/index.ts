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

export type WorkDay =
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
  | 'meeting_reminder'
  | 'system';

// ============================================================
// Department definitions
// ============================================================
export type Department =
  | 'rider_delivery'
  | 'driver_delivery'
  | 'inbound_outbound'
  | 'pick_up'
  | 'admin_support'
  | 'accounting'
  | 'sales_sco';

export interface DepartmentRule {
  id: Department;
  name: string;
  checkInTime: string;       // "HH:mm"
  checkOutTime: string;      // "HH:mm"
  checkOutNextDay?: boolean;
  toleranceMinutes: number;
  trackFromHome?: boolean;
  gpsRequired: boolean;
  radiusMeters?: number;
  targetBased?: boolean;
  dailyTarget?: number;
  color: string;
  description: string;
  target?: string;
}


// ============================================================
// Employee
// ============================================================
export interface Employee {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  department: Department;
  position: string;
  employeeId: string;
  jamKerjaId: string;
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
  firstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Jam Kerja (formerly Shift)
// ============================================================
export interface JamKerja {
  id: string;
  name: string;
  checkInTime: string;  // "HH:mm"
  checkOutTime: string; // "HH:mm"
  toleranceMinutes: number;
  workingDays: WorkDay[];

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
  department: Department;
  jamKerjaId: string;
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
  department: Department;
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
// ============================================================
// Calendar & Events
// ============================================================
export type EventCategory = 'meeting' | 'training' | 'social' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  location?: string;
  category: EventCategory;
  attendees: string[]; // employee IDs or names
  departments?: string[]; // departments invited (for meeting category)
  organizerId: string;
  color?: string;
  imageUrl?: string;
  price?: number;
  ticketsLeft?: number;
  notificationSentDayBefore?: boolean;
  notificationSent30Min?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Meeting Notification schedule
// ============================================================
export interface MeetingNotificationSchedule {
  id: string;
  eventId: string;
  eventTitle: string;
  targetDepartments: string[];
  scheduledAt: string; // ISO — when to send
  type: 'day_before' | '30_min_before';
  sent: boolean;
  createdAt: string;
}

export interface Settings {
  office: {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    radiusMeters: number;
  };
  company: {
    companyName: string;
    appDownloadUrl: string;
    hrEmail: string;
    hrPhone: string;
  };
  attendance: {
    maxFaceAttempts: number;
    faceSimilarityThreshold: number;
    allowOfflineAttendance: boolean;
    overtimeCalculation: boolean;
  };
  notifications: {
    notifyOnLeaveRequest: boolean;
    notifyOnFaceEnrollment: boolean;
    notifyOnFaceFailure: boolean;
    notifyOnNewEmployee: boolean;
    emailNotifications: boolean;
    adminEmail: string;
  };
}
// ============================================================
// Salary & Payroll
// ============================================================
export interface SalaryRecord {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  month: number; // 1-12
  year: number;
  baseSalary: number;
  overtimePay: number;
  allowance: number;
  deductions: {
    late: number;
    absent: number;
    other: number;
  };
  netSalary: number;
  status: 'draft' | 'published' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface SalarySummary {
  totalPayroll: number;
  totalOvertime: number;
  totalDeductions: number;
  employeeCount: number;
}
