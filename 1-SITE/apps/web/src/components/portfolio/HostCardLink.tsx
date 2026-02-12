"use client";

import { useRouter } from "next/navigation";
import { BentoCard } from "@/components/ui/BentoGrid";
import { ReactNode } from "react";

interface HostCardLinkProps {
  span?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  children: ReactNode;
}

export function HostCardLink({ span = "xl", className, children }: HostCardLinkProps) {
  const router = useRouter();
  return (
    <BentoCard span={span} className={className} onClick={() => router.push("/host")}>
      {children}
    </BentoCard>
  );
}
