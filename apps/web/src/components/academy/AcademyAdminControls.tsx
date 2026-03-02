"use client";

import React from 'react';
import { FileText, EyeOff, Eye } from 'lucide-react';
import Link from 'next/link';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ContainerInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';

interface AcademyAdminControlsProps {
  lessonId: string;
  isPreviewMode: boolean;
}

export const AcademyAdminControls = ({ lessonId, isPreviewMode }: AcademyAdminControlsProps) => {
  return (
    <ContainerInstrument className="mb-8 p-4 bg-va-black rounded-2xl flex items-center justify-between shadow-xl border border-white/5">
      <ContainerInstrument className="flex items-center gap-3 text-white">
        <Eye size={20} className="text-primary" />
        <TextInstrument className="text-[15px] font-black tracking-tight">
          <VoiceglotText translationKey="auto.page.admin_mode_actief.f3753b" defaultText="Admin Mode Actief" />
        </TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="flex gap-4">
        {!isPreviewMode ? (
          <>
            <button
              onClick={() => window.print()}
              className="va-btn-pro !bg-white/10 !text-white !py-2 !px-4 !text-[15px] hover:!bg-white/20 flex items-center gap-2"
            >
              <FileText size={14} />
              <VoiceglotText translationKey="auto.page.print_workshop__pdf_.3934f2" defaultText="Print Workshop (PDF)" />
            </button>
            <Link href={`/academy/lesson/${lessonId}?preview=student`} className="va-btn-pro !bg-white/10 !text-white !py-2 !px-4 !text-[15px] hover:!bg-white/20">
              <VoiceglotText translationKey="auto.page.preview_als_student.9f9b1c" defaultText="Preview als Student" />
            </Link>
          </>
        ) : (
          <Link href={`/academy/lesson/${lessonId}`} className="va-btn-pro !py-2 !px-4 !text-[15px]">
            <VoiceglotText translationKey="auto.page.terug_naar_admin_mod.f246ba" defaultText="Terug naar Admin Mode" />
          </Link>
        )}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
