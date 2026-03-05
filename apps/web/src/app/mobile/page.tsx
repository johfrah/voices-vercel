import Link from "next/link";
import { ArrowRight, LogIn, ShoppingBag, Smartphone } from "lucide-react";
import {
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";

const QUICK_FLOWS = [
  {
    title: "Bestellen op smartphone",
    subtitle: "Open de configurator en ga direct naar checkout.",
    href: "/checkout/configurator",
    icon: ShoppingBag,
  },
  {
    title: "Klant login",
    subtitle: "Magic link login voor account en orderopvolging.",
    href: "/account/login?redirect=/account/orders",
    icon: LogIn,
  },
  {
    title: "Admin login (PWA)",
    subtitle: "Gebruik deze als homescreen-link op iPhone.",
    href: "/admin-login",
    icon: Smartphone,
  },
];

export default function MobileQuickStartPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white dark:bg-va-black">
      <SectionInstrument className="px-4 py-24 max-w-xl mx-auto space-y-6">
        <ContainerInstrument className="rounded-3xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-6">
          <HeadingInstrument level={1} className="text-3xl font-light tracking-tight text-va-black dark:text-white">
            Mobile-first start
          </HeadingInstrument>
          <TextInstrument className="mt-2 text-[14px] text-va-black/60 dark:text-white/70">
            Snelle toegang tot bestel-, login- en adminflow op smartphone.
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-3">
          {QUICK_FLOWS.map((flow) => {
            const Icon = flow.icon;
            return (
              <Link key={flow.title} href={flow.href} className="block">
                <ContainerInstrument className="rounded-2xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-4 flex items-center justify-between gap-3">
                  <ContainerInstrument className="flex items-start gap-3">
                    <ContainerInstrument className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon size={17} className="text-primary" />
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <TextInstrument className="text-[15px] text-va-black dark:text-white">{flow.title}</TextInstrument>
                      <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">{flow.subtitle}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ArrowRight size={14} className="text-va-black/35 dark:text-white/50" />
                </ContainerInstrument>
              </Link>
            );
          })}
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
