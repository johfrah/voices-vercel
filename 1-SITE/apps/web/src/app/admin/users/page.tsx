"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Edit3, Loader2, Mail, MoreHorizontal, Search as SearchIcon, Shield, UserPlus, Users, RefreshCw, Ghost } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN USERS (NUCLEAR 2026)
 * 
 * "Beheer van de Freedom Machine community."
 */
export default function AdminUsersPage() {
  const { logAction } = useAdminTracking();
  const { impersonate } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return <ContainerInstrument className="p-20 text-center">Skipping users render during build...</ContainerInstrument>;
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter "><VoiceglotText  translationKey="admin.users.title" defaultText="User DNA" /></HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <ContainerInstrument className="relative group">
            <SearchIcon strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Zoek op naam of email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-black/5 rounded-[10px] text-[15px] font-light focus:outline-none focus:border-primary focus:shadow-aura transition-all w-[300px]"
            />
          </ContainerInstrument>
          <ButtonInstrument onClick={() => {
            logAction('users_create_new');
            //  CHRIS-PROTOCOL: Open User Creation Modal
            window.dispatchEvent(new CustomEvent('admin:user:create'));
          }} className="va-btn-pro !bg-va-black flex items-center gap-2">
            <UserPlus strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="admin.users.add" defaultText="Nieuwe Gebruiker" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Stats */}
      <BentoGrid strokeWidth={1.5} columns={4}>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2 rounded-[20px]">
          <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.totaal_gebruikers.cf0db8" defaultText="Totaal Gebruikers" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">{users.length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2 rounded-[20px]">
          <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.nieuw__30d_.65173a" defaultText="Nieuw (30d)" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-primary">+{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2 rounded-[20px]">
          <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.admins.3124e6" defaultText="Admins" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-va-black">{users.filter(u => u.role === 'admin').length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2 rounded-[20px]">
          <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.actieve_sessies.5fbd8f" defaultText="Actieve Sessies" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-green-500">24</HeadingInstrument>
        </BentoCard>
      </BentoGrid>

      {/* User Table */}
      <ContainerInstrument className="bg-white border border-black/5 rounded-[20px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-va-off-white/50 border-b border-black/5">
              <th className="p-6 text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.gebruiker.460471" defaultText="Gebruiker" /></th>
              <th className="p-6 text-[15px] font-light tracking-widest text-va-black/30">Rol</th>
              <th className="p-6 text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.status.ec53a8" defaultText="Status" /></th>
              <th className="p-6 text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.laatst_actief.81b333" defaultText="Laatst Actief" /></th>
              <th className="p-6 text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.acties.691fa4" defaultText="Acties" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-black/5 hover:bg-va-off-white/20 transition-colors group">
                <td className="p-6">
                  <ContainerInstrument className="flex items-center gap-4">
                    <ContainerInstrument className="w-10 h-10 bg-va-off-white rounded-full flex items-center justify-center font-light text-va-black/20 ">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <TextInstrument className="font-light text-va-black tracking-tight">{user.name || 'Onbekend'}</TextInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40 font-light">{user.email}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </td>
                <td className="p-6">
                  <ContainerInstrument className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[15px] font-light tracking-widest ${
                    user.role === 'admin' ? 'bg-va-black text-white' : 'bg-va-off-white text-va-black/40'
                  }`}>
                    {user.role === 'admin' ? <Shield strokeWidth={1.5} size={10} /> : <Users strokeWidth={1.5} size={10} />}
                    {user.role}
                  </ContainerInstrument>
                </td>
                <td className="p-6">
                  <ContainerInstrument className="flex items-center gap-2">
                    <ContainerInstrument className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <TextInstrument className="text-[15px] font-light tracking-widest"><VoiceglotText  translationKey="auto.page.actief.63cc56" defaultText="Actief" /></TextInstrument>
                  </ContainerInstrument>
                </td>
                <td className="p-6">
                  <TextInstrument className="text-[15px] font-light text-va-black/40">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('nl-BE') : 'Nooit'}
                  </TextInstrument>
                </td>
                <td className="p-6">
                  <ContainerInstrument className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={async () => {
                        logAction('users_impersonate', { userId: user.id });
                        const res = await impersonate(user.id);
                        if (!res.success) toast.error(res.error || 'Ghost Mode mislukt');
                      }} 
                      className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/40 hover:text-primary"
                      title="Ghost Mode: Inloggen als deze gebruiker"
                    >
                      <Ghost strokeWidth={1.5} size={14} />
                    </button>
                    <button onClick={() => logAction('users_edit', { userId: user.id })} className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/40 hover:text-primary">
                      <Edit3 strokeWidth={1.5} size={14} />
                    </button>
                    <button onClick={() => logAction('users_mail', { userId: user.id })} className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/40 hover:text-primary">
                      <Mail strokeWidth={1.5} size={14} />
                    </button>
                    <button className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/40 hover:text-primary">
                      <MoreHorizontal strokeWidth={1.5} size={14} />
                    </button>
                  </ContainerInstrument>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ContainerInstrument>

      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('users_refresh');
            fetchUsers();
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
          <VoiceglotText translationKey="admin.users.refresh" defaultText="Vernieuwen" />
        </ButtonInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "User DNA",
            "description": "Beheer van de Freedom Machine community.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "user_management",
              "capabilities": ["view_users", "edit_users", "manage_roles"],
              "lexicon": ["User DNA", "Freedom Machine", "Community"],
              "visual_dna": ["Bento Grid", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
