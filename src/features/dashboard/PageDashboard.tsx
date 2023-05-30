import React from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Heading,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import { LuAlertCircle, LuBookOpen, LuGithub } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Page, PageContent } from '@/components/Page';

export default function PageDashboard() {
  const { t } = useTranslation(['dashboard']);
  return (
    <Page>
      <PageContent>
        <Heading size="md" mb="4">
          {t('dashboard:title')}
        </Heading>
        <Alert status="success" colorScheme="brand" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="lg">
              {t('dashboard:welcome.title')}
            </AlertTitle>
            <AlertDescription display="block">
              {t('dashboard:welcome.description')}
              <br />
              <Text as="a" href="https://www.bearstudio.fr">
                <Trans t={t} i18nKey="dashboard:welcome.author" />
              </Text>
            </AlertDescription>
          </Box>
        </Alert>
        <Wrap mt="4" spacing="4">
          <Button
            variant="link"
            as="a"
            href="https://github.com/BearStudio/start-ui"
          >
            <Icon icon={LuGithub} me="1" /> {t('dashboard:links.github')}
          </Button>
          <Button variant="link" as="a" href="https://docs.web.start-ui.com">
            <Icon icon={LuBookOpen} me="1" />{' '}
            {t('dashboard:links.documentation')}
          </Button>
          <Button
            variant="link"
            as="a"
            href="https://github.com/BearStudio/start-ui/issues/new"
          >
            <Icon icon={LuAlertCircle} me="1" />{' '}
            {t('dashboard:links.openIssue')}
          </Button>
        </Wrap>
      </PageContent>
    </Page>
  );
}
