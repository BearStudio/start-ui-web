'use client';

import { ErrorPage } from '@/components/ErrorPage';

export default function Error({
  reset,
  error,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorPage />;
}
