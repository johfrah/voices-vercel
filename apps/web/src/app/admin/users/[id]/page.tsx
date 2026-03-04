'use client';

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
import { 
    ArrowLeft, 
    Ghost, 
    Mail, 
    Shield, 
    CreditCard, 
    Globe, 
    Activity, 
    MapPin, 
    Smartphone, 
    Award,
    Clock,
    DollarSign,
    ExternalLink,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 *  CUSTOMER INTELLIGENCE HUB (2026)
 *  The 360° View of the Customer.
 */
export default function AdminUserDetailPage() {
    const params = useParams();
    const { logAction } = useAdminTracking();
    const { impersonate } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (!params.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                toast.error('Kan gebruiker niet laden');
            }
        } catch (e) {
            console.error('Failed to fetch user details', e);
            toast.error('Fout bij ophalen gegevens');
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) return (
        <ContainerInstrument className="min-h-screen flex items-center justify-center">
            <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
        </ContainerInstrument>
    );

    if (!user) return (
        <ContainerInstrument className="min-h-screen flex items-center justify-center">
            <TextInstrument>Gebruiker niet gevonden.</TextInstrument>
        </ContainerInstrument>
    );

    const { profile, financials, activity, marketing, education } = user;

    return (
        <PageWrapperInstrument className="p-6 md:p-12 space-y-8 md:space-y-12 max-w-[1600px] mx-auto min-h-screen">
            {/* Header / Navigation */}
            <SectionInstrument className="flex items-center gap-4">
                <Link href="/admin/users" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
                    <ArrowLeft strokeWidth={1.5} size={12} />
                    <VoiceglotText translationKey="admin.back_to_users" defaultText="Terug naar overzicht" />
                </Link>
            </SectionInstrument>

            {/* BENTO GRID LAYOUT */}
            <BentoGrid strokeWidth={1.5} columns={4} className="grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* 1. PROFILE CARD (Full Width Header) */}
                <BentoCard span="full" className="bg-white border border-black/5 p-8 md:p-10 rounded-[30px] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <ContainerInstrument className="flex items-center gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-va-off-white rounded-full flex items-center justify-center text-3xl font-light text-va-black/20">
                            {profile.first_name?.charAt(0) || profile.email?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <HeadingInstrument level={1} className="text-3xl md:text-5xl font-light tracking-tighter">
                                    {profile.displayName}
                                </HeadingInstrument>
                                {profile.role === 'admin' && (
                                    <span className="bg-va-black text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-1">
                                        <Shield size={10} /> Admin
                                    </span>
                                )}
                            </div>
                            <TextInstrument className="text-lg text-va-black/40 font-light flex items-center gap-2">
                                <Mail size={14} /> {profile.email}
                            </TextInstrument>
                            {profile.companyName && (
                                <TextInstrument className="text-[15px] text-va-black/40 font-light mt-1 flex items-center gap-2">
                                    <Globe size={14} /> {profile.companyName}
                                </TextInstrument>
                            )}
                        </div>
                    </ContainerInstrument>

                    <ContainerInstrument className="flex flex-wrap gap-3">
                        <ButtonInstrument 
                            onClick={async () => {
                                logAction('users_impersonate', { user_id: profile.id });
                                const res = await impersonate(profile.id);
                                if (!res.success) toast.error(res.error || 'Ghost Mode mislukt');
                            }}
                            className="bg-va-off-white hover:bg-va-black hover:text-white text-va-black transition-all px-6 py-3 rounded-full flex items-center gap-2"
                        >
                            <Ghost size={16} /> Ghost Mode
                        </ButtonInstrument>
                        <ButtonInstrument className="border border-black/10 hover:border-primary hover:text-primary text-va-black/60 transition-all px-6 py-3 rounded-full flex items-center gap-2">
                            <Mail size={16} /> Stuur Email
                        </ButtonInstrument>
                    </ContainerInstrument>
                </BentoCard>

                {/* 2. FINANCIAL DNA (Medium Span) */}
                <BentoCard span="md" className="bg-white border border-black/5 p-8 rounded-[30px] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={120} />
                    </div>
                    <div className="flex items-center gap-3 text-va-black/30">
                        <CreditCard size={18} />
                        <TextInstrument className="text-[13px] font-bold tracking-widest uppercase">Financial DNA</TextInstrument>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <TextInstrument className="text-[13px] text-va-black/40 mb-1">Lifetime Value</TextInstrument>
                            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-primary">
                                €{financials.totalSpent?.toFixed(2)}
                            </HeadingInstrument>
                        </div>
                        <div>
                            <TextInstrument className="text-[13px] text-va-black/40 mb-1">Orders</TextInstrument>
                            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">
                                {financials.orderCount}
                            </HeadingInstrument>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/5">
                        <TextInstrument className="text-[13px] text-va-black/40 mb-4">Laatste Orders</TextInstrument>
                        <div className="space-y-3">
                            {financials.orders.slice(0, 3).map((order: any) => (
                                <div key={order.id} className="flex justify-between items-center text-[14px]">
                                    <span className="font-medium">#{order.id}</span>
                                    <span className="text-va-black/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="font-bold">€{order.amountNet}</span>
                                </div>
                            ))}
                            {financials.orders.length === 0 && (
                                <TextInstrument className="text-sm text-va-black/30 italic">Geen orders gevonden.</TextInstrument>
                            )}
                        </div>
                    </div>
                </BentoCard>

                {/* 3. MARKETING & INTELLIGENCE (Medium Span) */}
                <BentoCard span="md" className="bg-white border border-black/5 p-8 rounded-[30px] space-y-6">
                    <div className="flex items-center gap-3 text-va-black/30">
                        <Activity size={18} />
                        <TextInstrument className="text-[13px] font-bold tracking-widest uppercase">Marketing Intelligence</TextInstrument>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-va-off-white/50 p-4 rounded-[15px]">
                            <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/30 mb-2">Acquisitie Bron</TextInstrument>
                            <div className="flex items-center gap-2">
                                <Globe size={16} className="text-primary" />
                                <span className="font-medium text-lg">{marketing.howHeard || 'Onbekend'}</span>
                            </div>
                        </div>

                        {marketing.visitorProfile && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-va-off-white/50 p-4 rounded-[15px]">
                                    <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/30 mb-2">Locatie</TextInstrument>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-va-black/40" />
                                        <span className="text-sm">{marketing.visitorProfile.locationCity || 'N/A'}, {marketing.visitorProfile.locationCountry}</span>
                                    </div>
                                </div>
                                <div className="bg-va-off-white/50 p-4 rounded-[15px]">
                                    <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/30 mb-2">Laatst Gezien</TextInstrument>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-va-black/40" />
                                        <span className="text-sm">{new Date(marketing.visitorProfile.lastVisitAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <TextInstrument className="text-[13px] text-va-black/40 mb-3">Touchpoints</TextInstrument>
                        <div className="flex flex-wrap gap-2">
                            {marketing.touchpoints.map((tp: any, i: number) => (
                                <span key={i} className="px-3 py-1 bg-va-off-white rounded-full text-[12px] text-va-black/60 border border-black/5">
                                    {tp.source} / {tp.medium}
                                </span>
                            ))}
                            {marketing.touchpoints.length === 0 && (
                                <span className="text-sm text-va-black/30 italic">Geen touchpoints geregistreerd.</span>
                            )}
                        </div>
                    </div>
                </BentoCard>

                {/* 4. ACTIVITY TIMELINE (Large Span) */}
                <BentoCard span="lg" className="bg-white border border-black/5 p-8 rounded-[30px] space-y-6">
                    <div className="flex items-center gap-3 text-va-black/30">
                        <Clock size={18} />
                        <TextInstrument className="text-[13px] font-bold tracking-widest uppercase">Activity Timeline</TextInstrument>
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-black/5">
                        {activity.timeline.map((event: any, i: number) => (
                            <div key={i} className="relative pl-8">
                                <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                    event.level === 'error' ? 'bg-red-500' : 
                                    event.level === 'warn' ? 'bg-orange-400' : 'bg-primary'
                                } shadow-sm z-10`} />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-medium">{event.message}</span>
                                    <span className="text-[12px] text-va-black/40 font-mono mt-1">
                                        {new Date(event.createdAt).toLocaleString()} • {event.source}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {activity.timeline.length === 0 && (
                            <div className="pl-8 text-va-black/40 italic">Geen recente activiteit.</div>
                        )}
                    </div>
                </BentoCard>

                {/* 5. EDUCATION & WORKSHOPS (Small Span) */}
                <BentoCard span="sm" className="bg-white border border-black/5 p-8 rounded-[30px] space-y-6">
                    <div className="flex items-center gap-3 text-va-black/30">
                        <Award size={18} />
                        <TextInstrument className="text-[13px] font-bold tracking-widest uppercase">Academy & Studio</TextInstrument>
                    </div>

                    <div className="space-y-4">
                        {education.courses.map((course: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-va-off-white/30 rounded-[10px]">
                                <span className="text-sm font-medium">{course.courseTitle}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    course.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {course.status}
                                </span>
                            </div>
                        ))}
                         {education.courses.length === 0 && (
                            <div className="text-sm text-va-black/30 italic">Geen cursussen.</div>
                        )}
                    </div>
                </BentoCard>

            </BentoGrid>
        </PageWrapperInstrument>
    );
}
