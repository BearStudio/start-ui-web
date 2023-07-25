import React, { useEffect } from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Code,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';

export const DemoModalInterceptor = ({ onClose }: { onClose: () => void }) => {
  const toast = useToast();

  const toastCloseAll = toast.closeAll;

  useEffect(() => {
    setTimeout(() => {
      toastCloseAll();
    });
  }, [toastCloseAll]);

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay style={{ backdropFilter: 'blur(6px)' }} />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>👋 Demo Mode</ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            <Text>
              This is a <strong>read-only demo</strong>, this action is
              disabled.
            </Text>
            <Stack>
              <Text>
                You can test the full app starter on your own with the following
                command:
              </Text>
              <Code
                as="pre"
                display="block"
                p={4}
                bg="gray.800"
                color="white"
                borderRadius="md"
                _dark={{
                  bg: 'gray.700',
                }}
              >
                npx create-start-ui@latest --web myApp
              </Code>
              <Text>
                You can also check the{' '}
                <Link href="http://web.start-ui.com" isExternal>
                  README.md
                </Link>{' '}
                for more information.
              </Text>
            </Stack>
            <Alert colorScheme="brand">
              <AlertIcon />
              <AlertTitle>Need help?</AlertTitle>
              <AlertDescription pb={2}>
                <Stack>
                  <Text>
                    Don&apos;t want to do it on your own? This starter is made
                    by the{' '}
                    <Link href="https://bearstudio.fr/en" isExternal>
                      BearStudio team
                    </Link>
                    , we will be happy to help you!{' '}
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      as="a"
                      href="mailto:start-ui@bearstudio.fr"
                      size="sm"
                      variant="@primary"
                    >
                      Get in touch
                    </Button>
                    <span>start-ui@bearstudio.fr</span>
                  </HStack>
                </Stack>
              </AlertDescription>
            </Alert>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
