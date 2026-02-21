"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
  openEditModal: (actor: any, onUpdate?: (updatedActor: any) => void) => void;
  closeEditModal: () => void;
  editingActor: any | null;
  onActorUpdate?: (updatedActor: any) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActor, setEditingActor] = useState<any | null>(null);
  const [onActorUpdate, setOnActorUpdate] = useState<((updatedActor: any) => void) | undefined>(undefined);

  // SHORTCUT MANDATE: Cmd+Shift+E toggles Edit Mode sitewide (E for Edit)
  // We avoid Cmd+Shift+B as it's used by Chrome for the bookmarks bar.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        if (isAdmin) {
          e.preventDefault();
          setIsEditMode(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const openEditModal = (actor: any, onUpdate?: (updatedActor: any) => void) => {
    setEditingActor(actor);
    setOnActorUpdate(() => onUpdate);
  };

  const closeEditModal = () => {
    setEditingActor(null);
    setOnActorUpdate(undefined);
  };

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      toggleEditMode: () => { if (isAdmin) setIsEditMode(prev => !prev); }, 
      canEdit: isAdmin,
      openEditModal,
      closeEditModal,
      editingActor,
      onActorUpdate
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export function useEditMode() {
  const context = useContext(EditModeContext);
  
  // CHRIS-PROTOCOL: Safe context access for SSR
  // We return a stable default that matches the initial client state
  if (typeof window === 'undefined' || context === undefined) {
    return { 
      isEditMode: false, 
      toggleEditMode: () => {}, 
      canEdit: false, 
      openEditModal: () => {}, 
      closeEditModal: () => {}, 
      editingActor: null 
    };
  }
  
  return context;
}
