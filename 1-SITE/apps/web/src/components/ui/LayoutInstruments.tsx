"use client";

import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes, ElementType, FormHTMLAttributes, forwardRef, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

/**
 * ROOT LAYOUT INSTRUMENT
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
      <body className={className}>
        {children}
      </body>
    </html>
  );
};

/**
 * PAGE WRAPPER INSTRUMENT
 * De vervanger voor <main> op pagina niveau
 */
export const PageWrapperInstrument = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ 
  children, 
  className = 'va-page-wrapper',
  ...props
}, ref) => {
  return (
    <main ref={ref} className={className} {...props}>
      {children}
    </main>
  );
});
PageWrapperInstrument.displayName = 'PageWrapperInstrument';

/**
 * SECTION INSTRUMENT
 * De vervanger voor <section>
 */
export const SectionInstrument = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ 
  children, 
  className = 'va-section',
  ...props
}, ref) => {
  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
});
SectionInstrument.displayName = 'SectionInstrument';

/**
 * CONTAINER INSTRUMENT
 * De vervanger voor <div>
 */
export interface ContainerInstrumentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  noTranslate?: boolean;
  ariaLabel?: string;
  role?: string;
}

export const ContainerInstrument = forwardRef<HTMLElement, ContainerInstrumentProps>(({ 
  children, 
  className = '',
  as: Component = 'div',
  noTranslate,
  ariaLabel,
  role,
  ...props
}, ref) => {
  return (
    <Component 
      ref={ref} 
      className={cn(
        className.includes('max-w-') ? className : cn("va-container", className),
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
});
ContainerInstrument.displayName = 'ContainerInstrument';

/**
 * HEADING INSTRUMENT
 * De vervanger voor <h1> t/m <h6>
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
  const Tag = `h${level}` as any;
  return (
    <Tag 
      ref={ref} 
      className={cn(
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/40 font-medium",
        className.includes('va-text-xs') && "text-[10px] font-black uppercase tracking-widest",
        className
      )} 
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Tag>
  );
});
HeadingInstrument.displayName = 'HeadingInstrument';

/**
 * TEXT INSTRUMENT
 * De vervanger voor <p> of <span>
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
  return (
    <Component 
      ref={ref} 
      className={cn(
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/40 font-medium",
        className.includes('va-text-xs') && "text-[10px] font-black uppercase tracking-widest",
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
});
TextInstrument.displayName = 'TextInstrument';

/**
 * BUTTON INSTRUMENT
 * De vervanger voor <button>
 */
export interface ButtonInstrumentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType;
  href?: string; // Add href for cases where it's used as an 'a' tag
  noTranslate?: boolean;
  ariaLabel?: string;
}

export const ButtonInstrument = forwardRef<HTMLButtonElement, ButtonInstrumentProps>(({ 
  children, 
  className = '',
  as: Component = 'button',
  type = 'button',
  noTranslate,
  ariaLabel,
  ...props
}, ref) => {
  const { href, ...otherProps } = props;
  return (
    <Component 
      ref={ref}
      type={Component === 'button' ? type : undefined}
      href={Component === 'a' ? href : undefined}
      className={cn(className, noTranslate && "notranslate")}
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      {...otherProps}
    >
      {children}
    </Component>
  );
});
ButtonInstrument.displayName = 'ButtonInstrument';

/**
 * INPUT INSTRUMENT
 * De vervanger voor <input>
 */
export const InputInstrument = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ 
  className = '',
  ...props
}, ref) => {
  return (
    <input 
      ref={ref}
      className={cn(
        "bg-va-off-white border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20",
        className
      )}
      {...props}
    />
  );
});
InputInstrument.displayName = 'InputInstrument';

/**
 * SELECT INSTRUMENT
 */
export const SelectInstrument = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ 
  children, 
  className = '',
  ...props
}, ref) => {
  return (
    <select ref={ref} className={className} {...props}>
      {children}
    </select>
  );
});
SelectInstrument.displayName = 'SelectInstrument';

/**
 * OPTION INSTRUMENT
 */
export const OptionInstrument = ({ 
  children, 
  ...props
}: React.OptionHTMLAttributes<HTMLOptionElement>) => {
  return (
    <option {...props}>
      {children}
    </option>
  );
};

/**
 * FORM INSTRUMENT
 */
export const FormInstrument = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(({ 
  children, 
  className = '',
  ...props
}, ref) => {
  return (
    <form ref={ref} onSubmit={props.onSubmit} className={className} {...props}>
      {children}
    </form>
  );
});
FormInstrument.displayName = 'FormInstrument';

/**
 * LABEL INSTRUMENT
 */
export const LabelInstrument = ({ 
  children, 
  className = '',
  ...props
}: HTMLAttributes<HTMLLabelElement>) => {
  return (
    <label 
      className={cn("text-[10px] font-black uppercase tracking-widest text-va-black/40 ml-4 mb-2 block", className)} 
      {...props}
    >
      {children}
    </label>
  );
};

/**
 * LOADING SCREEN INSTRUMENT
 */
export const LoadingScreenInstrument = ({ 
  text = 'Laden...' 
}: { 
  text?: string;
}) => {
  return (
    <ContainerInstrument className="fixed inset-0 bg-va-off-white z-[9999] flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
            <linearGradient id="loader_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#D63CFF', stopOpacity: 1 }} />
              <stop offset="20%" style={{ stopColor: '#FF0084', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FF0084', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <style>{`
            .loader-bar {
              fill: url(#loader_grad);
              transform-box: fill-box;
              transform-origin: 50% 50%;
              animation: loader-wave 2s cubic-bezier(.4,0,.2,1) infinite;
            }
            .lb1 { animation-delay: -0.1s; animation-duration: 2.2s; }
            .lb2 { animation-delay: -0.3s; animation-duration: 1.8s; }
            .lb3 { animation-delay: -0.2s; animation-duration: 2.0s; }
            .lb4 { animation-delay: -0.4s; animation-duration: 1.6s; }
            .lb5 { animation-delay: -0.2s; animation-duration: 2.1s; }

            @keyframes loader-wave {
              0%, 100% { transform: scaleY(0.8) scaleX(1); opacity: 0.8; }
              50% { transform: scaleY(1.2) scaleX(1.05); opacity: 1; }
            }
          `}</style>
          <g transform="matrix(0.750336088 0 0 0.750336088 168.565295 51.760476)">
            <rect x="402.21" y="117.60" width="79.85" height="959.57" rx="39.92" ry="39.92" className="loader-bar lb1"/>
            <rect x="207.63" y="358.58" width="89.02" height="478.73" rx="44.51" ry="44.51" className="loader-bar lb2"/>
            <rect x="585.09" y="358.58" width="89.02" height="478.73" rx="44.51" ry="44.51" className="loader-bar lb3"/>
            <rect x="760.47" y="484.62" width="82.79" height="258.44" rx="41.40" ry="41.40" className="loader-bar lb4"/>
            <rect x="40.17" y="484.62" width="82.79" height="258.44" rx="41.39" ry="41.39" className="loader-bar lb5"/>
          </g>
        </svg>
      </div>
    </ContainerInstrument>
  );
};
