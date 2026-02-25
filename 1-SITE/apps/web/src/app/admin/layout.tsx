import { requireAdminRedirect } from '@/lib/auth/server-auth';
import { Metadata } from 'next';
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

//  NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

export const metadata: Metadata = {
  title: 'Voices Admin | Admin',
  description: 'Centraal beheer-dashboard voor het Voices platform.',
};

/**
 *  ADMIN LAYOUT  Server-side admin check
 * Redirect naar / als niet ingelogd of niet admin.
 * Middleware zorgt al voor login-redirect op /admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🛡️ CHRIS-PROTOCOL: No try/catch around redirect-throwing functions in Server Components
  // Next.js handles redirects via thrown errors, which must bubble up.
  const user = await requireAdminRedirect();

  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>
      <AdminHeader />
      <div className="relative z-10">
        <Suspense fallback={<LoadingScreenInstrument message="Admin omgeving initialiseren..." />}>
          {children}
        </Suspense>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Voices Admin",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "system_management",
              "lexicon": ["Admin", "Self-Healing", "User DNA", "Bento Blueprint"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </>
  );
}
