import { useCallback, useEffect, useState } from "react";
import { HISTORY_KEY } from "@/lib/constants";
import { readNoteHistory, writeNoteHistory } from "@/lib/note-history-storage";
import type { HistoryEntry } from "@/types/history";

export function previewFromContent(content: string, maxLen = 80): string {
  const line = content.trim().split(/\r?\n/)[0] ?? "";
  if (line.length <= maxLen) {return line || "(empty)";}
  return `${line.slice(0, maxLen)}…`;
}

export function useNoteHistory(remember: boolean) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (remember) {
      setEntries(readNoteHistory());
    } else {
      setEntries([]);
    }
  }, [remember]);

  const pushEntry = useCallback(
    (entry: HistoryEntry) => {
      if (!remember) {
        return;
      }
      setEntries((prev) => {
        const withoutDup = prev.filter((e) => e.id !== entry.id);
        const next = [entry, ...withoutDup].slice(0, 50);
        writeNoteHistory(next);
        return next;
      });
    },
    [remember],
  );

  const removeById = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (remember) {
          writeNoteHistory(next);
        }
        return next;
      });
    },
    [remember],
  );

  const clear = useCallback(() => {
    setEntries([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  return { entries, pushEntry, removeById, clear };
}
