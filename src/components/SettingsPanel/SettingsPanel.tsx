import type { Preferences, ThemePreference } from "@/hooks/usePreferences";

type Props = {
  open: boolean;
  onClose: () => void;
  prefs: Preferences;
  onChange: (p: Partial<Preferences>) => void;
};

const themes: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsPanel({ open, onClose, prefs, onChange }: Props) {
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold tracking-tight">
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
              {themes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onChange({ theme: t.value })}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    prefs.theme === t.value
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
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
              onChange={(e) => onChange({ rememberHistory: e.target.checked })}
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
