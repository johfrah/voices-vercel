"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  const letters = "ademing".split("");
  
  const getAnimationClass = (index: number) => {
    if (index === 0 || index === 6) {
      return "animate-breathe-wave-subtle";
    }
    return "animate-breathe-wave";
  };
  
  return (
    <Link href="/" className={cn("flex items-end gap-0.5", className)} aria-label="Ga naar homepage">
      {letters.map((letter, index) => (
        <span
          key={index}
          className={cn(
            "text-3xl font-cormorant font-semibold text-foreground inline-block",
            getAnimationClass(index)
          )}
          style={{
            animationDelay: `${index * 0.15}s`,
          }}
        >
          {letter}
        </span>
      ))}
    </Link>
  );
};
