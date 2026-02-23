import { requireAdminRedirect } from '@/lib/auth/server-auth';
import { Metadata } from 'next';
import nextDynamic from "next/dynamic";
import { Suspense } from "react";

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
  await requireAdminRedirect();
  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>
      <div className="relative z-10">
        {children}
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
