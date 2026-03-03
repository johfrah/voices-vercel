import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";

export default function AccountLoading() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <ContainerInstrument className="max-w-5xl mx-auto px-6 py-24 animate-pulse">
        <ContainerInstrument plain className="h-9 w-40 rounded-full bg-va-black/10" />
        <ContainerInstrument plain className="h-6 w-[40%] rounded-full bg-va-black/10 mt-4" />
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          <ContainerInstrument plain className="h-36 rounded-[20px] bg-va-black/8" />
          <ContainerInstrument plain className="h-36 rounded-[20px] bg-va-black/8" />
          <ContainerInstrument plain className="h-36 rounded-[20px] bg-va-black/8 md:col-span-2" />
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
