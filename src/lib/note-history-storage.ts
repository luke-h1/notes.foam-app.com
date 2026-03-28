import { HISTORY_KEY } from "@/lib/constants";
import type { HistoryEntry } from "@/types/history";

function isHistoryEntry(x: unknown): x is HistoryEntry {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.deleteToken !== "string" ||
    typeof o.createdAt !== "number" ||
    typeof o.preview !== "string"
  ) {
    return false;
  }
  if (o.content !== undefined && typeof o.content !== "string") {
    return false;
  }
  return true;
}

export function readNoteHistory(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

export function writeNoteHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {}
}

export function removeNoteFromHistory(id: string): void {
  writeNoteHistory(readNoteHistory().filter((e) => e.id !== id));
}

export function getDeleteTokenForNote(id: string): string | null {
  return readNoteHistory().find((e) => e.id === id)?.deleteToken ?? null;
}
