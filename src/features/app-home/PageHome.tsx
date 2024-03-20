import React from 'react';

import {
  Alert,
  AlertTitle,
  Button,
  Flex,
  Heading,
  Link,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import {
  LuAlertCircle,
  LuBookOpen,
  LuExternalLink,
  LuGithub,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { ADMIN_PATH } from '@/features/admin/constants';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';
import { MarketingBento } from '@/features/demo-mode/MarketingBento';
import { trpc } from '@/lib/trpc/client';

export default function PageHome() {
  const account = trpc.account.get.useQuery();
  const { t } = useTranslation(['appHome', 'account']);

  return (
    <AppLayoutPage>
      <Stack flex={1} spacing={6}>
        <Flex
          display={{ base: 'flex', md: 'none' }}
          py={2}
          alignItems="center"
          justifyContent="center"
        >
          <Logo />
        </Flex>

        <Stack>
          <Heading fontSize="lg">{t('appHome:welcome.title')}</Heading>
          <Text display="block">
            {t('appHome:welcome.description')}
            <br />
            <Text as="a" href="https://www.bearstudio.fr">
              <Trans t={t} i18nKey="appHome:welcome.author" />
            </Text>
          </Text>
        </Stack>

        <Wrap spacing="2">
          <Button
            size="sm"
            as="a"
            href="https://github.com/BearStudio/start-ui-web"
            leftIcon={<LuGithub />}
          >
            {t('appHome:links.github')}
          </Button>
          <Button
            size="sm"
            as="a"
            href="https://docs.web.start-ui.com"
            leftIcon={<LuBookOpen />}
          >
            {t('appHome:links.documentation')}
          </Button>
          <Button
            size="sm"
            as="a"
            href="https://github.com/BearStudio/start-ui/issues/new"
            leftIcon={<LuAlertCircle />}
          >
            {t('appHome:links.openIssue')}
          </Button>
        </Wrap>
        {account.isSuccess && account.data.authorizations.includes('ADMIN') && (
          <Alert as={LinkBox} colorScheme="brand">
            <AlertTitle flex="none">{t('account:admin.title')}</AlertTitle>
            <Link
              as={LinkOverlay}
              ms="auto"
              gap={2}
              display="inline-flex"
              href={ADMIN_PATH || '/'}
              target="_blank"
            >
              {t('account:admin.button')}
              <Icon icon={LuExternalLink} />
            </Link>
          </Alert>
        )}
        <MarketingBento />
      </Stack>
    </AppLayoutPage>
  );
}
