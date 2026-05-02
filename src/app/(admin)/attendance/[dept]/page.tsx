import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import AttendanceClient from './AttendanceClient';

export function generateStaticParams() {
  return DEPARTMENT_RULES.map((rule) => ({
    dept: rule.name.toLowerCase().replace(/[\s/()]+/g, '-'),
  }));
}

export default function DepartmentAttendancePage() {
  return <AttendanceClient />;
}
