import React from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  ButtonGroup,
  Heading,
  Text,
} from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';

import { Page, PageContent } from '@/app/layout';
import { Icon } from '@/components';

export const PageDashboard = () => {
  const { t } = useTranslation();
  return (
    <Page>
      <PageContent>
        <Heading size="md" mb="4">
          {t('dashboard:title')}
        </Heading>
        <Alert status="success" borderRadius="md">
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
        <ButtonGroup mt="4" spacing="4">
          <Button
            variant="link"
            as="a"
            href="https://github.com/BearStudio/start-ui"
          >
            <Icon icon={FaGithub} me="1" /> {t('dashboard:links.github')}
          </Button>
          <Button
            variant="link"
            as="a"
            href="https://github.com/BearStudio/start-ui/issues/new"
          >
            <Icon icon={FiAlertCircle} me="1" />{' '}
            {t('dashboard:links.openIssue')}
          </Button>
        </ButtonGroup>
      </PageContent>
    </Page>
  );
};
