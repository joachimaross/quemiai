'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {themes.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            theme === name
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
