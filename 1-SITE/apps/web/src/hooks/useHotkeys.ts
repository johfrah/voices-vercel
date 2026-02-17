import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

/**
 *  USE HOTKEYS HOOK (2026)
 * 
 * Maakt keyboard-first navigatie mogelijk voor admin interfaces.
 * Ondersteunt combinaties en voorkomt triggers in input velden.
 */
export function useHotkeys(keyMap: Record<string, KeyHandler>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Voorkom hotkeys als de gebruiker in een input of textarea typt
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const handler = keyMap[event.key.toLowerCase()];
      if (handler) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
}
