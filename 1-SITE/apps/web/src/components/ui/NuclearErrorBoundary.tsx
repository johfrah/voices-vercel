"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from './LayoutInstruments';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 🛡️ NUCLEAR ERROR BOUNDARY (v2.15.056)
 * 
 * De "Branddeur" van het Voices Ecosysteem. 
 * Voorkomt dat een lokale TypeError de hele pagina platlegt.
 * 
 * CHRIS-PROTOCOL:
 * - Isoleert fouten tot op component-niveau.
 * - Logt automatisch naar de console voor forensisch onderzoek.
 * - Biedt een graceful fallback voor de bezoeker.
 */
export class NuclearErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 [NuclearErrorBoundary:${this.props.name || 'Unknown'}] Error caught:`, error, errorInfo);
    
    // Hier kunnen we later een automatische melding naar de Watchdog API toevoegen
    if (typeof window !== 'undefined' && (window as any).ClientLogger) {
      (window as any).ClientLogger.error(`UI Crash in ${this.props.name || 'Unknown'}: ${error.message}`, {
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ContainerInstrument 
          plain 
          className="p-8 rounded-[24px] bg-red-50 border border-red-100 flex flex-col items-center text-center space-y-4 my-4"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <HeadingInstrument level={4} className="text-red-900 font-bold">
              Oeps, dit onderdeel hapert even
            </HeadingInstrument>
            <TextInstrument className="text-red-700/70 text-sm max-w-xs mx-auto">
              Er ging iets mis bij het laden van dit blok. De rest van de site werkt gewoon.
            </TextInstrument>
          </div>
          <ButtonInstrument 
            variant="outline" 
            size="sm" 
            onClick={this.handleReset}
            className="bg-white border-red-200 text-red-600 hover:bg-red-50"
          >
            <RefreshCw size={14} className="mr-2" />
            Opnieuw proberen
          </ButtonInstrument>
        </ContainerInstrument>
      );
    }

    return this.props.children;
  }
}
