import { useCallback, useEffect, useState } from 'react';

import { PREFS_KEY } from '../lib/constants';

export type ThemePreference = 'light' | 'dark' | 'system';

export type Preferences = {
  theme: ThemePreference;
  rememberHistory: boolean;
};

const defaults: Preferences = {
  theme: 'system',
  rememberHistory: true,
};

function readPrefs(): Preferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    const p = JSON.parse(raw) as Partial<Preferences>;
    return {
      theme:
        p.theme === 'light' || p.theme === 'dark' || p.theme === 'system'
          ? p.theme
          : defaults.theme,
      rememberHistory:
        typeof p.rememberHistory === 'boolean'
          ? p.rememberHistory
          : defaults.rememberHistory,
    };
  } catch {
    return defaults;
  }
}

function applyThemeClass(theme: ThemePreference) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', dark);
  }
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<Preferences>(defaults);

  useEffect(() => {
    const next = readPrefs();
    setPrefsState(next);
    applyThemeClass(next.theme);
  }, []);

  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeClass('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [prefs.theme]);

  const setPrefs = useCallback((update: Partial<Preferences>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...update };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      if (update.theme !== undefined) {
        applyThemeClass(next.theme);
      }
      return next;
    });
  }, []);

  return { prefs, setPrefs };
}
