import React from 'react';

import { Button, Flex, Heading, Stack, Text, Wrap } from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import { LuAlertCircle, LuBookOpen, LuGithub } from 'react-icons/lu';

import { Logo } from '@/components/Logo';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';

export default function PageHome() {
  const { t } = useTranslation(['appHome']);

  return (
    <AppLayoutPage>
      <Stack flex={1} spacing={4}>
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
      </Stack>
    </AppLayoutPage>
  );
}
