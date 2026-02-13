"use client";

import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  TextInstrument,
  ButtonInstrument,
  SectionInstrument
} from '@/components/ui/LayoutInstruments';
import { useAuth } from '@/contexts/AuthContext';
import {
    Activity,
    AlertCircle,
    Brain,
    CheckCircle2,
    Clock,
    Globe,
    Layout,
    Music,
    Search,
    Send,
    ShieldCheck,
    Smartphone,
    Zap
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

const AGENTS = [
    { id: 'bob', name: 'Bob', role: 'Architect', avatar: '/assets/bob-avatar-voicy.png', color: '#FFBE00', icon: Zap, description: 'Bewaakt de antifragile architectuur en de Bob-methode.' },
    { id: 'chris', name: 'Chris', role: 'Inspecteur', avatar: '/assets/chris-avatar-voicy.png', color: '#c134f9', icon: ShieldCheck, description: 'Bewaker van de wet, code-integriteit en het Chris-Protocol.' },
    { id: 'laya', name: 'Laya', role: 'Estheet', avatar: '/assets/laya-avatar-voicy.png', color: '#5CAED1', icon: Layout, description: 'Bewaakt de visuele ziel, de Voices-Mix en de Ademing-feel.' },
    { id: 'moby', name: 'Moby', role: 'Regisseur', avatar: '/assets/moby-avatar-voicy.png', color: '#83CBBC', icon: Smartphone, description: 'Meester van de thumb-zone en mobile-first interactie.' },
    { id: 'suzy', name: 'Suzy', role: 'SEO/LLM', avatar: '/assets/suzy-avatar-voicy.png', color: '#eb3683', icon: Search, description: 'Architect van vindbaarheid en Knowledge Graph orkestratie.' },
    { id: 'anna', name: 'Anna', role: 'Stage Manager', avatar: '/assets/anna-avatar-voicy.png', color: '#5CAED1', icon: Music, description: 'Zorgt dat de show "Altijd Aan" is en orkestreert de flow.' },
    { id: 'mark', name: 'Mark', role: 'Marketing', avatar: '/assets/mark-avatar-voicy.png', color: '#eb3683', icon: Globe, description: 'Bewaakt de Tone of Voice en psychologische conversie.' },
    { id: 'sherlock', name: 'Sherlock', role: 'Detective', avatar: '/assets/sherlock-avatar-voicy.png', color: '#83CBBC', icon: Brain, description: 'Trend detective en opportunity scout in de buitenwereld.' },
    { id: 'cody', name: 'Cody', role: 'Backend', avatar: '/assets/cody-avatar-voicy.png', color: '#FFBE00', icon: Zap, description: 'Zorgt dat alles achter de schermen werkt (Data, API\'s, Auth, Latency).' },
];

export default function AgentCommandCenter() {
    const { isAdmin } = useAuth();
    const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
    const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string, timestamp: Date}[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [tasks, setTasks] = useState<{id: string, name: string, status: 'running' | 'completed' | 'failed', time: string}[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isAdmin) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user' as const, content: inputValue, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsExecuting(true);

        try {
            const res = await fetch('/api/admin/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    agentId: selectedAgent.id, 
                    message: userMsg.content 
                })
            });
            
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            const agentMsg = { 
                role: 'agent' as const, 
                content: data.content, 
                timestamp: new Date(data.timestamp) 
            };
            setMessages(prev => [...prev, agentMsg]);
            
            if (data.action) {
                const newTask = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: `${selectedAgent.name}: ${data.action}`,
                    status: 'completed' as const,
                    time: 'Zojuist'
                };
                setTasks(prev => [newTask, ...prev]);
                toast.success(`Actie uitgevoerd: ${data.action}`);
            }
        } catch (error) {
            toast.error('Agent verbinding verbroken');
            console.error(error);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <PageWrapperInstrument className="bg-va-off-white min-h-screen">
            <ContainerInstrument className="max-w-7xl mx-auto py-12 px-6">
                <SectionInstrument className="mb-12 flex justify-between items-end">
                    <ContainerInstrument>
                        <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter mb-4">
                            <VoiceglotText translationKey="admin.agents.title" defaultText="Agent Command Center" />
                        </HeadingInstrument>
                        <TextInstrument className="text-lg text-va-black/40 font-medium">
                            <VoiceglotText translationKey="admin.agents.subtitle" defaultText="Stuur je team van AI-specialisten aan en bewaak de Schouwburg." />
                        </TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-aura">
                        <Activity strokeWidth={1.5} className="text-primary animate-pulse" size={20} />
                        <ContainerInstrument className="text-right">
                            <TextInstrument className="text-[15px] font-black tracking-widest block">
                                <VoiceglotText translationKey="admin.agents.system_status" defaultText="SYSTEM STATUS" />
                            </TextInstrument>
                            <TextInstrument className="text-[15px] font-medium text-green-500 ">
                                <VoiceglotText translationKey="admin.agents.all_online" defaultText="All Agents Online" />
                            </TextInstrument>
                        </ContainerInstrument>
                    </ContainerInstrument>
                </SectionInstrument>

                <SectionInstrument className="grid grid-cols-12 gap-8">
                    {/* Agent Sidebar */}
                    <ContainerInstrument className="col-span-3 space-y-4">
                        <HeadingInstrument level={4} className="text-[15px] font-black tracking-widest text-va-black/20 mb-6 ">
                            <VoiceglotText translationKey="admin.agents.orchestra" defaultText="Het Orkest" />
                        </HeadingInstrument>
                        {AGENTS.map((agent) => (
                            <ButtonInstrument
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={cn(
                                    "w-full p-4 rounded-[20px] transition-all flex items-center gap-4 text-left group",
                                    selectedAgent.id === agent.id 
                                        ? 'bg-va-black text-white shadow-xl scale-105' 
                                        : 'bg-white text-va-black hover:bg-gray-50'
                                )}
                            >
                                <ContainerInstrument className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all">
                                    <Image src={agent.avatar} alt={agent.name} fill className="object-cover" />
                                </ContainerInstrument>
                                <ContainerInstrument>
                                    <TextInstrument className="text-[15px] font-bold block">{agent.name}</TextInstrument>
                                    <TextInstrument className={cn(
                                        "text-[15px] font-medium opacity-40",
                                        selectedAgent.id === agent.id ? 'text-white' : ''
                                    )}>
                                        {agent.role}
                                    </TextInstrument>
                                </ContainerInstrument>
                                {selectedAgent.id === agent.id && (
                                    <ContainerInstrument className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </ButtonInstrument>
                        ))}
                    </ContainerInstrument>

                    {/* Main Chat/Control Area */}
                    <ContainerInstrument className="col-span-6 flex flex-col h-[700px] bg-white rounded-[20px] shadow-aura overflow-hidden border border-black/5">
                        {/* Agent Header */}
                        <ContainerInstrument className="p-8 border-b border-black/5 flex items-center gap-6 bg-va-off-white/30">
                            <ContainerInstrument className="w-16 h-16 rounded-full overflow-hidden shadow-lg relative">
                                <Image src={selectedAgent.avatar} alt={selectedAgent.name} width={64} height={64} className="object-cover" />
                            </ContainerInstrument>
                            <ContainerInstrument>
                                <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter">
                                    {selectedAgent.name} <TextInstrument className="text-va-black/20 inline">/</TextInstrument> {selectedAgent.role}
                                </HeadingInstrument>
                                <TextInstrument className="text-[15px] font-medium text-va-black/40">
                                    {selectedAgent.description}
                                </TextInstrument>
                            </ContainerInstrument>
                        </ContainerInstrument>

                        {/* Messages */}
                        <ContainerInstrument ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {messages.length === 0 ? (
                                <ContainerInstrument className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                    <selectedAgent.icon size={48} strokeWidth={1.5} />
                                    <TextInstrument className="text-lg font-medium">
                                        <VoiceglotText 
                                            translationKey="admin.agents.command_prompt" 
                                            defaultText={`Geef ${selectedAgent.name} een opdracht...`} 
                                        />
                                    </TextInstrument>
                                </ContainerInstrument>
                            ) : (
                                messages.map((msg, i) => (
                                    <ContainerInstrument key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <ContainerInstrument className={cn(
                                            "max-w-[80%] p-5 rounded-[20px] text-[15px] font-medium leading-relaxed shadow-sm",
                                            msg.role === 'user' 
                                                ? 'bg-va-black text-white rounded-tr-none' 
                                                : 'bg-va-off-white text-va-black rounded-tl-none'
                                        )}>
                                            <TextInstrument>{msg.content}</TextInstrument>
                                            <TextInstrument className={cn(
                                                "text-[15px] mt-2 opacity-30",
                                                msg.role === 'user' ? 'text-right' : 'text-left'
                                            )}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TextInstrument>
                                        </ContainerInstrument>
                                    </ContainerInstrument>
                                ))
                            )}
                            {isExecuting && (
                                <ContainerInstrument className="flex justify-start">
                                    <ContainerInstrument className="bg-va-off-white p-5 rounded-[20px] rounded-tl-none flex items-center gap-3">
                                        <ContainerInstrument className="flex gap-1">
                                            <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                            <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </ContainerInstrument>
                                    </ContainerInstrument>
                                </ContainerInstrument>
                            )}
                        </ContainerInstrument>

                        {/* Input */}
                        <ContainerInstrument className="p-8 bg-va-off-white/30 border-t border-black/5">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={`Vraag ${selectedAgent.name} om een taak uit te voeren...`}
                                    className="w-full bg-white border-none rounded-[10px] py-5 px-8 pr-16 text-[15px] font-medium shadow-aura focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                                <ButtonInstrument
                                    type="submit"
                                    disabled={isExecuting}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-va-black text-white rounded-full flex items-center justify-center hover:bg-primary transition-all disabled:opacity-50"
                                >
                                    <Send strokeWidth={1.5} size={20} />
                                </ButtonInstrument>
                            </form>
                        </ContainerInstrument>
                    </ContainerInstrument>

                    {/* Task Monitor */}
                    <ContainerInstrument className="col-span-3 space-y-8">
                        <ContainerInstrument>
                            <HeadingInstrument level={4} className="text-[15px] font-black tracking-widest text-va-black/20 mb-6 ">
                                <VoiceglotText translationKey="admin.agents.task_monitor" defaultText="Task Monitor" />
                            </HeadingInstrument>
                            <ContainerInstrument className="bg-white rounded-[20px] p-6 shadow-aura border border-black/5 space-y-4">
                                {tasks.length === 0 ? (
                                    <TextInstrument className="text-[15px] font-medium text-va-black/30 text-center py-8 block">
                                        <VoiceglotText translationKey="admin.agents.no_tasks" defaultText="Geen actieve taken." />
                                    </TextInstrument>
                                ) : (
                                    tasks.map((task) => (
                                        <ContainerInstrument key={task.id} className="p-4 rounded-[15px] bg-va-off-white/50 flex items-center gap-4">
                                            {task.status === 'running' ? (
                                                <Clock className="text-primary animate-spin" size={18} strokeWidth={1.5} />
                                            ) : task.status === 'completed' ? (
                                                <CheckCircle2 strokeWidth={1.5} className="text-green-500" size={18} />
                                            ) : (
                                                <AlertCircle className="text-red-500" size={18} strokeWidth={1.5} />
                                            )}
                                            <ContainerInstrument className="flex-1 min-w-0">
                                                <TextInstrument className="text-[15px] font-bold block truncate">{task.name}</TextInstrument>
                                                <TextInstrument className="text-[15px] font-medium opacity-40 tracking-widest">
                                                    {task.status} • {task.time}
                                                </TextInstrument>
                                            </ContainerInstrument>
                                        </ContainerInstrument>
                                    ))
                                )}
                            </ContainerInstrument>
                        </ContainerInstrument>

                        <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-8 shadow-2xl relative overflow-hidden">
                            <HeadingInstrument level={4} className="text-[15px] font-black tracking-widest opacity-40 mb-4 ">
                                <VoiceglotText translationKey="admin.agents.quick_stats" defaultText="Quick Stats" />
                            </HeadingInstrument>
                            <ContainerInstrument className="space-y-4 relative z-10">
                                <ContainerInstrument className="flex justify-between items-end">
                                    <TextInstrument className="text-[15px] font-medium opacity-60">
                                        <VoiceglotText translationKey="admin.agents.uptime" defaultText="Uptime" />
                                    </TextInstrument>
                                    <TextInstrument className="text-2xl font-light">99.9%</TextInstrument>
                                </ContainerInstrument>
                                <ContainerInstrument className="flex justify-between items-end">
                                    <TextInstrument className="text-[15px] font-medium opacity-60">
                                        <VoiceglotText translationKey="admin.agents.tasks_today" defaultText="Tasks Today" />
                                    </TextInstrument>
                                    <TextInstrument className="text-2xl font-light">{tasks.length + 12}</TextInstrument>
                                </ContainerInstrument>
                            </ContainerInstrument>
                            <ContainerInstrument className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        </ContainerInstrument>
                    </ContainerInstrument>
                </SectionInstrument>
            </ContainerInstrument>
        </PageWrapperInstrument>
    );
}
