import { createRequestHandler } from '@remix-run/cloudflare-pages';

export const onRequest = createRequestHandler({
  getLoadContext() {
    // Whatever you return here will be passed as `context` to your loaders.
  },
});
