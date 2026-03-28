export function normalizeClipboardUrl(value: string): string {
  return value.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export function normalizeClipboardNoteBody(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\r\n/g, "\n");
}
