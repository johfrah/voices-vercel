"use client";

import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes, ElementType, forwardRef, HTMLAttributes, ReactNode } from 'react';

/**
 * ROOT LAYOUT INSTRUMENT
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
 * PAGE WRAPPER INSTRUMENT
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
 * SECTION INSTRUMENT
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
 * CONTAINER INSTRUMENT
 */
export interface ContainerInstrumentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  noTranslate?: boolean;
  ariaLabel?: string;
  role?: string;
  plain?: boolean;
}

export const ContainerInstrument = forwardRef<HTMLElement, ContainerInstrumentProps>(({ 
  children, 
  className = '',
  as: Component = 'div',
  noTranslate,
  ariaLabel,
  role,
  plain = false,
  ...props
}, ref) => {
  const normalizedClassName = typeof className === 'string' ? className : '';
  const ResolvedComponent = Component as ElementType;
  const isStructural = ResolvedComponent === 'div' || ResolvedComponent === 'section' || ResolvedComponent === 'main' || ResolvedComponent === 'footer' || ResolvedComponent === 'header';
  const isListOrNav = ResolvedComponent === 'ul' || ResolvedComponent === 'li' || ResolvedComponent === 'nav';
  const hasManualPadding = /\bp[xy]?-\d+/.test(normalizedClassName) || normalizedClassName.includes('p-0') || normalizedClassName.includes('!px-0');
  const hasMaxWidth = normalizedClassName.includes('max-w-');
  const hasFlexLogic = normalizedClassName.includes('flex') || normalizedClassName.includes('grid') || normalizedClassName.includes('space-y-') || normalizedClassName.includes('space-x-');
  
  const shouldBePlain = plain || !isStructural || isListOrNav || hasManualPadding || hasMaxWidth || hasFlexLogic;

  return (
    <ResolvedComponent 
      ref={ref}
      className={cn(
        shouldBePlain ? normalizedClassName : cn("va-container", normalizedClassName),
        noTranslate && "notranslate"
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {children}
    </ResolvedComponent>
  );
});
ContainerInstrument.displayName = 'ContainerInstrument';

/**
 * HEADING INSTRUMENT
 */
export interface HeadingInstrumentProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  noTranslate?: boolean;
  ariaLabel?: string;
}

export const HeadingInstrument = forwardRef<HTMLHeadingElement, HeadingInstrumentProps>(({ 
  children, 
  level = 1,
  className = '',
  noTranslate,
  ariaLabel,
  ...props
}, ref) => {
  const Tag = (`h${level}` as unknown) as ElementType;
  const normalizedClassName = typeof className === 'string' ? className : '';
  
  return (
    <Tag 
      ref={ref as any}
      className={cn(
        !normalizedClassName.includes('font-') && "font-light",
        noTranslate && "notranslate",
        normalizedClassName.includes('va-text-soft') && "text-va-black/60",
        normalizedClassName
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
});
HeadingInstrument.displayName = 'HeadingInstrument';

/**
 * TEXT INSTRUMENT
 */
export interface TextInstrumentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  noTranslate?: boolean;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

export const TextInstrument = forwardRef<HTMLElement, TextInstrumentProps>(({ 
  children, 
  as: Component = 'p',
  className = '',
  noTranslate,
  ariaLabel,
  ariaHidden,
  ...props
}, ref) => {
  const normalizedClassName = typeof className === 'string' ? className : '';
  const ResolvedComponent = Component as ElementType;
  return (
    <ResolvedComponent 
      ref={ref}
      className={cn(
        !normalizedClassName.includes('font-') && "font-light",
        noTranslate && "notranslate",
        normalizedClassName.includes('va-text-soft') && "text-va-black/60",
        normalizedClassName
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </ResolvedComponent>
  );
});
TextInstrument.displayName = 'TextInstrument';

/**
 * CLIENT BUTTON INSTRUMENT
 */
export interface ButtonInstrumentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType;
  href?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'danger' | 'nav' | 'pure' | 'plain';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'none';
  noTranslate?: boolean;
  ariaLabel?: string;
  target?: string;
  download?: any;
}

export const ClientButtonInstrument = forwardRef<HTMLButtonElement, ButtonInstrumentProps>(({ 
  children, 
  className = '',
  as: Component = 'button',
  type = 'button',
  variant = 'default',
  size = 'default',
  noTranslate,
  ariaLabel,
  target,
  download,
  ...props
}, ref) => {
  const { href, ...otherProps } = props;
  
  const variantClasses = {
    default: "bg-va-black text-white hover:bg-va-black/90",
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary/20 bg-transparent hover:bg-primary/5 text-primary",
    ghost: "bg-transparent border-none shadow-none",
    link: "bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto justify-start inline-flex",
    danger: "bg-red-500 text-white hover:bg-red-600",
    nav: "bg-transparent border-none shadow-none hover:bg-va-black/5 active:scale-100",
    pure: "bg-transparent border-none shadow-none rounded-none active:scale-100",
    plain: "bg-transparent border-none shadow-none p-0 h-auto !rounded-none !scale-100 !bg-none justify-start inline-flex"
  };

  const sizeClasses = {
    default: "px-6 py-3",
    sm: "px-4 py-2 text-xs",
    lg: "px-8 py-4 text-lg",
    icon: "p-3",
    none: "p-0 !min-h-0 !min-w-0 !rounded-none !m-0"
  };

  return (
    <Component 
      ref={ref}
      type={Component === 'button' ? type : undefined}
      href={(typeof Component === 'string' && Component !== 'a') ? undefined : href}
      target={target}
      download={download}
      className={cn(
        "rounded-[10px] active:scale-95 transition-all duration-500 text-[15px] ease-va-bezier inline-flex items-center justify-center whitespace-nowrap cursor-pointer",
        !className.includes('font-') && "font-light",
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
        (variant === 'link' || variant === 'plain') && "justify-start",
        className,
        noTranslate && "notranslate"
      )}
      style={{ cursor: 'pointer' }}
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      onClick={(e: any) => {
        if (props.onClick) props.onClick(e);
      }}
      {...otherProps}
    >
      {children}
    </Component>
  );
});
ClientButtonInstrument.displayName = 'ClientButtonInstrument';
