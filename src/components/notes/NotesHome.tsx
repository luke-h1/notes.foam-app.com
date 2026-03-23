import { useCallback, useState } from "react";

import { createNoteRequest, deleteNoteRequest } from "../../lib/client-api";
import { useNoteHistory, previewFromContent } from "../../hooks/useNoteHistory";
import { usePreferences } from "../../hooks/usePreferences";
import { HistoryList } from "./HistoryList";
import { NoteComposer } from "./NoteComposer";
import { SettingsPanel } from "./SettingsPanel";
import { ShareLinksCard } from "./ShareLinksCard";

export function NotesHome() {
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
      const preview = previewFromContent(draft);
      const res = await createNoteRequest(draft);
      setLastCreated({ noteUrl: res.url, deleteUrl: res.deleteUrl });
      setDraft("");
      if (prefs.rememberHistory) {
        pushEntry({
          id: res.id,
          deleteToken: res.deleteToken,
          createdAt: Date.now(),
          preview,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
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
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Short links for quick notes — share one URL, keep a private delete
            link.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
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
            onDismiss={() => setLastCreated(null)}
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
                Forget removes from the list. Delete removes the note from the
                server.
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
          <HistoryList
            entries={entries}
            onRemoveLocal={removeById}
            onDeleteRemote={handleDeleteRemote}
          />
        </section>
      </main>

      <footer className="mt-16 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <p>
          Self-hosted friendly ·{" "}
          <a
            href="https://developers.cloudflare.com/d1/"
            className="text-violet-600 hover:underline dark:text-violet-400"
          >
            Cloudflare D1
          </a>{" "}
          for storage
        </p>
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        onChange={setPrefs}
      />
    </div>
  );
}
