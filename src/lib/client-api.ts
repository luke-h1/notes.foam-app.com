export type CreateNoteResponse = {
  id: string;
  deleteToken: string;
  url: string;
  deleteUrl: string;
};

export type ApiErrorBody = { error?: string };

export async function createNoteRequest(
  content: string,
): Promise<CreateNoteResponse> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = (await res.json().catch(() => ({}))) as
    | CreateNoteResponse
    | ApiErrorBody;
  if (!res.ok) {
    const msg =
      typeof (data as ApiErrorBody).error === 'string'
        ? (data as ApiErrorBody).error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as CreateNoteResponse;
}

export async function deleteNoteRequest(
  id: string,
  deleteToken: string,
): Promise<void> {
  const q = new URLSearchParams({ token: deleteToken });
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}?${q}`, {
    method: 'DELETE',
  });
  if (res.status === 204) return;
  const data = (await res.json().catch(() => ({}))) as ApiErrorBody;
  const msg =
    typeof data.error === 'string' ? data.error : `Delete failed (${res.status})`;
  throw new Error(msg);
}
