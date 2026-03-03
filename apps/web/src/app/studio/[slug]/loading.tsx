import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";

export default function StudioDetailLoading() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <ContainerInstrument className="max-w-7xl mx-auto px-6 py-24 animate-pulse">
        <ContainerInstrument plain className="h-[360px] rounded-[28px] bg-va-black/10" />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
          <ContainerInstrument plain className="h-56 rounded-[22px] bg-va-black/8 lg:col-span-2" />
          <ContainerInstrument plain className="h-56 rounded-[22px] bg-va-black/8" />
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
