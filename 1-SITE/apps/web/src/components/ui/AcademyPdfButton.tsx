"use client";

import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';

interface AcademyPdfButtonProps {
  lessonTitle: string;
  contentSelector: string;
  fileName?: string;
}

export const AcademyPdfButton: React.FC<AcademyPdfButtonProps> = ({ 
  lessonTitle, 
  contentSelector,
  fileName = "Voices-Academy-Les.pdf"
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const handleDownload = async () => {
    const element = document.querySelector(contentSelector) as HTMLElement;
    if (!element) return;

    setIsGenerating(true);
    try {
      // Create a clone of the element to avoid messing with the original UI
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.padding = '40px';
      clone.style.background = 'white';
      clone.style.color = 'black';
      clone.style.width = '800px';
      // Remove any elements we don't want in the PDF (like tooltips or buttons)
      clone.querySelectorAll('.no-pdf').forEach(el => el.remove());
      
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isGenerating ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileText size={14} />
      )}
      <VoiceglotText 
        translationKey="academy.lesson.download_pdf" 
        defaultText={isGenerating ? "Genereren..." : "Download Les PDF"} 
      />
    </button>
  );
};
