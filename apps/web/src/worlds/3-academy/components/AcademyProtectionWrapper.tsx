"use client";

import React, { ReactNode, MouseEvent, ClipboardEvent } from 'react';
import { ContainerInstrument } from '@/components/ui/LayoutInstruments';

interface AcademyProtectionWrapperProps {
  children: ReactNode;
  isAdmin: boolean;
}

export const AcademyProtectionWrapper = ({ children, isAdmin }: AcademyProtectionWrapperProps) => {
  return (
    <ContainerInstrument 
      onContextMenu={(e: MouseEvent) => !isAdmin && e.preventDefault()} 
      onCopy={(e: ClipboardEvent) => !isAdmin && e.preventDefault()}
      plain
    >
      {children}
    </ContainerInstrument>
  );
};
