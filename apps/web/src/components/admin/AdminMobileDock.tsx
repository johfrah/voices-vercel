"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, LayoutDashboard, ShoppingBag, Smartphone, Vault } from "lucide-react";
import { ContainerInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { cn } from "@/lib/utils";

const MOBILE_DOCK_ITEMS = [
  { href: "/admin/mobile", label: "Mobiel", icon: Smartphone },
  { href: "/admin/dashboard", label: "Overzicht", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/mailbox", label: "Mailbox", icon: CircleUserRound },
  { href: "/admin/settings", label: "Settings", icon: Vault },
];

export function AdminMobileDock() {
  const pathname = usePathname();

  return (
    <ContainerInstrument
      plain
      className="md:hidden fixed bottom-0 left-0 right-0 z-[190] border-t border-black/10 bg-white/95 backdrop-blur-xl px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] dark:bg-va-black/95 dark:border-white/10"
    >
      <ContainerInstrument plain className="grid grid-cols-5 gap-1">
        {MOBILE_DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className="block">
              <ContainerInstrument
                plain
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl py-2 transition-colors",
                  isActive
                    ? "bg-va-black text-white dark:bg-white dark:text-va-black"
                    : "text-va-black/60 dark:text-white/70"
                )}
              >
                <Icon size={18} strokeWidth={1.8} />
                <TextInstrument className="mt-1 text-[10px] font-semibold tracking-wide uppercase">
                  {item.label}
                </TextInstrument>
              </ContainerInstrument>
            </Link>
          );
        })}
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
