import type { Metadata } from 'next';
import AdminClientLayout from './AdminClientLayout';

/**
 * Admin layout as a SERVER component so we can export `metadata`.
 * Next.js injects the manifest link in the initial server-rendered HTML,
 * meaning the browser reads the admin manifest BEFORE React hydrates.
 * This is the only reliable way to control the PWA start_url per section.
 */
export const metadata: Metadata = {
  // Override the root manifest for all /admin/* routes
  manifest: '/admin-manifest.json',
  title: 'Techno Fit Admin',
  description: 'Panel de Administración - Techno Fit',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}

