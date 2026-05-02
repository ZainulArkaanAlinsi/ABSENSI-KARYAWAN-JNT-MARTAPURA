import EmployeeDetailClient from './EmployeeDetailClient';

// This is required for static export (output: export)
export function generateStaticParams() {
  // We return an empty array because employees are dynamic and fetched client-side.
  // In a real static site, you would fetch all IDs here, but for an admin dashboard
  // we usually rely on client-side routing.
  return [];
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <EmployeeDetailClient params={params} />;
}