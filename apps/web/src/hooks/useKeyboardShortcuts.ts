import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
}

/**
 * Custom hook for registering keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcut configurations
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !shortcut.ctrlKey || event.ctrlKey === shortcut.ctrlKey;
        const metaMatches = !shortcut.metaKey || event.metaKey === shortcut.metaKey;
        const shiftMatches = !shortcut.shiftKey || event.shiftKey === shortcut.shiftKey;
        const altMatches = !shortcut.altKey || event.altKey === shortcut.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
