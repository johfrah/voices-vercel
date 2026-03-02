"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Video, FileText, Info, Plus, Trash2, Clock, User, Globe, Tag } from 'lucide-react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  LabelInstrument,
  InputInstrument,
  SelectInstrument,
  OptionInstrument
} from './LayoutInstruments';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/engines/sonic-dna';

interface WorkshopEditModalProps {
  workshop: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedWorkshop: any) => void;
}

export const WorkshopEditModal: React.FC<WorkshopEditModalProps> = ({ 
  workshop, 
  isOpen, 
  onClose,
  onUpdate
}) => {
  const { playClick } = useSonicDNA();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'media' | 'program' | 'editions'>('base');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [editions, setEditions] = useState<any[]>([]);
  const [isLoadingEditions, setIsLoadingEditions] = useState(false);

  const [formData, setFormData] = useState({
    title: workshop.title || "",
    slug: workshop.slug || "",
    description: workshop.description || "",
    price: workshop.price || "0",
    duration: workshop.duration || "",
    instructorId: workshop.instructorId || "",
    mediaId: workshop.mediaId || "",
    media: workshop.media || null,
    program: workshop.program || [],
    meta: workshop.meta || {
      aftermovie_url: "",
      aftermovie_beschrijving: "",
      intro_video_url: "",
      benefits: []
    }
  });

  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaResults, setMediaResults] = useState<any[]>([]);
  const [isSearchingMedia, setIsSearchingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.media?.filePath) {
      setPreviewVideo(`/api/proxy?path=${encodeURIComponent(formData.media.filePath)}`);
    } else {
      setPreviewVideo(null);
    }
  }, [formData.media]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: workshop.title || "",
        slug: workshop.slug || "",
        description: workshop.description || "",
        price: workshop.price || "0",
        duration: workshop.duration || "",
        instructorId: workshop.instructorId || "",
        mediaId: workshop.mediaId || "",
        media: workshop.media || null,
        program: workshop.program || [],
        meta: workshop.meta || {
          aftermovie_url: "",
          aftermovie_beschrijving: "",
          intro_video_url: "",
          benefits: []
        }
      });
