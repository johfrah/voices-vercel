"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  // Reset edit mode if user is no longer admin
  useEffect(() => {
    if (!isAdmin) {
      setIsEditMode(false);
    }
  }, [isAdmin]);

  const toggleEditMode = () => {
    if (isAdmin) {
      setIsEditMode(!isEditMode);
    }
  };

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      toggleEditMode, 
      canEdit: isAdmin 
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
