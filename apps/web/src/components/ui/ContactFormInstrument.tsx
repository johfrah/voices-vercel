"use client";

import {
  ButtonInstrument,
  ContainerInstrument,
  FormInstrument,
  InputInstrument,
  LabelInstrument,
  TextInstrument,
  TextareaInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { Mail, Send } from "lucide-react";
import { FormEvent, useState } from "react";

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_STATE: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

export function ContactFormInstrument() {
  const { playClick } = useSonicDNA();
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    playClick("light");
    setIsSubmitting(true);
    setStatus("idle");
    setErrorText("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Versturen mislukt");
      }

      setStatus("success");
      setForm(INITIAL_STATE);
    } catch (error) {
      setStatus("error");
      setErrorText(error instanceof Error ? error.message : "Er ging iets mis.");
      playClick("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContainerInstrument className="space-y-6">
      <ContainerInstrument className="flex items-center gap-3">
        <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center">
          <Mail size={18} strokeWidth={1.5} />
        </ContainerInstrument>
        <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/40">
          <VoiceglotText translationKey="contact.form.label" defaultText="Contactformulier" />
        </TextInstrument>
      </ContainerInstrument>

      <FormInstrument className="space-y-5" onSubmit={handleSubmit}>
        <ContainerInstrument className="space-y-2">
          <LabelInstrument className="text-[13px] font-medium tracking-wider text-va-black/50">
            <VoiceglotText translationKey="contact.form.name" defaultText="Naam" />
          </LabelInstrument>
          <InputInstrument
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Jouw naam"
            autoComplete="name"
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-2">
          <LabelInstrument className="text-[13px] font-medium tracking-wider text-va-black/50">
            <VoiceglotText translationKey="contact.form.email" defaultText="E-mail" />
          </LabelInstrument>
          <InputInstrument
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="naam@bedrijf.be"
            autoComplete="email"
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-2">
          <LabelInstrument className="text-[13px] font-medium tracking-wider text-va-black/50">
            <VoiceglotText translationKey="contact.form.subject" defaultText="Onderwerp" />
          </LabelInstrument>
          <InputInstrument
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            placeholder="Waarover gaat je vraag?"
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-2">
          <LabelInstrument className="text-[13px] font-medium tracking-wider text-va-black/50">
            <VoiceglotText translationKey="contact.form.message" defaultText="Bericht" />
          </LabelInstrument>
          <TextareaInstrument
            required
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            placeholder="Vertel kort waarmee we je kunnen helpen..."
          />
        </ContainerInstrument>

        {status === "success" && (
          <ContainerInstrument className="rounded-[10px] bg-green-500/10 border border-green-500/20 p-4">
            <TextInstrument className="text-green-700 text-[13px] font-medium">
              <VoiceglotText
                translationKey="contact.form.success"
                defaultText="Top, je bericht is ontvangen. We reageren zo snel mogelijk."
              />
            </TextInstrument>
          </ContainerInstrument>
        )}

        {status === "error" && (
          <ContainerInstrument className="rounded-[10px] bg-red-500/10 border border-red-500/20 p-4">
            <TextInstrument className="text-red-700 text-[13px] font-medium">
              {errorText}
            </TextInstrument>
          </ContainerInstrument>
        )}

        <ButtonInstrument
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-va-black text-white hover:bg-primary transition-all rounded-[10px] py-4 text-[13px] font-semibold tracking-[0.18em] uppercase flex items-center justify-center gap-3 disabled:opacity-60"
        >
          <VoiceglotText translationKey="contact.form.submit" defaultText={isSubmitting ? "Verzenden..." : "Verstuur bericht"} />
          <Send size={14} strokeWidth={1.5} />
        </ButtonInstrument>
      </FormInstrument>
    </ContainerInstrument>
  );
}
