/**
 * LAYOUT INSTRUMENTS (VOICES 2026)
 * 
 * De visuele bouwstenen van het Voices Ecosysteem.
 * Garandeert consistentie in afronding, typografie en interactie.
 * 
 * @lock-file
 */

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { ButtonHTMLAttributes, ElementType, FormHTMLAttributes, forwardRef, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

// Re-export server components
export { 
  RootLayoutInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from './LayoutInstrumentsServer';

// Import client hooks for client components
import { ClientButtonInstrument } from './LayoutInstrumentsClient';

/**
 * BUTTON INSTRUMENT
 */
export const ButtonInstrument = ClientButtonInstrument;

/**
 * INPUT INSTRUMENT
 */
export const InputInstrument = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ 
  className = '',
  ...props
}, ref) => {
  return (
    <input 
      ref={ref}
      className={cn(
        "bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all placeholder:text-va-black/40",
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
    <select ref={ref} className={cn(className, "rounded-[10px] bg-va-off-white border-none px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all")} {...props}>
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
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (React.isValidElement(node)) {
      if ((node.type as any).displayName === 'VoiceglotText') {
        return (node.props as any).defaultText || '';
      }
      return getTextContent(node.props.children);
    }
    return '';
  };

  const textContent = getTextContent(children);

  return (
    <option {...props} className="text-[15px]">
      {textContent}
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
      className={cn("text-[13px] font-light tracking-widest text-va-black/40 ml-4 mb-2 block relative z-0", className)} 
      {...props}
    >
      {children}
    </label>
  );
};

/**
 * CIRCULAR FLAG COMPONENTS
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
 * FIXED ACTION DOCK INSTRUMENT
 */
export const FixedActionDockInstrument = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => {
  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500",
      className
    )}>
      <div className="bg-white/80 backdrop-blur-2xl border border-black/5 p-2 rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

/**
 * LOADING SCREEN INSTRUMENT
 */
export const LoadingScreenInstrument = ({ 
  text = '' 
}: { 
  text?: string;
}) => {
  return (
    <div className="fixed inset-0 bg-va-off-white z-[9999] flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
            <linearGradient id="loader_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
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
          <g transform="translate(500, 500) scale(0.8)">
            <rect x="-40" y="-300" width="80" height="600" rx="40" ry="40" className="loader-bar lb1"/>
            <rect x="-240" y="-150" width="90" height="300" rx="45" ry="45" className="loader-bar lb2"/>
            <rect x="150" y="-150" width="90" height="300" rx="45" ry="45" className="loader-bar lb3"/>
            <rect x="330" y="-50" width="80" height="100" rx="40" ry="40" className="loader-bar lb4"/>
            <rect x="-410" y="-50" width="80" height="100" rx="40" ry="40" className="loader-bar lb5"/>
          </g>
        </svg>
      </div>
      {text && (
        <p className="mt-12 text-[13px] font-bold text-va-black/20 uppercase tracking-[0.3em] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
