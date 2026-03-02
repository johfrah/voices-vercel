"use client";

import { Flame, Droplet, Wind, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElementIconProps {
  element: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

export const ElementIcon = ({ element, size = 16, className, animated = true }: ElementIconProps) => {
  const common = cn(
    animated && "hover:scale-110",
    "transition-all"
  );

  switch (element?.toLowerCase()) {
    case "aarde":
      return <Leaf className={cn("text-element-aarde", common, className)} width={size} height={size} />;
    case "water":
      return <Droplet className={cn("text-element-water", common, className)} width={size} height={size} />;
    case "lucht":
      return <Wind className={cn("text-element-lucht", common, className)} width={size} height={size} />;
    case "vuur":
      return <Flame className={cn("text-element-vuur animate-pulse", common, className)} width={size} height={size} />;
    default:
      return null;
  }
};
