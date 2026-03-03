import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";

export default function StudioLoading() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <ContainerInstrument className="max-w-7xl mx-auto px-6 py-24 md:py-32 animate-pulse">
        <ContainerInstrument plain className="h-10 w-56 rounded-full bg-va-black/10" />
        <ContainerInstrument plain className="h-6 w-[46%] rounded-full bg-va-black/10 mt-4" />
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          <ContainerInstrument plain className="h-48 rounded-[24px] bg-va-black/8" />
          <ContainerInstrument plain className="h-48 rounded-[24px] bg-va-black/8" />
          <ContainerInstrument plain className="h-48 rounded-[24px] bg-va-black/8" />
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
