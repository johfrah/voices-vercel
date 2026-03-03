import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";

export default function AdminLoading() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <ContainerInstrument className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
        <ContainerInstrument plain className="h-8 w-52 rounded-full bg-va-black/10" />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-8">
          <ContainerInstrument plain className="h-96 rounded-[20px] bg-va-black/8 lg:col-span-1" />
          <ContainerInstrument plain className="h-96 rounded-[20px] bg-va-black/8 lg:col-span-3" />
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
