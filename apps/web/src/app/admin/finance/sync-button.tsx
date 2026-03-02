'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cron/finance-sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      
      const data = await res.json();
      toast.success(`Sync compleet: ${data.synced} facturen bijgewerkt`);
      router.refresh();
    } catch (error) {
      toast.error('Fout tijdens synchronisatie');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-va-black text-white rounded-[10px] hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw strokeWidth={1.5} className="w-4 h-4" />
      )}
      Sync Yuki & Ponto
    </button>
  );
}
