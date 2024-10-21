import {
  Button,
  ButtonProps,
  Divider,
  Flex,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/Icons';
import { toastCustom } from '@/components/Toast';
import {
  OAUTH_PROVIDERS,
  OAUTH_PROVIDERS_ENABLED_ARRAY,
  OAuthProvider,
} from '@/features/auth/oauth-config';
import { trpc } from '@/lib/trpc/client';

export const OAuthLoginButton = ({
  provider,
  ...rest
}: {
  provider: OAuthProvider;
} & ButtonProps) => {
  const { t } = useTranslation(['auth']);
  const router = useRouter();
  const loginWith = trpc.oauth.createAuthorizationUrl.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
    onError: (error) => {
      toastCustom({
        status: 'error',
        title: t('auth:login.feedbacks.oAuthError.title', {
          provider: OAUTH_PROVIDERS[provider].label,
        }),
        description: error.message,
      });
    },
  });

  return (
    <Button
      onClick={() => loginWith.mutate({ provider: provider })}
      isLoading={loginWith.isLoading || loginWith.isSuccess}
      leftIcon={<Icon icon={OAUTH_PROVIDERS[provider].icon} />}
      {...rest}
    >
      {OAUTH_PROVIDERS[provider].label}
    </Button>
  );
};

export const OAuthLoginButtonsGrid = () => {
  if (!OAUTH_PROVIDERS_ENABLED_ARRAY.length) return null;
  return (
    <SimpleGrid columns={2} gap={3}>
      {OAUTH_PROVIDERS_ENABLED_ARRAY.map(({ provider }) => {
        return (
          <OAuthLoginButton
            key={provider}
            provider={provider}
            _first={{
              gridColumn:
                OAUTH_PROVIDERS_ENABLED_ARRAY.length % 2 !== 0
                  ? 'span 2'
                  : undefined,
            }}
          />
        );
      })}
    </SimpleGrid>
  );
};

export const OAuthLoginDivider = () => {
  const { t } = useTranslation(['common']);
  if (!OAUTH_PROVIDERS_ENABLED_ARRAY.length) return null;
  return (
    <Flex alignItems="center" gap={2}>
      <Divider flex={1} />
      <Text fontSize="xs" color="text-dimmed" textTransform="uppercase">
        {t('common:or')}
      </Text>
      <Divider flex={1} />
    </Flex>
  );
};
