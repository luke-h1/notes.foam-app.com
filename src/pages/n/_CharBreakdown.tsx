import { useCallback, useState } from "react";
import {
  formatCharBreakdown,
  listCharEntries,
  type CharCategory,
} from "@/lib/char-breakdown";

type Props = {
  noteId: string;
};

const CATEGORY_CLASS: Record<CharCategory, string> = {
  digit:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  letter:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const CATEGORY_LABEL: Record<CharCategory, string> = {
  digit: "digit",
  letter: "letter",
  other: "other",
};

export function CharBreakdown({ noteId }: Props) {
  const [copied, setCopied] = useState(false);
  const entries = listCharEntries(noteId);
  const breakdown = formatCharBreakdown(noteId);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${noteId}\n\n${breakdown}`);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* clipboard denied */
    }
  }, [breakdown, noteId]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer list-none text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
        <span className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600">
          Spell out ID
        </span>
        <span className="ml-1 text-zinc-400 group-open:hidden dark:text-zinc-500">
          (0 vs o, 1 vs l)
        </span>
      </summary>
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-mono text-sm tracking-wide text-zinc-900 dark:text-zinc-100">
            {noteId}
          </p>
          <button
            type="button"
            onClick={() => {
              void copy();
            }}
            className="shrink-0 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <ol className="font-mono text-xs leading-relaxed">
          {entries.map((entry) => (
            <li
              key={entry.index}
              className="flex items-baseline gap-2 border-b border-zinc-100 py-1 last:border-0 dark:border-zinc-800/80"
            >
              <span className="w-6 shrink-0 tabular-nums text-zinc-400 dark:text-zinc-500">
                {entry.index}.
              </span>
              <span
                className="w-4 shrink-0 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                aria-hidden="true"
              >
                {entry.glyph}
              </span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${CATEGORY_CLASS[entry.category]}`}
              >
                {CATEGORY_LABEL[entry.category]}
              </span>
              <span className="min-w-0 text-zinc-700 dark:text-zinc-300">
                {entry.description}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
