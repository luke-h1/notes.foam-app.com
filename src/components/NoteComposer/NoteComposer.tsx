import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: string | null;
};

export function NoteComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
}: Props) {
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
    return () => window.removeEventListener("paste", onPaste);
  }, [onChange]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
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
      onDragLeave={() => setDragOver(false)}
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
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={12}
          placeholder="Write a note…"
          className="min-h-[200px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 shadow-sm outline-none ring-violet-500/0 transition-shadow focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-400/20"
        />
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
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
