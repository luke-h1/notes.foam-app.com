import { useCallback, useState } from "react";
import { deleteNoteRequest } from "@/lib/client-api";

type Props = {
  noteId: string;
  initialToken: string | null;
};

export function DeleteNoteClient({ noteId, initialToken }: Props) {
  const [token, setToken] = useState(initialToken ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    const t = token.trim().replace(/\s+/g, "");
    if (!t) {
      setError("Paste your delete token or open the delete link you saved.");
      return;
    }
    setBusy(true);
    try {
      await deleteNoteRequest(noteId, t);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }, [noteId, token]);

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/40">
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
          Note deleted.
        </p>
        <a
          href="/"
          className="mt-3 inline-block text-sm text-violet-600 hover:underline dark:text-violet-400"
        >
          Create another
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {!initialToken ? (
        <div>
          <label
            htmlFor="delete-token"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Delete token
          </label>
          <input
            id="delete-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
            }}
            placeholder="From your delete link or history"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-violet-500/0 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Token loaded from your delete link. Confirm below to remove this note.
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          void submit();
        }}
        className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
      >
        {busy ? "Deleting…" : "Delete permanently"}
      </button>

      <p className="text-center text-sm">
        <a
          href={`/n/${noteId}`}
          className="text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancel, back to note
        </a>
      </p>
    </div>
  );
}
