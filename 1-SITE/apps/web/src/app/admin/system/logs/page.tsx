"use client";

import React, { useEffect, useState } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { AlertCircle, AlertTriangle, Info, RefreshCw, Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';

/**
 *  NUCLEAR LOG VIEWER (2026)
 *  Focus: Forensische scherpte en real-time inzicht.
 */
export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/system/logs?level=${filter}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh elke 30 seconden
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'warn':
        return <AlertTriangle className="text-amber-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <ContainerInstrument className="py-24 max-w-7xl mx-auto px-6">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-va-black rounded-xl flex items-center justify-center text-white">
              <Terminal size={20} strokeWidth={1.5} />
            </div>
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
              System <span className="text-primary italic">Logs</span>
            </HeadingInstrument>
          </div>
          <TextInstrument className="text-va-black/40 font-light tracking-widest uppercase text-[11px]">
            Forensisch overzicht van alle events en errors
          </TextInstrument>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-va-off-white p-1 rounded-xl border border-black/5">
            {['all', 'info', 'warn', 'error'].map((l) => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold tracking-widest uppercase transition-all",
                  filter === l ? "bg-white text-va-black shadow-sm" : "text-va-black/30 hover:text-va-black"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <ButtonInstrument 
            onClick={fetchLogs}
            disabled={isLoading}
            className="w-10 h-10 bg-va-black text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-all"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </ButtonInstrument>
        </div>
      </header>

      <div className="bg-white rounded-[32px] shadow-aura border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white/50 border-b border-black/5">
                <th className="px-6 py-4 text-[11px] font-bold text-va-black/40 uppercase tracking-widest w-10">Lvl</th>
                <th className="px-6 py-4 text-[11px] font-bold text-va-black/40 uppercase tracking-widest w-32">Source</th>
                <th className="px-6 py-4 text-[11px] font-bold text-va-black/40 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-[11px] font-bold text-va-black/40 uppercase tracking-widest w-48">Timestamp</th>
                <th className="px-6 py-4 text-[11px] font-bold text-va-black/40 uppercase tracking-widest w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {logs.length > 0 ? logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    className={cn(
                      "hover:bg-va-off-white/30 transition-colors cursor-pointer group",
                      expandedId === log.id && "bg-va-off-white/50"
                    )}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-6 py-4">{getLevelIcon(log.level)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-va-black/5 rounded text-[10px] font-black uppercase tracking-tighter text-va-black/40 group-hover:text-va-black transition-colors">
                        {log.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <TextInstrument className="text-[14px] font-medium text-va-black line-clamp-1">
                        {log.message}
                      </TextInstrument>
                    </td>
                    <td className="px-6 py-4">
                      <TextInstrument className="text-[12px] text-va-black/40 font-light">
                        {format(new Date(log.createdAt), 'dd MMM HH:mm:ss', { locale: nlBE })}
                      </TextInstrument>
                    </td>
                    <td className="px-6 py-4">
                      {expandedId === log.id ? <ChevronUp size={14} className="opacity-20" /> : <ChevronDown size={14} className="opacity-20" />}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={5} className="px-12 py-8 bg-va-off-white/50 border-b border-black/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest mb-3 block">Details</TextInstrument>
                            <pre className="bg-va-black text-va-off-white p-6 rounded-2xl text-[12px] font-mono overflow-x-auto shadow-aura-lg">
                              {JSON.stringify(log.details || {}, null, 2)}
                            </pre>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest mb-2 block">Full Message</TextInstrument>
                              <TextInstrument className="text-[15px] font-medium leading-relaxed">
                                {log.message}
                              </TextInstrument>
                            </div>
                            <div className="pt-4 border-t border-black/5 flex gap-4">
                              <ButtonInstrument 
                                variant="plain" 
                                className="text-[12px] font-bold text-primary hover:underline flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement repair logic or link to specific entity
                                }}
                              >
                                <RefreshCw size={14} /> Auto-Heal Triggeren
                              </ButtonInstrument>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <TextInstrument className="text-va-black/20 italic">Geen logs gevonden voor dit filter.</TextInstrument>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ContainerInstrument>
  );
}
