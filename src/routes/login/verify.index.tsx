import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { LoginEmailOtpHint } from '@/app/devtools/presentation';
import { PageLoginVerify } from '@/modules/auth/presentation';

export const Route = createFileRoute('/login/verify/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
      email: z.email(),
    })
  ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return (
    <PageLoginVerify emailOtpHint={<LoginEmailOtpHint />} search={search} />
  );
}
