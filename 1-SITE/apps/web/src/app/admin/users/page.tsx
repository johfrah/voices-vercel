"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Users, Search, UserPlus, Shield, ArrowLeft, Loader2, Mail, Edit3, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

/**
 * 👥 ADMIN USERS (NUCLEAR 2026)
 * 
 * "Beheer van de Freedom Machine community."
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
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
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} /> 
            <VoiceglotText translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter uppercase">
            <VoiceglotText translationKey="admin.users.title" defaultText="User DNA" />
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Zoek op naam of email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-black/5 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary focus:shadow-aura transition-all w-[300px]"
            />
          </div>
          <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
            <UserPlus size={16} /> <VoiceglotText translationKey="admin.users.add" defaultText="Nieuwe Gebruiker" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Stats */}
      <BentoGrid columns={4}>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/30">Totaal Gebruikers</TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter">{users.length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/30">Nieuw (30d)</TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter text-primary">+{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/30">Admins</TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter text-va-black">{users.filter(u => u.role === 'admin').length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/30">Actieve Sessies</TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter text-green-500">24</HeadingInstrument>
        </BentoCard>
      </BentoGrid>

      {/* User Table */}
      <ContainerInstrument className="bg-white border border-black/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-va-off-white/50 border-b border-black/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-va-black/30">Gebruiker</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-va-black/30">Rol</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-va-black/30">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-va-black/30">Laatst Actief</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-va-black/30">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-black/5 hover:bg-va-off-white/20 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-va-off-white rounded-full flex items-center justify-center font-black text-va-black/20 uppercase">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div>
                      <TextInstrument className="font-black text-va-black uppercase tracking-tight">{user.name || 'Onbekend'}</TextInstrument>
                      <TextInstrument className="text-[10px] text-va-black/40 font-medium">{user.email}</TextInstrument>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-va-black text-white' : 'bg-va-off-white text-va-black/40'
                  }`}>
                    {user.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                    {user.role}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <TextInstrument className="text-[10px] font-black uppercase tracking-widest">Actief</TextInstrument>
                  </div>
                </td>
                <td className="p-6">
                  <TextInstrument className="text-[10px] font-medium text-va-black/40">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('nl-BE') : 'Nooit'}
                  </TextInstrument>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-va-off-white rounded-lg transition-colors text-va-black/40 hover:text-primary">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-2 hover:bg-va-off-white rounded-lg transition-colors text-va-black/40 hover:text-primary">
                      <Mail size={14} />
                    </button>
                    <button className="p-2 hover:bg-va-off-white rounded-lg transition-colors text-va-black/40 hover:text-primary">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
