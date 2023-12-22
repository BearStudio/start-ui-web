'use client';

import { ErrorPage } from '@/components/ErrorPage';

export default function PageNotFound() {
  return <ErrorPage errorCode={404} />;
}
