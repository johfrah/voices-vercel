"use client";

import { FileText } from "lucide-react";

export function CertificateDownloadButton({
  orderItemId,
  participantName,
}: {
  orderItemId: number;
  participantName: string;
}) {
  return (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/studio/certificates/${orderItemId}?download=true`);
          const json = await res.json();
          if (json.data) {
            const params = new URLSearchParams({
              name: json.data.participantName,
              workshop: json.data.workshopTitle,
              instructor: json.data.instructorName,
              date: new Date(json.data.date).toISOString().split("T")[0],
              orderId: json.data.orderId.toString(),
            });
            window.open(`/api/certificates/render?${params.toString()}`, "_blank");
          }
        } catch (err) {
          console.error("Cert Error:", err);
        }
      }}
      className="p-2 hover:bg-black/5 rounded-lg transition-colors group/cert"
      title={`Download Certificaat ${participantName}`}
    >
      <FileText size={16} className="text-black/20 group-hover/cert:text-primary transition-colors" />
    </button>
  );
}

export function BulkCertificateButton({ editionId }: { editionId: number }) {
  return (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/studio/edities/${editionId}/certificates`, { method: "POST" });
          const data = await res.json();
          alert(`Certificaten voor ${data.processed} deelnemers worden gegenereerd... (Mock)`);
        } catch (err) {
          console.error("Bulk Cert Error:", err);
        }
      }}
      className="w-full va-btn-pro !bg-primary/10 !text-primary hover:!bg-primary/20 !border-primary/20"
    >
      GENEREER ALLE CERTIFICATEN
    </button>
  );
}
