import { useCallback, useEffect, useState } from "react";
import { deleteNoteRequest } from "@/lib/client-api";
import { normalizeClipboardUrl } from "@/lib/clipboard";
import {
  getDeleteTokenForNote,
  removeNoteFromHistory,
} from "@/lib/note-history-storage";

type Props = {
  noteUrl: string;
  noteId: string;
};

export function NoteCopyBar({ noteUrl, noteId }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setDeleteToken(getDeleteTokenForNote(noteId));
  }, [noteId]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(normalizeClipboardUrl(noteUrl));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [noteUrl]);

  const deleteNote = useCallback(async () => {
    if (!deleteToken) {
      return;
    }
    if (
      !window.confirm("Delete this note permanently? This cannot be undone.")
    ) {
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteNoteRequest(noteId, deleteToken);
      removeNoteFromHistory(noteId);
      window.location.assign("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [deleteToken, noteId]);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        {deleteToken ? (
          <button
            type="button"
            disabled={deleting}
            onClick={deleteNote}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {deleting ? "Deleting…" : "Delete note"}
          </button>
        ) : (
          <a
            href={`/n/${noteId}/delete`}
            className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete with token…
          </a>
        )}
      </div>
      {deleteError ? (
        <p
          className="text-right text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {deleteError}
        </p>
      ) : null}
    </div>
  );
}
