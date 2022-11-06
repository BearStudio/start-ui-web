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
import { Icon } from '@/components/Icons';

export const Gnosis = () => {
  const { t } = useTranslation();
  return (
    <Page>
      <PageContent>
        <Heading size="md" mb="4">
          ZAP 🫠 Zero Awareness Protocol{' '}
        </Heading>
        <Alert status="success" colorScheme="brand" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="lg">
              <br />
              <br />
              "Putting the WTF back in web3"{' '}
            </AlertTitle>
            <br />
            <AlertDescription display="block">
              Drive attention to your protocol with Easter eggs and more! <br />
              <br />
            </AlertDescription>

            <br />
            <br />
          </Box>
          <br />
          <br />
        </Alert>
        <ButtonGroup mt="4" spacing="4">
          <Button variant="link" as="a" href="https://github.com/">
            <Icon icon={FaGithub} me="1" /> {t('dashboard:links.github')}
          </Button>
          <Button variant="link" as="a" href="https://github.com/issues/new">
            <Icon icon={FiAlertCircle} me="1" />{' '}
            {t('dashboard:links.openIssue')}
          </Button>
        </ButtonGroup>
      </PageContent>
    </Page>
  );
};
