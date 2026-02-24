"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from './LayoutInstruments';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 *  NUCLEAR ERROR GUARD (2026)
 * 
 * Dit is het laatste schild tegen de "Oeps" melding.
 * Als er iets crasht, vangen we het hier op en bieden we een 
 * elegante herstelmogelijkheid zonder de gebruiker te frustreren.
 */
export class SafeErrorGuard extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(' [Nuclear Guard] Critical UI Crash caught:', error, errorInfo);
    
    // Log naar de watchdog
    fetch('/api/admin/system/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `UI Crash: ${error.message}`,
        level: 'critical',
        source: 'SafeErrorGuard',
        details: { stack: error.stack, componentStack: errorInfo.componentStack }
      })
    }).catch(() => {});
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-va-off-white flex items-center justify-center p-6">
          <ContainerInstrument className="max-w-xl w-full bg-white p-12 rounded-[32px] shadow-aura-lg border border-black/5 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-primary" size={40} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-4">
              <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter text-va-black">
                Even een momentje...
              </HeadingInstrument>
              <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed">
                De pagina ondervindt een kleine hapering. Geen zorgen, we kunnen dit direct herstellen.
              </TextInstrument>
            </div>

            <div className="pt-4">
              <ButtonInstrument 
                onClick={this.handleRetry}
                className="va-btn-pro !bg-va-black !text-white px-12 py-6 !rounded-[12px] font-light tracking-widest hover:bg-primary transition-all duration-500 flex items-center gap-3 mx-auto uppercase shadow-aura"
              >
                <RefreshCcw size={18} strokeWidth={1.5} />
                Pagina herstellen
              </ButtonInstrument>
            </div>

            <div className="pt-8 border-t border-black/[0.03]">
              <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-[0.2em]">
                Nuclear Shield Active • v2.14.351
              </TextInstrument>
            </div>
          </ContainerInstrument>
        </div>
      );
    }

    return this.props.children;
  }
}
