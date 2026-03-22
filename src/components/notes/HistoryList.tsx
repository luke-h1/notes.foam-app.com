import type { HistoryEntry } from '../../types/history';

type Props = {
  entries: HistoryEntry[];
  onRemoveLocal: (id: string) => void;
  onDeleteRemote: (id: string, deleteToken: string) => Promise<void>;
};

export function HistoryList({
  entries,
  onRemoveLocal,
  onDeleteRemote,
}: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        No notes in this browser yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li
          key={e.id}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="min-w-0 flex-1">
            <a
              href={`/n/${e.id}`}
              className="font-mono text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              /n/{e.id}
            </a>
            <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {e.preview}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onRemoveLocal(e.id)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Forget
            </button>
            <button
              type="button"
              onClick={() => onDeleteRemote(e.id, e.deleteToken)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
