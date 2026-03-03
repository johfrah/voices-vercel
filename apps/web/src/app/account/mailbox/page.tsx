"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { AlertCircle, Bell, Mail, RefreshCw } from "lucide-react";
import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  LoadingScreenInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { VoicesLink as Link } from "@/components/ui/VoicesLink";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPageClient } from "../login/LoginPageClient";

interface AccountNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  createdAt?: string;
  read?: boolean;
}

interface NotificationsResponse {
  notifications?: AccountNotification[];
  error?: string;
}

export default function AccountMailboxPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/account/notifications", { cache: "no-store" });
      const data: NotificationsResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Meldingen konden niet worden geladen.");
        setNotifications([]);
        return;
      }

      setNotifications(data.notifications || []);
    } catch {
      setErrorMessage("Verbinding mislukt. Probeer opnieuw.");
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadNotifications]);

  if (isAuthLoading || isLoading) {
    return <LoadingScreenInstrument text="Mailbox laden..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <SectionInstrument>
        <Suspense fallback={<LoadingScreenInstrument />}>
          <LoginPageClient />
        </Suspense>
      </SectionInstrument>
    );
  }

  return (
    <PageWrapperInstrument>
      <SectionInstrument className="max-w-4xl mx-auto px-6 py-20 space-y-8">
        <ContainerInstrument className="flex items-center justify-between gap-4">
          <ContainerInstrument className="space-y-2">
            <ContainerInstrument className="inline-flex items-center gap-2 text-primary">
              <Mail size={16} />
              <TextInstrument as="span" className="text-xs font-semibold tracking-[0.2em] uppercase">
                <VoiceglotText translationKey="account.mailbox.badge" defaultText="Mailbox" />
              </TextInstrument>
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tight">
              <VoiceglotText translationKey="account.mailbox.title" defaultText="Jouw berichten" />
            </HeadingInstrument>
          </ContainerInstrument>

          <ButtonInstrument
            onClick={loadNotifications}
            className="va-btn-pro !bg-va-off-white !text-va-black/70 hover:!text-va-black border border-black/[0.05] flex items-center gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <VoiceglotText translationKey="common.refresh" defaultText="Vernieuwen" />
          </ButtonInstrument>
        </ContainerInstrument>

        {errorMessage && (
          <ContainerInstrument className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
            <AlertCircle size={18} className="mt-0.5" />
            <TextInstrument>
              <VoiceglotText translationKey="account.mailbox.error" defaultText={errorMessage} noTranslate={true} />
            </TextInstrument>
          </ContainerInstrument>
        )}

        {notifications.length === 0 ? (
          <ContainerInstrument className="p-10 rounded-3xl border border-black/[0.05] bg-white space-y-4 text-center">
            <ContainerInstrument className="mx-auto w-14 h-14 rounded-full bg-va-off-white flex items-center justify-center text-va-black/25">
              <Bell size={22} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
              <VoiceglotText translationKey="account.mailbox.empty_title" defaultText="Nog geen berichten" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/50">
              <VoiceglotText
                translationKey="account.mailbox.empty_text"
                defaultText="Zodra er updates zijn over je projecten, zie je ze hier."
              />
            </TextInstrument>
          </ContainerInstrument>
        ) : (
          <ContainerInstrument className="space-y-4">
            {notifications.map((notification) => (
              <ContainerInstrument
                key={notification.id}
                className="p-6 rounded-2xl border border-black/[0.04] bg-white shadow-sm space-y-2"
              >
                <ContainerInstrument className="flex items-center justify-between gap-3">
                  <TextInstrument className="font-medium text-va-black">
                    <VoiceglotText
                      translationKey={`account.notification.${notification.id}.title`}
                      defaultText={notification.title}
                      noTranslate={true}
                    />
                  </TextInstrument>
                  {notification.read === false && (
                    <TextInstrument as="span" className="text-[10px] tracking-[0.15em] uppercase text-primary font-semibold">
                      <VoiceglotText translationKey="common.new" defaultText="Nieuw" />
                    </TextInstrument>
                  )}
                </ContainerInstrument>

                <TextInstrument className="text-sm text-va-black/60 leading-relaxed">
                  <VoiceglotText
                    translationKey={`account.notification.${notification.id}.message`}
                    defaultText={notification.message}
                    noTranslate={true}
                  />
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        )}

        <ContainerInstrument className="flex flex-wrap gap-3 pt-2">
          <ButtonInstrument as={Link} href="/account" variant="outline">
            <VoiceglotText translationKey="account.mailbox.back_dashboard" defaultText="Terug naar dashboard" />
          </ButtonInstrument>
          <ButtonInstrument as={Link} href="/agency/contact" className="va-btn-pro">
            <VoiceglotText translationKey="account.mailbox.need_help" defaultText="Hulp nodig? Contacteer ons" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
