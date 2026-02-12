import { useSonicDNA } from '@/components/ui/SonicDNA';
import { useEffect, useState } from 'react';
import { BentoCard, BentoGrid } from '../ui/BentoGrid';
import { VoiceglotText } from '../ui/VoiceglotText';

/**
 * 🛡️ HUMAN-IN-THE-LOOP: EMAIL APPROVAL DASHBOARD
 * 
 * "Nooit mails vanuit het systeem zonder human in de loop."
 */

export const EmailApprovalDashboard = () => {
  const [pendingEmails, setPendingEmails] = useState<any[]>([]);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v2/approval/pending');
        const data = await res.json();
        setPendingEmails(data);
      } catch (error) {
        console.error('Failed to fetch pending emails:', error);
      }
    };
    
    fetchPending();
    const interval = setInterval(fetchPending, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v2/approval/approve/${id}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        setPendingEmails(prev => prev.filter(e => e.id !== id));
        playClick('success');
      }
    } catch (error) {
      console.error('Approval failed:', error);
      playClick('error');
    }
  };

  const handleReject = async (id: number) => {
    // In a real system, we'd have a delete/reject endpoint
    setPendingEmails(prev => prev.filter(e => e.id !== id));
    playClick('error');
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-black mb-8 tracking-tighter">
        <VoiceglotText translationKey="admin.approval.title" defaultText="NUCLEAR APPROVAL CENTER" />
      </h1>

      <BentoGrid>
        {pendingEmails.map(email => (
          <BentoCard key={email.id} title={email.subject}>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-2">Aan: {email.to}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Template: {email.template}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(email.id)}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
                >
                  GOEDGEKEURD
                </button>
                <button 
                  onClick={() => playClick('pro')}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition-colors"
                >
                  BEWERK
                </button>
                <button 
                  onClick={() => handleReject(email.id)}
                  className="px-4 py-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded-lg font-bold transition-colors"
                >
                  X
                </button>
              </div>

              {/* 🧠 Feedback Loop UI */}
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                {email.isValueSensitive && (
                  <div className="p-2 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] font-black text-red-500 animate-pulse">☢️ WAARDE-ALARM:</span>
                    <span className="text-[9px] text-red-200 uppercase font-bold">Korting gedetecteerd - Strikte HITL vereist</span>
                  </div>
                )}
                {email.isBrandSensitive && (
                  <div className="p-2 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-500">💎 FAME-ALARM:</span>
                    <span className="text-[9px] text-amber-200 uppercase font-bold">Topmerk gedetecteerd - Kwaliteitsbewaking</span>
                  </div>
                )}
                
                <textarea 
                  placeholder="Waarom pas je dit aan? (bijv: 'Te informeel' of 'Uitzondering: klant is op vakantie')"
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-primary transition-colors"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`pattern-${email.id}`} className="accent-primary" />
                  <label htmlFor={`pattern-${email.id}`} className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                    Dit is een nieuw patroon (onthoud dit)
                  </label>
                </div>
              </div>
            </div>
          </BentoCard>
        ))}

        {pendingEmails.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Geen wachtende e-mails. Alles is clean. ☢️</p>
          </div>
        )}
      </BentoGrid>
    </div>
  );
};
