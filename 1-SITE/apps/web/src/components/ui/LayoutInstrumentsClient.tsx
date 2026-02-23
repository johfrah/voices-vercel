"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { ButtonHTMLAttributes, ElementType, forwardRef } from 'react';

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
  ...props
}, ref) => {
  const { playClick } = useSonicDNA();
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
      href={(Component === 'a' || Component === Link) ? href : undefined}
      className={cn(
        "rounded-[10px] active:scale-95 transition-all duration-500 text-[15px] ease-va-bezier inline-flex items-center justify-center whitespace-nowrap cursor-pointer",
        !className.includes('font-') && "font-light",
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
        (variant === 'link' || variant === 'plain') && "justify-start",
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
ClientButtonInstrument.displayName = 'ClientButtonInstrument';
