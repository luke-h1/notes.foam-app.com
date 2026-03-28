import { useCallback, useState } from "react";
import { normalizeClipboardUrl } from "@/lib/clipboard";

type Props = {
  noteUrl: string;
  deleteUrl: string;
  onDismiss: () => void;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(normalizeClipboardUrl(text));
    return true;
  } catch {
    return false;
  }
}

export function ShareLinksCard({ noteUrl, deleteUrl, onDismiss }: Props) {
  const [copied, setCopied] = useState<"note" | "delete" | null>(null);

  const handleCopy = useCallback(
    async (kind: "note" | "delete", text: string) => {
      const ok = await copyText(text);
      if (ok) {
        setCopied(kind);
        window.setTimeout(() => setCopied(null), 2000);
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
              onClick={() => handleCopy("note", noteUrl)}
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
              onClick={() => handleCopy("delete", deleteUrl)}
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
