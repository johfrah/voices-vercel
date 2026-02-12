import { requireAdminRedirect } from '@/lib/auth/server-auth';

/**
 * 🛡️ ADMIN LAYOUT – Server-side admin check
 * Redirect naar / als niet ingelogd of niet admin.
 * Middleware zorgt al voor login-redirect op /admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRedirect();
  return <>{children}</>;
}
