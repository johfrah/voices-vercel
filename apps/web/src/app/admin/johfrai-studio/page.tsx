import dynamic from 'next/dynamic';

const JohfraiStudioPageContent = dynamic(() => import('./JohfraiStudioPageContent'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-va-off-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <div className="text-[11px] font-black tracking-[0.3em] uppercase text-va-black/20">Loading Studio...</div>
    </div>
  </div>
});

export default function JohfraiStudioPage() {
  return <JohfraiStudioPageContent />;
}
