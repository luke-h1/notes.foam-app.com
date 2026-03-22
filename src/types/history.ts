export type HistoryEntry = {
  id: string;
  deleteToken: string;
  createdAt: number;
  /** First line or truncated preview */
  preview: string;
};
