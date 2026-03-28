export function applyGlobalSecurityHeaders(headers: Headers): void {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  );
  headers.set('X-Frame-Options', 'DENY');
}

export function applyContentSecurityPolicy(headers: Headers, dev: boolean): void {
  if (dev) {return;}
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  headers.set('Content-Security-Policy', csp);
}

export function applyPrivateNoStore(headers: Headers): void {
  headers.set('Cache-Control', 'private, no-store');
}

export function applyNoIndex(headers: Headers): void {
  headers.set('X-Robots-Tag', 'noindex, nofollow');
}
