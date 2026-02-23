import { cn } from '@/lib/utils/utils';
import React, { ElementType, forwardRef, HTMLAttributes, ReactNode } from 'react';

/**
 * ROOT LAYOUT INSTRUMENT (SERVER READY)
 * De vervanger voor <html> en <body>
 */
export const RootLayoutInstrument = ({ 
  children, 
  lang = 'nl',
  className = 'va-main-layout'
}: { 
  children: ReactNode; 
  lang?: string;
  className?: string;
}) => {
  return (
    <html lang={lang}>
      <body className={cn(className, "pb-24 md:pb-0 touch-manipulation")}>
        {children}
      </body>
    </html>
  );
};

/**
 * PAGE WRAPPER INSTRUMENT (SERVER READY)
 */
export const PageWrapperInstrument = ({ 
  children, 
  className = 'va-page-wrapper',
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return (
    <main 
      className={cn(className, "va-render-optimize")} 
      style={{ contentVisibility: 'auto' } as React.CSSProperties}
      {...props}
    >
      {children}
    </main>
  );
};

/**
 * SECTION INSTRUMENT (SERVER READY)
 */
export const SectionInstrument = ({ 
  children, 
  className = 'va-section',
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return (
    <section className={className} {...props}>
      {children}
    </section>
  );
};

/**
 * CONTAINER INSTRUMENT (SERVER READY)
 */
export interface ContainerInstrumentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  noTranslate?: boolean;
  ariaLabel?: string;
  role?: string;
  plain?: boolean;
}

export const ContainerInstrument = ({ 
  children, 
  className = '',
  as: Component = 'div',
  noTranslate,
  ariaLabel,
  role,
  plain = false,
  ...props
}: ContainerInstrumentProps) => {
  const isStructural = Component === 'div' || Component === 'section' || Component === 'main' || Component === 'footer' || Component === 'header';
  const isListOrNav = Component === 'ul' || Component === 'li' || Component === 'nav';
  const hasManualPadding = /\bp[xy]?-\d+/.test(className) || className.includes('p-0') || className.includes('!px-0');
  const hasMaxWidth = className.includes('max-w-');
  const hasFlexLogic = className.includes('flex') || className.includes('grid') || className.includes('space-y-') || className.includes('space-x-');
  
  const shouldBePlain = plain || !isStructural || isListOrNav || hasManualPadding || hasMaxWidth || hasFlexLogic;

  return (
    <Component 
      className={cn(
        shouldBePlain ? className : cn("va-container", className),
        noTranslate && "notranslate"
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * HEADING INSTRUMENT (SERVER READY)
 */
export interface HeadingInstrumentProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  noTranslate?: boolean;
  ariaLabel?: string;
}

export const HeadingInstrument = ({ 
  children, 
  level = 1,
  className = '',
  noTranslate,
  ariaLabel,
  ...props
}: HeadingInstrumentProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag 
      className={cn(
        !className.includes('font-') && "font-light",
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/60",
        className
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Tag>
  );
};

/**
 * TEXT INSTRUMENT (SERVER READY)
 */
export interface TextInstrumentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  noTranslate?: boolean;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

export const TextInstrument = ({ 
  children, 
  as: Component = 'p',
  className = '',
  noTranslate,
  ariaLabel,
  ariaHidden,
  ...props
}: TextInstrumentProps) => {
  return (
    <Component 
      className={cn(
        !className.includes('font-') && "font-light",
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/60",
        className
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </Component>
  );
};
