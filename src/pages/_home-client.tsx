import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useNoteHistory, previewFromContent } from "@/hooks/useNoteHistory";
import {
  usePreferences,
  type Preferences,
  type ThemePreference,
} from "@/hooks/usePreferences";
import { createNoteRequest, deleteNoteRequest } from "@/lib/client-api";
import {
  normalizeClipboardNoteBody,
  normalizeClipboardUrl,
} from "@/lib/clipboard";
import type { HistoryEntry } from "@/types/history";

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(normalizeClipboardUrl(text));
    return true;
  } catch {
    return false;
  }
}

function ShareLinksCard(props: {
  noteUrl: string;
  deleteUrl: string;
  onDismiss: () => void;
}) {
  const { noteUrl, deleteUrl, onDismiss } = props;
  const [copied, setCopied] = useState<"note" | "delete" | null>(null);

  const handleCopy = useCallback(
    async (kind: "note" | "delete", text: string) => {
      const ok = await copyTextToClipboard(text);
      if (ok) {
        setCopied(kind);
        window.setTimeout(() => {
          setCopied(null);
        }, 2000);
      }
    },
    [],
  );

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/40">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
          Note created
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-sm text-emerald-700/80 hover:text-emerald-900 dark:text-emerald-300/80 dark:hover:text-emerald-100"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-800/70 dark:text-emerald-200/60">
            Share link
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block flex-1 truncate rounded-lg bg-white/80 px-3 py-2 text-xs text-emerald-950 dark:bg-zinc-900/80 dark:text-emerald-100">
              {normalizeClipboardUrl(noteUrl)}
            </code>
            <button
              type="button"
              onClick={() => {
                void handleCopy("note", noteUrl);
              }}
              className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {copied === "note" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-800/70 dark:text-emerald-200/60">
            Delete link
          </p>
          <p className="mb-2 text-xs text-emerald-800/80 dark:text-emerald-200/70">
            Anyone with this URL can delete the note. Keep it private.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block flex-1 truncate rounded-lg bg-white/80 px-3 py-2 text-xs text-emerald-950 dark:bg-zinc-900/80 dark:text-emerald-100">
              {normalizeClipboardUrl(deleteUrl)}
            </code>
            <button
              type="button"
              onClick={() => {
                void handleCopy("delete", deleteUrl);
              }}
              className="shrink-0 rounded-lg border border-emerald-700/40 bg-transparent px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100/80 dark:border-emerald-500/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
            >
              {copied === "delete" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteComposer(props: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: string | null;
}) {
  const { value, onChange, onSubmit, disabled, error } = props;
  const valueRef = useRef(value);
  valueRef.current = value;
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const onPaste = (ev: ClipboardEvent) => {
      const text = ev.clipboardData?.getData("text/plain");
      if (!text || !text.trim()) {
        return;
      }
      ev.preventDefault();
      const prev = valueRef.current;
      onChange(
        prev ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${text}` : text,
      );
    };
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, [onChange]);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const text = e.dataTransfer.getData("text/plain");
      if (text) {
        const prev = valueRef.current;
        onChange(
          prev ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${text}` : text,
        );
        return;
      }
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("text/")) {
        void file.text().then((t) => {
          const prev = valueRef.current;
          onChange(prev ? `${prev}\n${t}` : t);
        });
      }
    },
    [onChange],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => {
        setDragOver(false);
      }}
      onDrop={onDrop}
      className={`rounded-2xl border-2 border-dashed transition-colors ${
        dragOver
          ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/40"
          : "border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30"
      }`}
    >
      <div className="p-4 pb-2">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Paste anywhere, drop text, or type below
        </p>
      </div>
      <div className="px-4 pb-4">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          disabled={disabled}
          rows={12}
          placeholder="Write a note…"
          className="min-h-[200px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 shadow-sm outline-none ring-violet-500/0 transition-shadow focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-400/20"
        />
        {error ? (
          <p
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Max ~256 KB · Plain text
          </p>
          <button
            type="button"
            disabled={disabled || !value.trim()}
            onClick={onSubmit}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
          >
            {disabled ? "Saving…" : "Create short link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryList(props: {
  entries: HistoryEntry[];
  onDeleteRemote: (id: string, deleteToken: string) => Promise<void>;
}) {
  const { entries, onDeleteRemote } = props;
  const [fetchedBody, setFetchedBody] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const missingIdsKey = useMemo(
    () =>
      entries
        .filter((e) => {
          return !e.content;
        })
        .map((e) => {
          return e.id;
        })
        .sort()
        .join(","),
    [entries],
  );

  useEffect(() => {
    if (!missingIdsKey) {
      return;
    }
    const missing = missingIdsKey.split(",");

    let cancelled = false;
    void (async () => {
      const results = await Promise.all(
        missing.map(async (id) => {
          const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
            credentials: "same-origin",
          });
          if (!res.ok) {
            return { id, content: null as string | null };
          }
          const data = (await res.json()) as { content?: string };
          return {
            id,
            content: typeof data.content === "string" ? data.content : null,
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
      window.setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      /* clipboard denied */
    }
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
                  onClick={() => {
                    void copyBody(e.id, body);
                  }}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {copiedId === e.id ? "Copied" : "Copy note"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onDeleteRemote(e.id, e.deleteToken);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <pre className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 font-mono text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">
              {body}
            </pre>
          </li>
        );
      })}
    </ul>
  );
}

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function SettingsPanel(props: {
  open: boolean;
  onClose: () => void;
  prefs: Preferences;
  onChange: (p: Partial<Preferences>) => void;
}) {
  const { open, onClose, prefs, onChange } = props;
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(ev) => {
          ev.stopPropagation();
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="settings-title"
            className="text-lg font-semibold tracking-tight"
          >
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Theme
            </p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    onChange({ theme: t.value });
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    prefs.theme === t.value
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={prefs.rememberHistory}
              onChange={(ev) => {
                onChange({ rememberHistory: ev.target.checked });
              }}
              className="mt-1 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Remember note history
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Stored only in this browser (ids and delete tokens).
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const { prefs, setPrefs } = usePreferences();
  const { entries, pushEntry, removeById, clear } = useNoteHistory(
    prefs.rememberHistory,
  );

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<{
    noteUrl: string;
    deleteUrl: string;
  } | null>(null);

  const submit = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const savedContent = draft.trim();
      const preview = previewFromContent(savedContent);
      const res = await createNoteRequest(draft);
      setLastCreated({ noteUrl: res.url, deleteUrl: res.deleteUrl });
      setDraft("");
      if (prefs.rememberHistory) {
        pushEntry({
          id: res.id,
          deleteToken: res.deleteToken,
          createdAt: Date.now(),
          preview,
          content: savedContent,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [draft, prefs.rememberHistory, pushEntry]);

  const handleDeleteRemote = useCallback(
    async (id: string, deleteToken: string) => {
      setError(null);
      try {
        await deleteNoteRequest(id, deleteToken);
        removeById(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [removeById],
  );

  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Foam Notes
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setSettingsOpen(true);
          }}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Settings
        </button>
      </header>

      <main className="space-y-10">
        {lastCreated ? (
          <ShareLinksCard
            noteUrl={lastCreated.noteUrl}
            deleteUrl={lastCreated.deleteUrl}
            onDismiss={() => {
              setLastCreated(null);
            }}
          />
        ) : null}

        <NoteComposer
          value={draft}
          onChange={setDraft}
          onSubmit={submit}
          disabled={busy}
          error={error}
        />

        <section aria-labelledby="history-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="history-heading"
                className="text-lg font-semibold text-zinc-900 dark:text-white"
              >
                This browser
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Full text is shown below. Delete removes the server copy; open a
                note page to copy the share link.
              </p>
            </div>
            {entries.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
              >
                Clear list
              </button>
            ) : null}
          </div>
          <HistoryList entries={entries} onDeleteRemote={handleDeleteRemote} />
        </section>
      </main>

      <footer className="mt-16 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500" />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
        }}
        prefs={prefs}
        onChange={setPrefs}
      />
    </div>
  );
}
