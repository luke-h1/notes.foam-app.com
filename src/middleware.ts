import { defineMiddleware } from 'astro:middleware';

import {
  applyContentSecurityPolicy,
  applyGlobalSecurityHeaders,
  applyNoIndex,
  applyPrivateNoStore,
} from './lib/security-headers';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const path = context.url.pathname;
  const headers = new Headers(response.headers);

  applyGlobalSecurityHeaders(headers);
  applyContentSecurityPolicy(headers, import.meta.env.DEV);

  if (path.startsWith('/n/') || path.startsWith('/api/')) {
    applyPrivateNoStore(headers);
  }

  if (path.startsWith('/n/')) {
    applyNoIndex(headers);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
