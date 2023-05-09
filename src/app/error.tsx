'use client';

import { ErrorPage } from '@/components/ErrorPage';

export default function Error({}: { error: Error; reset: () => void }) {
  return <ErrorPage />;
}
