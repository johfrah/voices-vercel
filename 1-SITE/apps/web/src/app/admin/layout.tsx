import { requireAdminRedirect } from '@/lib/auth/server-auth';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voices Cockpit | Admin',
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
      <LiquidBackground />
      <div className="relative z-10">
        {children}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Voices Cockpit",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "system_management",
              "lexicon": ["Cockpit", "Self-Healing", "User DNA", "Bento Blueprint"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </>
  );
}
