import { ContainerInstrument } from "@/components/ui/LayoutInstruments";

export const WorkshopCardSkeleton = () => {
  return (
    <ContainerInstrument className="group relative bg-white rounded-[20px] overflow-hidden shadow-aura border border-black/[0.02] flex flex-col">
      {/* Video skeleton - aspect-video */}
      <ContainerInstrument className="relative aspect-video w-full bg-va-black/10 animate-pulse" />
      
      {/* Content skeleton - exact padding match */}
      <ContainerInstrument className="p-8 flex flex-col flex-grow">
        {/* Badge & date skeleton */}
        <ContainerInstrument className="flex justify-between items-start mb-8">
          <ContainerInstrument className="h-7 w-24 bg-va-off-white rounded-[10px] animate-pulse" />
          <ContainerInstrument className="h-5 w-32 bg-va-off-white rounded-full animate-pulse" />
        </ContainerInstrument>
        
        {/* Title skeleton */}
        <ContainerInstrument className="h-8 w-3/4 bg-va-off-white rounded-lg mb-4 animate-pulse" />
        
        {/* Description skeleton */}
        <ContainerInstrument className="space-y-2 mb-8 flex-grow">
          <ContainerInstrument className="h-4 w-full bg-va-off-white rounded-lg animate-pulse" />
          <ContainerInstrument className="h-4 w-5/6 bg-va-off-white rounded-lg animate-pulse" />
        </ContainerInstrument>
        
        {/* Footer skeleton */}
        <ContainerInstrument className="flex justify-between items-end pt-4 border-t border-black/[0.03]">
          <ContainerInstrument className="space-y-2">
            <ContainerInstrument className="h-4 w-20 bg-va-off-white rounded-full animate-pulse" />
            <ContainerInstrument className="h-8 w-24 bg-va-off-white rounded-lg animate-pulse" />
          </ContainerInstrument>
          <ContainerInstrument className="h-10 w-32 bg-va-off-white rounded-lg animate-pulse" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
