import { useCallback, useEffect, useState } from 'react';

import { HISTORY_KEY } from '../lib/constants';
import type { HistoryEntry } from '../types/history';

function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

function isHistoryEntry(x: unknown): x is HistoryEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.deleteToken === 'string' &&
    typeof o.createdAt === 'number' &&
    typeof o.preview === 'string'
  );
}

function writeHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function previewFromContent(content: string, maxLen = 80): string {
  const line = content.trim().split(/\r?\n/)[0] ?? '';
  if (line.length <= maxLen) return line || '(empty)';
  return `${line.slice(0, maxLen)}…`;
}

export function useNoteHistory(remember: boolean) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (remember) setEntries(readHistory());
    else setEntries([]);
  }, [remember]);

  const pushEntry = useCallback(
    (entry: HistoryEntry) => {
      if (!remember) return;
      setEntries((prev) => {
        const withoutDup = prev.filter((e) => e.id !== entry.id);
        const next = [entry, ...withoutDup].slice(0, 50);
        writeHistory(next);
        return next;
      });
    },
    [remember],
  );

  const removeById = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (remember) writeHistory(next);
        return next;
      });
    },
    [remember],
  );

  const clear = useCallback(() => {
    setEntries([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { entries, pushEntry, removeById, clear };
}
