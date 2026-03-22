import { useCallback, useState } from 'react';

type Props = {
  noteUrl: string;
  noteId: string;
};

export function NoteCopyBar({ noteUrl, noteId }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(noteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [noteUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={`/n/${noteId}/delete`}
        className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete…
      </a>
    </div>
  );
}
