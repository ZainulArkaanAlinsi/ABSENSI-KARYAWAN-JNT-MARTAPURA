import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import HeadUnitClient from './HeadUnitClient';

export function generateStaticParams() {
  // Use IDs from DEPARTMENT_RULES for head-units
  return DEPARTMENT_RULES.map((rule) => ({
    slug: rule.id,
  }));
}

export default function HeadUnitPage() {
  return <HeadUnitClient />;
}
