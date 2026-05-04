import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import HeadUnitClient from './HeadUnitClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  // Gunakan ID dari DEPARTMENT_RULES sebagai slug statis
  return DEPARTMENT_RULES.map((rule) => ({
    slug: rule.id,
  }));
}

export default function HeadUnitPage() {
  return <HeadUnitClient />;
}
