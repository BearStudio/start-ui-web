import React, { ReactElement } from 'react';

import { Center, Heading, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/Logo';

import { Illustration403 } from './Illustration403';
import { Illustration404 } from './Illustration404';
import { IllustrationDefault } from './IllustrationDefault';

const SupportedErrors: Record<
  'default' | 403 | 404,
  { illustration?: ReactElement }
> = {
  default: { illustration: <IllustrationDefault /> },
  403: { illustration: <Illustration403 /> },
  404: { illustration: <Illustration404 /> },
};

export const ErrorPage = ({ errorCode }: { errorCode?: number }) => {
  const { t } = useTranslation(['components']);
  const errorType =
    errorCode && errorCode in SupportedErrors
      ? (errorCode as keyof typeof SupportedErrors)
      : 'default';
  const illustration =
    SupportedErrors[errorType].illustration ??
    SupportedErrors.default.illustration ??
    null;

  return (
    <Center flex="1" p="8">
      <Stack
        direction={{ base: 'column-reverse', md: 'row' }}
        align="center"
        spacing={4}
      >
        {illustration}
        <Stack
          textAlign={{ base: 'center', md: 'left' }}
          alignItems={{ base: 'center', md: 'flex-start' }}
        >
          <Link href="/">
            <Logo my={4} />
          </Link>
          <Heading>{t(`components:errorPage.${errorType}.title`)}</Heading>
          <Text>{t(`components:errorPage.${errorType}.description`)}</Text>
          {!!errorCode && (
            <Text
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              fontSize="sm"
              mt={4}
            >
              {t(`components:errorPage.errorCode`, {
                code: errorCode,
              })}
            </Text>
          )}
        </Stack>
      </Stack>
    </Center>
  );
};
