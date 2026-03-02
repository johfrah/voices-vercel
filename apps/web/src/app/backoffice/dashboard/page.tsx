import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  TextInstrument,
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { ProfitEngineWidget } from '@/components/backoffice/ProfitEngineWidget';
import { getServerUser, isAdminUser } from '@/lib/auth/server-auth';
import { ArrowLeft, FolderOpen, Gauge } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BackofficeDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/account');
  if (!isAdminUser(user)) redirect('/studio');

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white px-6 py-24 md:px-10">
      <ContainerInstrument className="mx-auto max-w-7xl space-y-10">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} />
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          <TextInstrument className="text-[11px] font-black tracking-[0.2em] uppercase text-primary">
            Backoffice
          </TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tight">
            Operationele cockpit
          </HeadingInstrument>
          <TextInstrument className="max-w-2xl text-va-black/50">
            Centrale werkruimte voor media-operaties en profit monitoring.
          </TextInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3} className="gap-6">
          <ProfitEngineWidget />

          <BentoCard span="sm" className="bg-white border border-black/5 p-8 rounded-[20px] flex flex-col justify-between">
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center">
                <FolderOpen size={18} strokeWidth={1.5} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                Media Library
              </HeadingInstrument>
              <TextInstrument className="text-va-black/50">
                Beheer assets, zichtbaarheid en actor-koppelingen vanuit één plek.
              </TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/backoffice/media" className="va-btn-pro !bg-va-black mt-6">
              Open Media
            </ButtonInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-white border border-black/5 p-8 rounded-[20px] flex flex-col justify-between">
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Gauge size={18} strokeWidth={1.5} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                API-koppelingen
              </HeadingInstrument>
              <TextInstrument className="text-va-black/50">
                Backoffice API-endpoints zijn actief via `/api/backoffice/*` en gekoppeld aan deze cockpit.
              </TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/admin/system/logs" variant="outline" className="mt-6 border-black/10">
              Bekijk logs
            </ButtonInstrument>
          </BentoCard>
        </BentoGrid>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
