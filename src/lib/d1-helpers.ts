export function isUniqueConstraintError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';
  return (
    msg.includes('UNIQUE constraint') ||
    msg.includes('SQLITE_CONSTRAINT') ||
    msg.includes('constraint failed')
  );
}
