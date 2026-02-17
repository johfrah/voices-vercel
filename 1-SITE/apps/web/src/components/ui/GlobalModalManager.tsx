"use client";

import React from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { ActorEditModal } from './ActorEditModal';

/**
 *  GLOBAL MODAL MANAGER (GOD MODE 2026)
 * 
 * Beheert alle sitewide popups en modals vanuit n centrale plek.
 * Gebruikt de EditModeContext voor state management.
 */
export const GlobalModalManager: React.FC = () => {
  const { editingActor, closeEditModal, onActorUpdate } = useEditMode();

  return (
    <>
      {editingActor && (
        <ActorEditModal 
          actor={editingActor} 
          isOpen={!!editingActor} 
          onClose={closeEditModal} 
          onSuccess={() => {
            // No-op here, the modal handles its own success message
          }}
          onUpdate={onActorUpdate}
        />
      )}
    </>
  );
};
