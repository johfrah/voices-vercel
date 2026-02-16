"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
      <body className={cn(className, "pb-24 md:pb-0 select-none touch-manipulation")}>
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
  //  ANTI-PADDING-OVERLAP LOGIC (VOICES 2026)
  // Een container mag NOOIT dubbele padding krijgen.
  // We blokkeren de standaard "va-container" (40px padding) als:
  // 1. De prop 'plain' op true staat.
  // 2. Er handmatig padding is toegevoegd (p-, px-, py-).
  // 3. Er een max-width (max-w-) is ingesteld (die vaak al gecentreerd is).
  const hasManualPadding = /\bp[xy]?-\d+/.test(className);
  const hasMaxWidth = className.includes('max-w-');
  const shouldBePlain = plain || hasManualPadding || hasMaxWidth;

  return (
    <Component 
      ref={ref} 
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
        "font-light text-[15px]", //  CHRIS MANDATE: Default to light and 15px
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/40",
        className,
        // Force override any slop weight or size classes if they are smaller than 15px or heavier than light
        "font-light" 
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
        "text-[15px] font-light", //  CHRIS MANDATE: Default to 15px and light
        noTranslate && "notranslate",
        className.includes('va-text-soft') && "text-va-black/40",
        className,
        // Force override any slop weight or size classes
        "font-light"
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
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'danger' | 'nav' | 'pure' | 'plain';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'none';
  noTranslate?: boolean;
  ariaLabel?: string;
}

export const ButtonInstrument = forwardRef<HTMLButtonElement, ButtonInstrumentProps>(({ 
  children, 
  className = '',
  as: Component = 'button',
  type = 'button',
  variant = 'default',
  size = 'default',
  noTranslate,
  ariaLabel,
  ...props
}, ref) => {
  const { playClick } = useSonicDNA();
  const { href, ...otherProps } = props;
  
  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary/20 bg-transparent hover:bg-primary/5 text-primary",
    ghost: "bg-transparent border-none shadow-none",
    link: "bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto",
    danger: "bg-red-500 text-white hover:bg-red-600",
    nav: "bg-transparent border-none shadow-none hover:bg-va-black/5 active:scale-100",
    pure: "bg-transparent border-none shadow-none rounded-none active:scale-100",
    plain: "bg-transparent border-none shadow-none p-0 h-auto !rounded-none !scale-100 !bg-none"
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
      href={(Component === 'a' || Component === Link) ? href : undefined}
      className={cn(
        "rounded-[10px] active:scale-95 transition-all duration-500 text-[15px] font-light ease-va-bezier inline-flex items-center justify-center whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
        noTranslate && "notranslate"
      )}
      translate={noTranslate ? "no" : undefined}
      aria-label={ariaLabel}
      onClick={(e: any) => {
        playClick('soft');
        if (props.onClick) props.onClick(e);
      }}
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
        "bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20",
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
    <select ref={ref} className={cn(className, "rounded-[10px] bg-va-off-white border-none px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all")} {...props}>
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
    <option {...props} className="text-[15px]">
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
      className={cn("text-[15px] font-light tracking-widest text-va-black/40 ml-4 mb-2 block", className)} 
      {...props}
    >
      {children}
    </label>
  );
};

/**
 * 🛡️ CHRIS-PROTOCOL: Circular Flag Components (Centralized)
 */
export const FlagBE = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-black" />
      <div className="w-1/3 h-full bg-[#FAE042]" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

export const FlagNL = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-[#AE1C28]" />
      <div className="h-1/3 w-full bg-white" />
      <div className="h-1/3 w-full bg-[#21468B]" />
    </div>
  </div>
);

export const FlagFR = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#002395]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

export const FlagUK = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#00247D] relative">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[15%] bg-white rotate-45" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[15%] bg-white -rotate-45" />
    </div>
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[8%] bg-[#CF142B] rotate-45" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[8%] bg-[#CF142B] -rotate-45" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[25%] bg-white" />
      <div className="h-full w-[25%] bg-white" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[15%] bg-[#CF142B]" />
      <div className="h-full w-[15%] bg-[#CF142B]" />
    </div>
  </div>
);

export const FlagUS = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0 bg-white relative flex flex-col">
    {[...Array(7)].map((_, i) => (
      <div key={i} className={cn("h-[14%] w-full", i % 2 === 0 ? "bg-[#B22234]" : "bg-white")} />
    ))}
    <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[#3C3B6E] flex flex-wrap p-0.5 gap-0.5 items-start content-start">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-[20%] h-[20%] bg-white rounded-full shrink-0" />
      ))}
    </div>
  </div>
);

export const FlagDE = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-black" />
      <div className="h-1/3 w-full bg-[#FF0000]" />
      <div className="h-1/3 w-full bg-[#FFCC00]" />
    </div>
  </div>
);

export const FlagES = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/4 w-full bg-[#AA151B]" />
      <div className="h-2/4 w-full bg-[#F1BF00]" />
      <div className="h-1/4 w-full bg-[#AA151B]" />
    </div>
  </div>
);

export const FlagIT = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#009246]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#CE2B37]" />
    </div>
  </div>
);

export const FlagPL = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/2 w-full bg-white" />
      <div className="h-1/2 w-full bg-[#DC143C]" />
    </div>
  </div>
);

export const FlagDK = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#C60C30] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[10%] bg-white" />
      <div className="h-full w-[10%] bg-white" style={{ marginLeft: '-20%' }} />
    </div>
  </div>
);

export const FlagPT = ({ size = 20 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-black/5 shrink-0 relative flex">
    <div className="w-[40%] h-full bg-[#006600]" />
    <div className="w-[60%] h-full bg-[#FF0000]" />
  </div>
);

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
