export function getPublicOrigin(request: Request): string {
  const url = new URL(request.url);
  const cfVisitor = request.headers.get("cf-visitor");
  if (cfVisitor) {
    try {
      const parsed = JSON.parse(cfVisitor) as { scheme?: string };
      if (parsed.scheme === "http" || parsed.scheme === "https") {
        return `${parsed.scheme}://${url.host}`.trim();
      }
    } catch {}
  }
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto === "http" || forwardedProto === "https") {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
      url.host;
    return `${forwardedProto}://${host}`.trim();
  }
  return url.origin.trim();
}
