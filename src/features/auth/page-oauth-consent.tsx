import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, CheckIcon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { OAUTH_SCOPES_I18N_KEYS } from '@/features/auth/oauth';
import { getOAuthConsent } from '@/features/auth/oauth-consent';

const oauthConsentQueryOptions = (oauthQuery: string) =>
  queryOptions({
    queryKey: ['oauth-consent', oauthQuery],
    queryFn: () => getOAuthConsent({ data: { oauthQuery } }),
  });

export default function PageOAuthConsent({
  oauthQuery,
}: {
  oauthQuery: string;
}) {
  const { t } = useTranslation(['auth']);

  const consent = useQuery(oauthConsentQueryOptions(oauthQuery));

  const submit = useMutation({
    mutationFn: async (accept: boolean) => {
      // The signed query of the page is sent by the oauthProviderClient plugin
      // and the response redirects back to the client
      const { error } = await authClient.oauth2.consent({ accept });
      if (error) throw new Error(error.message);
    },
    onError: () => toast.error(t('auth:pageOAuthConsent.error')),
  });

  if (consent.isPending) {
    return <Spinner full />;
  }

  if (consent.isError || !consent.data.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{t('auth:pageOAuthConsent.invalid.title')}</AlertTitle>
        <AlertDescription>
          {t('auth:pageOAuthConsent.invalid.description')}
        </AlertDescription>
      </Alert>
    );
  }

  const { client, redirectHost, scopes } = consent.data;
  const isSubmitting = submit.isPending || submit.isSuccess;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar size="lg">
          {!!client.logoUrl && <AvatarImage src={client.logoUrl} alt="" />}
          <AvatarFallback variant="initials" name={client.name} />
        </Avatar>
        <h1 className="text-2xl font-bold">
          {t('auth:pageOAuthConsent.title', { client: client.name })}
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          {t('auth:pageOAuthConsent.description', { client: client.name })}
        </p>
      </div>

      {scopes.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm">
          {scopes.map((scope) => (
            <li key={scope} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {scope in OAUTH_SCOPES_I18N_KEYS
                ? t(
                    `auth:pageOAuthConsent.scopes.${OAUTH_SCOPES_I18N_KEYS[scope as keyof typeof OAUTH_SCOPES_I18N_KEYS]}`
                  )
                : scope}
            </li>
          ))}
        </ul>
      )}

      {!!redirectHost && (
        <p className="text-xs text-balance wrap-break-word text-muted-foreground">
          <Trans
            t={t}
            i18nKey="auth:pageOAuthConsent.redirectHint"
            values={{ host: redirectHost }}
            components={{ b: <strong /> }}
          />
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          loading={isSubmitting && submit.variables === false}
          onClick={() => submit.mutate(false)}
        >
          {t('auth:pageOAuthConsent.deny')}
        </Button>
        <Button
          size="lg"
          disabled={isSubmitting}
          className="w-full"
          loading={isSubmitting && submit.variables === true}
          onClick={() => submit.mutate(true)}
        >
          {t('auth:pageOAuthConsent.allow')}
        </Button>
      </div>
    </div>
  );
}
