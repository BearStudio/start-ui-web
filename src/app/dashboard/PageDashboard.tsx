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

export const PageDashboard = () => {
  const { t } = useTranslation();
  return (
    <Page>
      <PageContent>
        <Alert status="success" colorScheme="orange" borderRadius="100">
          <Box flex="1">
            <AlertTitle fontSize="xl">
              <br />
              <br />
            </AlertTitle>{' '}
            <Heading size="xl" mb="4">
              . . . . . 🫠 Zero Awareness Protocol{' '}
            </Heading>
            <br />
          </Box>
          <br />
          <br />
        </Alert>
        <br />☞ <i>ANON:</i> Nostalgic for the wacky Web3 days of yore? Make
        blockchain fun again and drive attention to your protocol with obscured
        Easter eggs and more! <br />
        <br />
        <Alert status="success" colorScheme="brand" borderRadius="md">
          {/* <AlertIcon /> */}
          <Box flex="1">
            {/* <AlertTitle fontSize="lg"><br/>
            <br/>

"Putting the WTF back in web3"            </AlertTitle> */}
            <AlertDescription display="block">
              <ButtonGroup mt="4" spacing="4">
                <Button colorScheme="teal" as="a" href="/app/admin/users">
                  + An on-chain Time-bomb 💣
                </Button>
                <Button colorScheme="orange" as="a" href="/app/admin/users">
                  + Refund double gas fee 🧧
                </Button>
              </ButtonGroup>

              <ButtonGroup mt="4" spacing="4">
                <Button colorScheme="purple" as="a" href="/app/admin/users">
                  + Unlock from real-world events 🔮
                </Button>
                <Button colorScheme="pink" as="a" href="/app/admin/users">
                  + A birthday surprise 🎂
                </Button>
              </ButtonGroup>
            </AlertDescription>

            <br />
          </Box>
        </Alert>
        <br />
        <br />
        Built with Cartesi
        <br />
        <ButtonGroup mt="4" spacing="4">
          <Button variant="link" as="a" href="https://github.com/">
            <Icon icon={FaGithub} me="1" /> {t('dashboard:links.github')}
          </Button>
          <Button variant="link" as="a" href="https://github.com/issues/new">
            <Icon icon={FiAlertCircle} me="1" />{' '}
            {t('dashboard:links.openIssue')}
          </Button>
        </ButtonGroup>
        <br />
        <img src="https://media.discordapp.net/attachments/1038522692996956210/1038693844054724718/zaP_main_function.drawio.png" />
      </PageContent>
    </Page>
  );
};
