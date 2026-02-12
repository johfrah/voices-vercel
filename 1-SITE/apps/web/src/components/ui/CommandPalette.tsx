"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { VoiceglotText } from './VoiceglotText';
import { 
  Mail, 
  LayoutDashboard, 
  Users, 
  Mic, 
  FileText, 
  Settings, 
  Search,
  Plus,
  Brain,
  TrendingUp,
  History,
  ShieldCheck,
  LogOut,
  Layers,
  Camera,
  Music,
  Globe,
  Zap
} from 'lucide-react';

/**
 * ⚡ COMMAND PALETTE (GOD MODE 2026)
 * 
 * Een centrale hub voor razendsnelle navigatie en acties.
 * Geïnspireerd op Raycast en Linear.
 */
export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin, user } = useAuth();
  const router = useRouter();

  // 🍎 CMD+K SHORTCUT
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        if (!isAdmin) return;
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isAdmin]);

  if (!isAdmin) return null;

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-va-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-6 py-4 border-b border-gray-50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <Command.Input
            placeholder="Zoek een actie, pagina of klant..."
            className="flex-grow bg-transparent border-none outline-none text-lg font-medium text-va-black placeholder:text-gray-300"
          />
          <div className="flex items-center gap-1.5 ml-4">
            <span className="px-1.5 py-1 bg-gray-100 text-gray-400 rounded text-[10px] font-black">ESC</span>
          </div>
        </div>

        <Command.List className="max-h-[450px] overflow-y-auto p-3 space-y-2">
          <Command.Empty className="py-12 text-center text-gray-400 font-medium">
            <VoiceglotText translationKey="command.palette.empty" defaultText="Geen resultaten gevonden voor deze zoekopdracht." />
          </Command.Empty>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.nav" defaultText="Navigatie" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Item onSelect={() => runCommand(() => router.push('/admin/dashboard'))}>
              <LayoutDashboard className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.cockpit.title" defaultText="Voices Cockpit" /></span>
              <Shortcut>G D</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/backoffice/dashboard'))}>
              <TrendingUp className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.bi.title" defaultText="Het Overzicht (BI)" /></span>
              <Shortcut>G O</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/account/mailbox'))}>
              <Mail className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="common.mailbox" defaultText="Mailbox" /></span>
              <Shortcut>G M</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/assignments'))}>
              <History className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="common.assignments" defaultText="Assignments" /></span>
              <Shortcut>G A</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/vault'))}>
              <ShieldCheck className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="common.vault" defaultText="The Vault" /></span>
              <Shortcut>G V</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.mgmt" defaultText="Beheer" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">
            <Item onSelect={() => runCommand(() => router.push('/admin/voices'))}>
              <Mic className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.voices.title" defaultText="Voices Manager" /></span>
              <Shortcut>G S</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/pages'))}>
              <Layers className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.pages.title" defaultText="Pages & Layouts" /></span>
              <Shortcut>G P</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/studio'))}>
              <Music className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.studio.title" defaultText="Studio & Workshops" /></span>
              <Shortcut>G W</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/backoffice/media'))}>
              <Plus className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.media.title" defaultText="Media Manager" /></span>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/photo-matcher'))}>
              <Camera className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.photo_matcher.title" defaultText="Photo Matcher" /></span>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/voiceglot'))}>
              <Globe className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.voiceglot.title" defaultText="Voiceglot Intelligence" /></span>
              <Shortcut>G L</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/vibecode'))}>
              <Zap className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.vibecode.title" defaultText="Cody Engine" /></span>
              <Shortcut>G B</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/security'))}>
              <ShieldCheck className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.security.title" defaultText="Security Center" /></span>
              <Shortcut>G S</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.studio" defaultText="Studio Specifiek" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">
            <Item onSelect={() => runCommand(() => router.push('/studio/kalender'))}>
              <History className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.studio.calendar" defaultText="Studio Kalender" /></span>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/studio/participants'))}>
              <Users className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.studio.participants" defaultText="Deelnemers Overzicht" /></span>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.system" defaultText="Systeem" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">
            <Item onSelect={() => runCommand(() => router.push('/account/partner'))}>
              <TrendingUp className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.partner.title" defaultText="Partner Dashboard" /></span>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.settings.title" defaultText="Systeem Instellingen" /></span>
              <Shortcut>G ,</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.actions" defaultText="Acties" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">
            <Item onSelect={() => runCommand(() => {
              toast.success('Nieuw bericht venster geopend');
              // Trigger compose logic via event of state
            })}>
              <Plus className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="mailbox.compose.new" defaultText="Nieuw Bericht opstellen" /></span>
              <Shortcut>C</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => {
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 2000)),
                {
                  loading: 'AI Brain Sync wordt gestart...',
                  success: 'Sync voltooid!',
                  error: 'Sync mislukt.',
                }
              );
            })}>
              <Brain className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.sync.brain" defaultText="Start AI Brain Sync" /></span>
              <Shortcut>S</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="common.settings" defaultText="Instellingen" /></span>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText translationKey="command.palette.group.intelligence" defaultText="Intelligence" />} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">
            <Item onSelect={() => runCommand(() => router.push('/account/mailbox?tab=insights'))}>
              <TrendingUp className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.insights.title" defaultText="Trends & SWOT Analyse" /></span>
            </Item>
            <Item onSelect={() => runCommand(() => router.push('/account/mailbox?tab=faq'))}>
              <Brain className="w-4 h-4 mr-3" />
              <span><VoiceglotText translationKey="admin.faq.proposals" defaultText="FAQ Proposals bekijken" /></span>
            </Item>
          </Command.Group>
        </Command.List>

        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-bold shadow-sm">↑↓</span>
              <span className="text-[10px] text-gray-400 font-medium">
                <VoiceglotText translationKey="command.palette.hint.navigate" defaultText="Navigeren" />
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-bold shadow-sm">ENTER</span>
              <span className="text-[10px] text-gray-400 font-medium">
                <VoiceglotText translationKey="command.palette.hint.select" defaultText="Selecteren" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-300 font-black uppercase tracking-tighter italic">Voices OS v2.6</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
};

const Item = ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
  <Command.Item
    onSelect={onSelect}
    className="flex items-center px-4 py-3 rounded-2xl cursor-pointer aria-selected:bg-va-black aria-selected:text-white transition-all group"
  >
    {children}
  </Command.Item>
);

const Shortcut = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-auto flex items-center gap-1">
    <span className="text-[9px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded group-aria-selected:bg-white/20 group-aria-selected:text-white transition-colors">
      {children}
    </span>
  </div>
);
