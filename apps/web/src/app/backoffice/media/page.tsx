import {
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  TextInstrument,
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { MediaLibrary } from '@/components/backoffice/MediaLibrary';
import { getServerUser, isAdminUser } from '@/lib/auth/server-auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BackofficeMediaPage() {
  const user = await getServerUser();
  if (!user) redirect('/account');
  if (!isAdminUser(user)) redirect('/studio');

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white px-6 py-24 md:px-10">
      <ContainerInstrument className="mx-auto max-w-[1600px] space-y-8">
        <ContainerInstrument className="space-y-4">
          <Link href="/backoffice/dashboard" className="inline-flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} />
            <VoiceglotText translationKey="common.back" defaultText="Terug naar Backoffice" />
          </Link>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tight">
            Media Backoffice
          </HeadingInstrument>
          <TextInstrument className="text-va-black/50">
            Upload, beheer en synchroniseer assets voor de operationele workflow.
          </TextInstrument>
        </ContainerInstrument>

        <MediaLibrary />
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
