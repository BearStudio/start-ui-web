import * as Sentry from '@sentry/tanstackstart-react';

const dsn = process.env.VITE_SENTRY_DSN;
const tracesSampleRate = Number(
  process.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0'
);

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: Number.isFinite(tracesSampleRate)
      ? Math.min(Math.max(tracesSampleRate, 0), 1)
      : 0,
  });
}
