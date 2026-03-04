"use client";

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

/**
 *  VOICES CONFIRM MODAL (2026) – "VoicesModal"
 *
 * Bevestigingsmodal zodat je niet zomaar iets doet: toon melding, vraag bevestiging,
 * dan pas de actie. Vervangt browser confirm() met een consistente Voices-UI.
 * Gebruik useVoicesConfirm() om te openen.
 */

export interface VoicesConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Rode/destructieve actie (bv. verwijderen) */
  danger?: boolean;
}

interface VoicesConfirmState extends VoicesConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const defaultState: VoicesConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Bevestigen',
  cancelLabel: 'Annuleren',
  danger: false,
  onConfirm: () => {},
  onCancel: () => {},
};

const VoicesModalContext = React.createContext<{
  confirm: (options: VoicesConfirmOptions) => Promise<boolean>;
} | null>(null);

export function useVoicesConfirm() {
  const ctx = React.useContext(VoicesModalContext);
  if (!ctx) throw new Error('useVoicesConfirm must be used within VoicesModalProvider');
  return ctx;
}

export function VoicesModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VoicesConfirmState>(defaultState);
  const resolveRef = React.useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((options: VoicesConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        ...options,
        confirmLabel: options.confirmLabel ?? 'Bevestigen',
        cancelLabel: options.cancelLabel ?? 'Annuleren',
        danger: options.danger ?? false,
        onConfirm: () => {
          setState((s) => ({ ...s, isOpen: false }));
          resolveRef.current(true);
        },
        onCancel: () => {
          setState((s) => ({ ...s, isOpen: false }));
          resolveRef.current(false);
        },
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm();
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    state.onCancel();
  }, [state.onCancel]);

  return (
    <VoicesModalContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && (
          <VoicesConfirmModal
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            danger={state.danger}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </VoicesModalContext.Provider>
  );
}

interface VoicesConfirmModalProps extends VoicesConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

function VoicesConfirmModal({
  title,
  message,
  confirmLabel = 'Bevestigen',
  cancelLabel = 'Annuleren',
  danger = false,
  onConfirm,
  onCancel,
}: VoicesConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-xl"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'tween', duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-[24px] shadow-aura overflow-hidden relative z-[10001]"
        onClick={(e) => e.stopPropagation()}
      >
        <ContainerInstrument className="p-8 space-y-6">
          <ContainerInstrument className="flex items-start gap-4">
            <ContainerInstrument
              className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${danger ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'}`}
            >
              <AlertTriangle strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument className="flex-1 min-w-0">
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black mb-2">
                {title}
              </HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/60 font-light leading-relaxed">
                {message}
              </TextInstrument>
            </ContainerInstrument>
            <button
              type="button"
              onClick={onCancel}
              className="flex-shrink-0 p-2 rounded-xl text-va-black/30 hover:text-va-black hover:bg-va-black/5 transition-colors"
              aria-label="Sluiten"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </ContainerInstrument>
          <ContainerInstrument className="flex gap-3 justify-end pt-2">
            <ButtonInstrument
              onClick={onCancel}
              className="!bg-va-black/5 !text-va-black px-6 py-3 rounded-[12px] text-[15px] font-light tracking-widest hover:!bg-va-black/10 transition-colors"
            >
              {cancelLabel}
            </ButtonInstrument>
            <ButtonInstrument
              onClick={onConfirm}
              className={danger ? '!bg-red-500 !text-white px-6 py-3 rounded-[12px] text-[15px] font-light tracking-widest hover:!bg-red-600 transition-colors' : 'va-btn-pro !bg-primary text-white px-6 py-3 rounded-[12px] text-[15px] font-light tracking-widest'}
            >
              {confirmLabel}
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </motion.div>
    </motion.div>
  );
}

/** Alias: de naam die je je herinnerde. */
export { VoicesConfirmModal as VoicesModal };
