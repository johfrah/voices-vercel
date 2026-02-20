"use client";

import React, { ReactNode } from 'react';

interface AcademyProtectionWrapperProps {
  children: ReactNode;
  isAdmin: boolean;
}

export const AcademyProtectionWrapper = ({ children, isAdmin }: AcademyProtectionWrapperProps) => {
  return (
    <div 
      onContextMenu={(e) => !isAdmin && e.preventDefault()} 
      onCopy={(e) => !isAdmin && e.preventDefault()}
      className="contents"
    >
      {children}
    </div>
  );
};
