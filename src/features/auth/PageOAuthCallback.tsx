import React, { useEffect, useRef } from 'react';

import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { LoaderFull } from '@/components/LoaderFull';
import { useToastError } from '@/components/Toast';
import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';
import { ROUTES_AUTH } from '@/features/auth/routes';
import { zOAuthProvider } from '@/lib/oauth/config';
import { trpc } from '@/lib/trpc/client';

export default function PageOAuthCallback() {
  const { i18n, t } = useTranslation(['auth']);
  const toastError = useToastError();
  const router = useRouter();
  const isTriggeredRef = useRef(false);
  const params = z
    .object({ provider: zOAuthProvider() })
    .safeParse(useParams());
  const searchParams = z
    .object({ code: z.string(), state: z.string() })
    .safeParse({
      code: useSearchParams().get('code'),
      state: useSearchParams().get('state'),
    });
  const validateLogin = trpc.oauth.validateLogin.useMutation({
    onSuccess: (data) => {
      if (data.account.authorizations.includes('ADMIN')) {
        router.replace(ROUTES_ADMIN.root());
        return;
      }
      router.replace(ROUTES_APP.root());
    },
    onError: () => {
      toastError({ title: t('auth:login.feedbacks.loginError.title') });
      router.replace(ROUTES_AUTH.login());
    },
  });

  useEffect(() => {
    const trigger = () => {
      if (isTriggeredRef.current) return;
      isTriggeredRef.current = true;

      if (!(params.success && searchParams.success)) {
        notFound();
      }

      validateLogin.mutate({
        provider: params.data.provider,
        code: searchParams.data.code,
        state: searchParams.data.state,
        language: i18n.language,
      });
    };
    trigger();
  }, [validateLogin, params, searchParams, i18n]);

  return <LoaderFull />;
}