// ...
      // Load instructors
      fetch('/api/admin/studio/instructors')
        .then(res => res.json())
        .then(data => setInstructors(data))
        .catch(err => console.error("Failed to load instructors", err));

      // Load locations
      fetch('/api/admin/studio/locations')
        .then(res => res.json())
        .then(data => setLocations(data))
        .catch(err => console.error("Failed to load locations", err));

      // Load editions for this workshop
      setIsLoadingEditions(true);
      fetch(`/api/admin/studio/editions?workshopId=${workshop.id}`)
        .then(res => res.json())
        .then(data => {
          setEditions(data);
          setIsLoadingEditions(false);
        })
        .catch(err => {
          console.error("Failed to load editions", err);
          setIsLoadingEditions(false);
        });
    }
  }, [isOpen, workshop]);

  useEffect(() => {
    if (mediaSearch.length > 2) {
      setIsSearchingMedia(true);
      const timer = setTimeout(() => {
        fetch(`/api/admin/media/search?q=${mediaSearch}&type=video`)
          .then(res => res.json())
          .then(data => {
            setMediaResults(data);
            setIsSearchingMedia(false);
          })
          .catch(err => {
            console.error("Media search failed", err);
            setIsSearchingMedia(false);
          });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setMediaResults([]);
    }
  }, [mediaSearch]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    playClick('deep');

    try {
      const { media, ...saveData } = formData;
      const response = await fetch(`/api/admin/studio/workshops/catalog/${workshop.id}`, {
        method: 'POST', // The existing API uses POST for updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) throw new Error('Failed to update workshop');

      const data = await response.json();
      setMessage({ type: 'success', text: 'Workshop succesvol bijgewerkt!' });
      playClick('success');
      
      if (onUpdate) {
        onUpdate({ ...workshop, ...formData });
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij opslaan. Probeer het opnieuw.' });
      playClick('error');
    } finally {
      setIsSaving(false);
    }
  };

  const addProgramItem = () => {
    const newProgram = [...(formData.program || []), { time: "", activity: "" }];
    setFormData({ ...formData, program: newProgram });
    playClick('light');
  };

  const updateProgramItem = (index: number, field: string, value: string) => {
    const newProgram = [...(formData.program || [])];
    newProgram[index] = { ...newProgram[index], [field]: value };
    setFormData({ ...formData, program: newProgram });
  };

  const removeProgramItem = (index: number) => {
    const newProgram = formData.program.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, program: newProgram });
    playClick('light');
  };

  const handleUpdateEdition = async (editionId: number, data: any) => {
    try {
      const response = await fetch(`/api/admin/studio/editions/${editionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const updated = await response.json();
        setEditions(prev => prev.map(e => e.id === editionId ? { ...e, ...updated } : e));
        playClick('success');
      }
    } catch (err) {
      console.error("Failed to update edition", err);
      playClick('error');
    }
  };

  const handleDuplicateEdition = async (edition: any) => {
    try {
      const { id, participantCount, ...duplicateData } = edition;
      const response = await fetch('/api/admin/studio/create-edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...duplicateData,
          workshopId: workshop.id,
          date: new Date(edition.date).toISOString(), // Zelfde datum als basis, admin kan aanpassen
          status: 'upcoming'
        })
      });
      if (response.ok) {
        // Refresh editions
        const refreshRes = await fetch(`/api/admin/studio/editions?workshopId=${workshop.id}`);
        const newData = await refreshRes.json();
        setEditions(newData);
        playClick('success');
      }
    } catch (err) {
      console.error("Failed to duplicate edition", err);
      playClick('error');
    }
  };

  const handleAddEdition = async () => {
    try {
      const response = await fetch('/api/admin/studio/create-edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: workshop.id,
          date: new Date().toISOString(),
          status: 'upcoming',
          capacity: 8
        })
      });
      if (response.ok) {
        const res = await response.json();
        // Refresh editions
        const refreshRes = await fetch(`/api/admin/studio/editions?workshopId=${workshop.id}`);
        const newData = await refreshRes.json();
        setEditions(newData);
        playClick('success');
      }
    } catch (err) {
      console.error("Failed to create edition", err);
      playClick('error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploadingMedia(true);
    playClick('pro');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('journey', 'studio');
    formDataUpload.append('category', 'workshops');

    try {
      const response = await fetch('/api/admin/studio/workshops/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData({ ...formData, mediaId: data.mediaId });
      playClick('success');
      
      // Fetch full media object for UI
      const res = await fetch(`/api/admin/media/${data.mediaId}`);
      if (res.ok) {
        const fullMedia = await res.json();
        setFormData(prev => ({ ...prev, media: fullMedia }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      playClick('error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-va-black/95 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-[10001]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-va-off-white/50">
            <div>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                Bewerk <span className="text-primary italic">{workshop.title}</span>
              </HeadingInstrument>
              <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest mt-1">
                Workshop Catalogus Beheer
              </TextInstrument>
            </div>
            <ContainerInstrument className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-black/5">
              <ButtonInstrument 
                variant="plain"
                size="none"
                onClick={() => setActiveTab('base')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'base' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Basis
              </ButtonInstrument>
              <ButtonInstrument 
                variant="plain"
                size="none"
                onClick={() => setActiveTab('media')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'media' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Media
              </ButtonInstrument>
              <ButtonInstrument 
                variant="plain"
                size="none"
                onClick={() => setActiveTab('program')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'program' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Programma
              </ButtonInstrument>
              <ButtonInstrument 
                variant="plain"
                size="none"
                onClick={() => setActiveTab('editions')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'editions' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Edities
              </ButtonInstrument>
            </ContainerInstrument>
            <ButtonInstrument 
              variant="plain"
              size="none"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </ButtonInstrument>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3",
                  message.type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <TextInstrument className="text-sm font-medium">{message.text}</TextInstrument>
              </motion.div>
            )}

            {activeTab === 'base' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ContainerInstrument plain className="space-y-2">
                    <LabelInstrument>Titel</LabelInstrument>
                    <InputInstrument 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full"
                    />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="space-y-2">
                    <LabelInstrument>Slug</LabelInstrument>
                    <InputInstrument 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full"
                    />
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument plain className="space-y-2">
                  <LabelInstrument>Beschrijving</LabelInstrument>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none"
                  />
                </ContainerInstrument>

                <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ContainerInstrument plain className="space-y-2">
                    <LabelInstrument>Prijs (€)</LabelInstrument>
                    <InputInstrument 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full"
                    />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="space-y-2">
                    <LabelInstrument>Duur</LabelInstrument>
                    <InputInstrument 
                      type="text" 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full"
                      placeholder="bijv. 1 dag"
                    />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="space-y-2">
                    <LabelInstrument>Docent</LabelInstrument>
                    <SelectInstrument 
                      value={formData.instructorId || ""}
                      onChange={(e) => setFormData({ ...formData, instructorId: e.target.value ? parseInt(e.target.value) : "" })}
                      className="w-full appearance-none"
                    >
                      <OptionInstrument value="">Geen vaste docent</OptionInstrument>
                      {instructors.map(ins => (
                        <OptionInstrument key={ins.id} value={ins.id}>{ins.name}</OptionInstrument>
                      ))}
                    </SelectInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                {/* Hero Video Selection */}
                <ContainerInstrument plain className="space-y-4 p-6 bg-va-off-white rounded-[20px] border border-black/5">
                  <ContainerInstrument plain className="flex items-center justify-between mb-2">
                    <ContainerInstrument plain className="flex items-center gap-2">
                      <Video size={18} className="text-primary" />
                      <LabelInstrument className="!ml-0 !mb-0 font-bold text-va-black uppercase tracking-widest">Hoofd Video (Carousel)</LabelInstrument>
                    </ContainerInstrument>
                    
                    <ButtonInstrument 
                      variant="plain"
                      size="none"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity disabled:opacity-50"
                    >
                      {isUploadingMedia ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />} 
                      Uploaden
                    </ButtonInstrument>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="video/*" 
                      className="hidden" 
                    />
                  </ContainerInstrument>
                  
                  <ContainerInstrument plain className="space-y-3">
                    <ContainerInstrument plain className="relative">
                      <InputInstrument 
                        type="text" 
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        className="w-full text-sm"
                        placeholder="Zoek video op bestandsnaam..."
                      />
                      {isSearchingMedia && (
                        <ContainerInstrument plain className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2 size={16} className="animate-spin text-va-black/20" />
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>

                    {mediaResults.length > 0 && (
                      <ContainerInstrument plain className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                        {mediaResults.map((m: any) => (
                          <ButtonInstrument
                            key={m.id}
                            variant="plain"
                            size="none"
                            onClick={async () => {
                              setFormData({ ...formData, mediaId: m.id });
                              setMediaSearch("");
                              setMediaResults([]);
                              playClick('light');
                              
                              // Fetch full media object to update UI immediately
                              try {
                                const res = await fetch(`/api/admin/media/${m.id}`);
                                if (res.ok) {
                                  const fullMedia = await res.json();
                                  setFormData(prev => ({ ...prev, media: fullMedia }));
                                }
                              } catch (err) {
                                console.error("Failed to fetch media details", err);
                              }
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-va-off-white transition-colors flex justify-between items-center border-b border-black/[0.02] last:border-0"
                          >
                            <TextInstrument as="span" className="truncate flex-1">{m.fileName}</TextInstrument>
                            <TextInstrument as="span" className="text-[10px] font-bold text-va-black/20 uppercase ml-2">{m.id}</TextInstrument>
                          </ButtonInstrument>
                        ))}
                      </ContainerInstrument>
                    )}

                    {formData.mediaId && (
                      <ContainerInstrument plain className="space-y-3">
                        <ContainerInstrument plain className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/20 shadow-sm">
                          <ContainerInstrument plain className="flex items-center gap-3">
                            <ContainerInstrument plain className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Video size={20} />
                            </ContainerInstrument>
                            <ContainerInstrument plain>
                              <TextInstrument className="text-xs font-bold text-va-black">Geselecteerde Video ID: {formData.mediaId}</TextInstrument>
                              <TextInstrument className="text-[10px] text-va-black/40 truncate max-w-[200px]">
                                {workshop.mediaId === formData.mediaId ? (workshop.media?.fileName || 'Huidige video') : (formData.media?.fileName || 'Nieuwe selectie')}
                              </TextInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>
                          <ButtonInstrument 
                            variant="plain"
                            size="none"
                            onClick={() => {
                              setFormData({ ...formData, mediaId: "", media: null });
                              setPreviewVideo(null);
                            }}
                            className="p-2 text-va-black/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </ButtonInstrument>
                        </ContainerInstrument>

                        {previewVideo && (
                          <ContainerInstrument plain className="relative aspect-video w-full rounded-2xl overflow-hidden bg-va-black shadow-inner border border-black/5 group/preview">
                            <video 
                              src={previewVideo} 
                              className="w-full h-full object-cover"
                              controls
                              muted
                              playsInline
                            />
                            <ContainerInstrument plain className="absolute top-3 left-3 bg-va-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest opacity-0 group-hover/preview:opacity-100 transition-opacity">
                              Preview
                            </ContainerInstrument>
                          </ContainerInstrument>
                        )}
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument plain className="space-y-2">
                  <LabelInstrument>Intro Video URL (YouTube/Vimeo)</LabelInstrument>
                  <InputInstrument 
                    type="text" 
                    value={formData.meta?.intro_video_url || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, intro_video_url: e.target.value } })}
                    className="w-full"
                    placeholder="https://youtube.com/..."
                  />
                </ContainerInstrument>
                <ContainerInstrument plain className="space-y-2">
                  <LabelInstrument>Aftermovie URL</LabelInstrument>
                  <InputInstrument 
                    type="text" 
                    value={formData.meta?.aftermovie_url || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, aftermovie_url: e.target.value } })}
                    className="w-full"
                    placeholder="https://youtube.com/..."
                  />
                </ContainerInstrument>
                <ContainerInstrument plain className="space-y-2">
                  <LabelInstrument>Aftermovie Beschrijving</LabelInstrument>
                  <textarea 
                    value={formData.meta?.aftermovie_beschrijving || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, aftermovie_beschrijving: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none"
                  />
                </ContainerInstrument>
              </motion.div>
            )}

            {activeTab === 'program' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ContainerInstrument plain className="flex justify-between items-center">
                  <LabelInstrument className="!ml-0 !mb-0">Programma Items</LabelInstrument>
                  <ButtonInstrument 
                    variant="plain"
                    size="none"
                    onClick={addProgramItem} 
                    className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <Plus size={14} /> Toevoegen
                  </ButtonInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument plain className="space-y-3">
                  {formData.program?.map((item: any, idx: number) => (
                    <ContainerInstrument key={idx} plain className="flex gap-3 items-center bg-va-off-white/50 p-3 rounded-xl border border-black/[0.02]">
                      <InputInstrument 
                        type="text" 
                        value={item.time} 
                        onChange={(e) => updateProgramItem(idx, 'time', e.target.value)}
                        placeholder="09:00"
                        className="w-24 px-3 py-2 text-sm"
                      />
                      <InputInstrument 
                        type="text" 
                        value={item.activity} 
                        onChange={(e) => updateProgramItem(idx, 'activity', e.target.value)}
                        placeholder="Activiteit..."
                        className="flex-1 px-3 py-2 text-sm"
                      />
                      <ButtonInstrument 
                        variant="plain"
                        size="none"
                        onClick={() => removeProgramItem(idx)} 
                        className="p-2 text-va-black/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
              </motion.div>
            )}

            {activeTab === 'editions' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ContainerInstrument plain className="flex justify-between items-center">
                  <LabelInstrument className="!ml-0 !mb-0">Actieve Edities</LabelInstrument>
                  <ButtonInstrument 
                    variant="plain"
                    size="none"
                    onClick={handleAddEdition} 
                    className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <Plus size={14} /> Nieuwe Editie
                  </ButtonInstrument>
                </ContainerInstrument>

                {isLoadingEditions ? (
                  <ContainerInstrument plain className="space-y-4">
                    {[1, 2].map(i => (
                      <ContainerInstrument key={i} plain className="p-6 bg-va-off-white rounded-[20px] border border-black/5 space-y-4 animate-pulse">
                        <ContainerInstrument plain className="h-10 bg-white/50 rounded-xl w-full" />
                        <ContainerInstrument plain className="grid grid-cols-2 gap-4">
                          <ContainerInstrument plain className="h-12 bg-white/50 rounded-xl" />
                          <ContainerInstrument plain className="h-12 bg-white/50 rounded-xl" />
                        </ContainerInstrument>
                        <ContainerInstrument plain className="grid grid-cols-3 gap-4">
                          <ContainerInstrument plain className="h-12 bg-white/50 rounded-xl" />
                          <ContainerInstrument plain className="h-12 bg-white/50 rounded-xl" />
                          <ContainerInstrument plain className="h-12 bg-white/50 rounded-xl" />
                        </ContainerInstrument>
                      </ContainerInstrument>
                    ))}
                  </ContainerInstrument>
                ) : (
                  <ContainerInstrument plain className="space-y-4">
                    {editions.length === 0 ? (
                      <ContainerInstrument plain className="text-center py-12 bg-va-off-white rounded-2xl border border-dashed border-black/5">
                        <TextInstrument className="text-sm text-va-black/40">Geen edities gevonden voor deze workshop.</TextInstrument>
                      </ContainerInstrument>
                    ) : (
                      editions.map((edition: any) => (
                        <ContainerInstrument key={edition.id} plain className="p-6 bg-va-off-white rounded-[20px] border border-black/5 space-y-4">
                          <ContainerInstrument plain className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-black/[0.03]">
                            <ContainerInstrument plain className="flex items-center gap-2">
                              <User size={14} className="text-primary" />
                              <TextInstrument as="span" className="text-xs font-bold text-va-black">
                                Bezetting: {edition.participantCount || 0} / {edition.capacity || 0}
                              </TextInstrument>
                              {edition.participantCount >= edition.capacity && (
                                <TextInstrument as="span" className="bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">Volzet</TextInstrument>
                              )}
                            </ContainerInstrument>
                            <ButtonInstrument 
                              variant="plain"
                              size="none"
                              onClick={() => handleDuplicateEdition(edition)}
                              className="text-[9px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                              Dupliceer Editie
                            </ButtonInstrument>
                          </ContainerInstrument>

                          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ContainerInstrument plain className="space-y-1">
                              <LabelInstrument className="!ml-0 !mb-0 !text-[9px]">Datum & Tijd</LabelInstrument>
                              <InputInstrument 
                                type="datetime-local" 
                                value={edition.date ? new Date(edition.date).toISOString().slice(0, 16) : ""}
                                onChange={(e) => handleUpdateEdition(edition.id, { date: e.target.value })}
                                className="w-full px-3 py-2 text-sm"
                              />
                            </ContainerInstrument>
                            <ContainerInstrument plain className="space-y-1">
                              <LabelInstrument className="!ml-0 !mb-0 !text-[9px]">Locatie</LabelInstrument>
                              <SelectInstrument 
                                value={edition.locationId || ""}
                                onChange={(e) => handleUpdateEdition(edition.id, { locationId: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-3 py-2 text-sm"
                              >
                                <OptionInstrument value="">Selecteer locatie</OptionInstrument>
                                {locations.map(loc => (
                                  <OptionInstrument key={loc.id} value={loc.id}>{loc.name}</OptionInstrument>
                                ))}
                              </SelectInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>
                          
                          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-black/[0.03]">
                            <ContainerInstrument plain className="space-y-1">
                              <LabelInstrument className="!ml-0 !mb-0 !text-[9px]">Capaciteit</LabelInstrument>
                              <InputInstrument 
                                type="number" 
                                value={edition.capacity || 0}
                                onChange={(e) => handleUpdateEdition(edition.id, { capacity: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 text-sm"
                              />
                            </ContainerInstrument>
                            <ContainerInstrument plain className="space-y-1">
                              <LabelInstrument className="!ml-0 !mb-0 !text-[9px]">Status</LabelInstrument>
                              <SelectInstrument 
                                value={edition.status || "upcoming"}
                                onChange={(e) => handleUpdateEdition(edition.id, { status: e.target.value })}
                                className="w-full px-3 py-2 text-sm"
                              >
                                <OptionInstrument value="upcoming">Upcoming</OptionInstrument>
                                <OptionInstrument value="active">Active</OptionInstrument>
                                <OptionInstrument value="full">Volzet</OptionInstrument>
                                <OptionInstrument value="completed">Afgerond</OptionInstrument>
                                <OptionInstrument value="cancelled">Geannuleerd</OptionInstrument>
                              </SelectInstrument>
                            </ContainerInstrument>
                            <ContainerInstrument plain className="space-y-1">
                              <LabelInstrument className="!ml-0 !mb-0 !text-[9px]">Prijs (Afwijkend)</LabelInstrument>
                              <InputInstrument 
                                type="number" 
                                value={edition.price || ""}
                                placeholder={formData.price}
                                onChange={(e) => handleUpdateEdition(edition.id, { price: e.target.value })}
                                className="w-full px-3 py-2 text-sm"
                              />
                            </ContainerInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      ))
                    )}
                  </ContainerInstrument>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <ContainerInstrument plain className="px-8 py-6 border-t border-black/5 bg-va-off-white/30 flex justify-between items-center">
            <ContainerInstrument plain className="flex items-center gap-2 text-[11px] text-va-black/40 font-medium italic">
              <Info size={14} className="text-primary shrink-0" />
              Wijzigingen zijn direct zichtbaar in de catalogus.
            </ContainerInstrument>
            <ContainerInstrument plain className="flex gap-4">
              <ButtonInstrument variant="outline" onClick={onClose} disabled={isSaving} className="rounded-xl px-6">
                Annuleren
              </ButtonInstrument>
              <ButtonInstrument onClick={handleSave} disabled={isSaving} className="bg-va-black text-white hover:bg-primary rounded-xl px-8 flex items-center gap-2 shadow-lg transition-all">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Opslaan
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
