import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";

export default function DynamicRouteLoading() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <ContainerInstrument className="max-w-6xl mx-auto px-6 py-24 md:py-32 animate-pulse">
        <ContainerInstrument plain className="h-9 w-44 rounded-full bg-va-black/10" />
        <ContainerInstrument plain className="h-14 w-[74%] rounded-full bg-va-black/10 mt-8" />
        <ContainerInstrument plain className="h-6 w-[52%] rounded-full bg-va-black/10 mt-4" />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
          <ContainerInstrument plain className="h-44 lg:col-span-2 rounded-[22px] bg-va-black/8" />
          <ContainerInstrument plain className="h-44 rounded-[22px] bg-va-black/8" />
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
