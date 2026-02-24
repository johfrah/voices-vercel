"use client";

import dynamic from 'next/dynamic';
import { ContainerInstrument, Loader2 } from "@/components/ui/LayoutInstruments";

//  NUCLEAR LOADING LAW: Load heavy dashboard content only on client to prevent hydration mismatch
const AdminDashboardContent = dynamic(
  () => import('@/components/admin/AdminDashboardContent'),
  { 
    ssr: false,
    loading: () => (
      <ContainerInstrument className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-va-black/40 font-light tracking-widest uppercase text-sm">Initializing Dashboard...</p>
      </ContainerInstrument>
    )
  }
);

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
