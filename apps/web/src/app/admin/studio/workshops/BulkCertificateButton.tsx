"use client";

import toast from 'react-hot-toast';

export default function BulkCertificateButton({ editionId }: { editionId: number }) {
  return (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/studio/edities/${editionId}/certificates`, { method: 'POST' });
          const data = await res.json();
          toast.success(`Certificaten voor ${data.processed} deelnemers worden gegenereerd... (Mock)`);
        } catch (err) {
          console.error('Bulk Cert Error:', err);
          toast.error('Fout bij genereren certificaten.');
        }
      }}
      className="w-full va-btn-pro !bg-primary/10 !text-primary hover:!bg-primary/20 !border-primary/20"
    >
      GENEREER ALLE CERTIFICATEN
    </button>
  );
}
