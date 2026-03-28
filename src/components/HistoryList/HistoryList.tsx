import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeClipboardNoteBody } from "@/lib/clipboard";
import type { HistoryEntry } from "@/types/history";

type Props = {
  entries: HistoryEntry[];
  onDeleteRemote: (id: string, deleteToken: string) => Promise<void>;
};

export function HistoryList({ entries, onDeleteRemote }: Props) {
  const [fetchedBody, setFetchedBody] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const missingIdsKey = useMemo(
    () =>
      entries
        .filter((e) => !e.content)
        .map((e) => e.id)
        .sort()
        .join(','),
    [entries],
  );

  useEffect(() => {
    if (!missingIdsKey) {
      return;
    }
    const missing = missingIdsKey.split(',');

    let cancelled = false;
    void (async () => {
      const results = await Promise.all(
        missing.map(async (id) => {
          const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
            credentials: 'same-origin',
          });
          if (!res.ok) {return { id, content: null as string | null };}
          const data = (await res.json()) as { content?: string };
          return {
            id,
            content: typeof data.content === 'string' ? data.content : null,
          };
        }),
      );
      if (cancelled) {
        return;
      }
      setFetchedBody((prev) => {
        const next = { ...prev };
        for (const { id, content } of results) {
          if (content !== null) {
            next[id] = content;
          }
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [missingIdsKey]);

  const copyBody = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(normalizeClipboardNoteBody(text));
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        No notes in this browser yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((e) => {
        const body = e.content ?? fetchedBody[e.id] ?? e.preview;
        return (
          <li
            key={e.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <a
                  href={`/n/${e.id}`}
                  className="font-mono text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  /n/{e.id}
                </a>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyBody(e.id, body)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {copiedId === e.id ? 'Copied' : 'Copy note'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRemote(e.id, e.deleteToken)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <pre className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 font-mono text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">{body}</pre>
          </li>
        );
      })}
    </ul>
  );
}
