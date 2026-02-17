"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Command } from 'cmdk';
import {
    Activity,
    Brain,
    Camera,
    Globe,
    History,
    Layers,
    LayoutDashboard,
    Mail,
    Menu,
    Mic,
    Music,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { VoiceglotText } from './VoiceglotText';

/**
 *  COMMAND PALETTE (GOD MODE 2026)
 * 
 * Een centrale hub voor razendsnelle navigatie en acties.
 * Genspireerd op Raycast en Linear.
 */
export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  //  CMD+K SHORTCUT
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        // BOB'S MANDATE: CommandPalette is gedeactiveerd voor admins ten gunste van SpotlightDashboard
        if (isAdmin) return;
        
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

  const runAgent = async (agent: string) => {
    setOpen(false);
    const toastId = toast.loading(`Agent ${agent.toUpperCase()} wordt gestart...`);
    
    try {
      const res = await fetch('/api/admin/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Agent ${agent.toUpperCase()} klaar!`, { id: toastId });
        console.log(data.logs);
      } else {
        toast.error(`Agent ${agent.toUpperCase()} faalde: ${data.error}`, { id: toastId });
      }
    } catch (e) {
      toast.error('Kon agent niet starten.', { id: toastId });
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-va-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-6 py-4 border-b border-gray-50">
          <Search strokeWidth={1.5} className="w-5 h-5 text-gray-400 mr-3" />
          <Command.Input
            placeholder="Zoek een actie, pagina of klant..."
            className="flex-grow bg-transparent border-none outline-none text-lg font-medium text-va-black placeholder:text-gray-300"
          />
          <div className="flex items-center gap-1.5 ml-4">
            <span className="px-1.5 py-1 bg-gray-100 text-gray-400 rounded text-[15px] font-black">ESC</span>
          </div>
        </div>

        <Command.List className="max-h-[450px] overflow-y-auto p-3 space-y-2">
          <Command.Empty className="py-12 text-center text-gray-400 font-medium">
            <VoiceglotText  translationKey="command.palette.empty" defaultText="Geen resultaten gevonden voor deze zoekopdracht." />
          </Command.Empty>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.agents" defaultText="Agents (AI)" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/agents'))}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-primary/20 bg-primary/5 flex items-center justify-center">
                <Brain strokeWidth={1.5} size={14} className="text-primary" />
              </div>
              <span className="font-bold text-primary"><VoiceglotText  translationKey="nav.agent_center" defaultText="Open Agent Command Center" /></span>
              <Shortcut>G C</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('bob')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/bob-avatar-voicy.png" alt="Bob" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.bob" defaultText="Start Bob (Live Concert)" /></span>
              <Shortcut>B</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('mark')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/mark-avatar-voicy.png" alt="Mark" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.mark" defaultText="Mark: Voiceglot Surgeon" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('chris')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/chris-avatar-voicy.png" alt="Chris" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.chris" defaultText="Chris: Watchdog Audit" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('anna')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/anna-avatar-voicy.png" alt="Anna" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.anna" defaultText="Anna: Stability Check" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('laya')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/laya-avatar-voicy.png" alt="Laya" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.laya" defaultText="Laya: Aesthetic Guard" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('moby')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/moby-avatar-voicy.png" alt="Moby" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.moby" defaultText="Moby: Mobile-First Regie" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('suzy')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/suzy-avatar-voicy.png" alt="Suzy" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.suzy" defaultText="Suzy: SEO & LLM Schema" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('felix')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/felix-avatar-voicy.png" alt="Felix" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.felix" defaultText="Felix: Nood Deep Clean" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runAgent('sherlock')}>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden border border-gray-100 group-aria-selected:border-white/20">
                <Image  src="/assets/sherlock-avatar-voicy.png" alt="Sherlock" width={24} height={24} className="object-cover" />
              </div>
              <span><VoiceglotText  translationKey="agent.sherlock" defaultText="Sherlock: Trend Detective" /></span>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.nav" defaultText="Navigatie" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/dashboard'))}>
              <LayoutDashboard strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.cockpit.title" defaultText="Voices Cockpit" /></span>
              <Shortcut>G D</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/backoffice/dashboard'))}>
              <TrendingUp strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.bi.title" defaultText="Het Overzicht (BI)" /></span>
              <Shortcut>G O</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/mailbox'))}>
              <Mail strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="common.mailbox" defaultText="Mailbox" /></span>
              <Shortcut>G M</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/assignments'))}>
              <History strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="common.assignments" defaultText="Assignments" /></span>
              <Shortcut>G A</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/vault'))}>
              <ShieldCheck strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="common.vault" defaultText="The Vault" /></span>
              <Shortcut>G V</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.mgmt" defaultText="Beheer" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/voices'))}>
              <Mic strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.voices.title" defaultText="Voices Manager" /></span>
              <Shortcut>G S</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/pages'))}>
              <Layers strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.pages.title" defaultText="Pages & Layouts" /></span>
              <Shortcut>G P</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/navigation'))}>
              <Menu strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.navigation.title" defaultText="Navigatie & Header" /></span>
              <Shortcut>G N</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/studio'))}>
              <Music strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.studio.title" defaultText="Studio & Workshops" /></span>
              <Shortcut>G W</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/studio?action=edit'))}>
              <Settings strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.studio.edit_mode" defaultText="Workshop Beheer (Snel)" /></span>
              <Shortcut>E W</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/backoffice/media'))}>
              <Plus strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.media.title" defaultText="Media Manager" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/photo-matcher'))}>
              <Camera strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.photo_matcher.title" defaultText="Photo Matcher" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/voiceglot'))}>
              <Globe strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.voiceglot.title" defaultText="Voiceglot Intelligence" /></span>
              <Shortcut>G L</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/vibecode'))}>
              <Zap strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.vibecode.title" defaultText="Cody Engine" /></span>
              <Shortcut>G B</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/security'))}>
              <ShieldCheck strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.security.title" defaultText="Security Center" /></span>
              <Shortcut>G S</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.studio" defaultText="Studio Specifiek" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/studio/kalender'))}>
              <History strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.studio.calendar" defaultText="Studio Kalender" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/studio/participants'))}>
              <Users strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.studio.participants" defaultText="Deelnemers Overzicht" /></span>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.system" defaultText="Systeem" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/account/partner'))}>
              <TrendingUp strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.partner.title" defaultText="Partner Dashboard" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.settings.title" defaultText="Systeem Instellingen" /></span>
              <Shortcut>G ,</Shortcut>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.actions" defaultText="Acties" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            {pathname?.startsWith('/studio/') && !pathname.includes('/dashboard') && (
              <Item strokeWidth={1.5} onSelect={() => runCommand(() => {
                const slug = pathname.split('/').pop();
                router.push(`/admin/studio?slug=${slug}`);
              })}>
                <Settings strokeWidth={1.5} className="w-4 h-4 mr-3 text-primary" />
                <span className="font-bold text-primary"><VoiceglotText  translationKey="admin.studio.edit_this" defaultText="Deze Workshop Bewerken" /></span>
                <Shortcut>E T</Shortcut>
              </Item>
            )}
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => {
              toast.success('Nieuw bericht venster geopend');
              // Trigger compose logic via event of state
            })}>
              <Plus strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="mailbox.compose.new" defaultText="Nieuw Bericht opstellen" /></span>
              <Shortcut>C</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => {
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 2000)),
                {
                  loading: 'AI Brain Sync wordt gestart...',
                  success: 'Sync voltooid!',
                  error: 'Sync mislukt.',
                }
              );
            })}>
              <Brain strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.sync.brain" defaultText="Start AI Brain Sync" /></span>
              <Shortcut>S</Shortcut>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="common.settings" defaultText="Instellingen" /></span>
            </Item>
          </Command.Group>

          <Command.Group heading={<VoiceglotText  translationKey="command.palette.group.intelligence" defaultText="Intelligence" />} className="px-3 py-2 text-[15px] font-black tracking-widest text-gray-400 mt-4">
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/mailbox?tab=insights'))}>
              <TrendingUp strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.insights.title" defaultText="Trends & SWOT Analyse" /></span>
            </Item>
            <Item strokeWidth={1.5} onSelect={() => runCommand(() => router.push('/admin/mailbox?tab=faq'))}>
              <Brain strokeWidth={1.5} className="w-4 h-4 mr-3" />
              <span><VoiceglotText  translationKey="admin.faq.proposals" defaultText="FAQ Proposals bekijken" /></span>
            </Item>
          </Command.Group>
        </Command.List>

        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[15px] font-bold shadow-sm"></span>
              <span className="text-[15px] text-gray-400 font-medium">
                <VoiceglotText  translationKey="command.palette.hint.navigate" defaultText="Navigeren" />
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[15px] font-bold shadow-sm"><VoiceglotText  translationKey="auto.commandpalette.enter.331b31" defaultText="ENTER" /></span>
              <span className="text-[15px] text-gray-400 font-medium">
                <VoiceglotText  translationKey="command.palette.hint.select" defaultText="Selecteren" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-gray-300 font-black tracking-tighter italic"><VoiceglotText  translationKey="auto.commandpalette.voices_os_v2_6.9e2ba2" defaultText="Voices OS v2.6" /></span>
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
    <span className="text-[15px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded group-aria-selected:bg-white/20 group-aria-selected:text-white transition-colors">
      {children}
    </span>
  </div>
);
