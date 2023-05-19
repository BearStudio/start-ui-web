import React, { FC } from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

const ErrorFallback = ({ error }: FallbackProps) => {
  const errorModal = useDisclosure();
  const { t } = useTranslation(['components']);
  return (
    <Box p="4" m="auto">
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>{t('components:errorBoundary.title')}</AlertTitle>
          <AlertDescription display="block" lineHeight="1.4">
            <Button
              variant="link"
              size="sm"
              textDecoration="underline"
              onClick={errorModal.onOpen}
              color="red.800"
              _dark={{ color: 'red.100' }}
            >
              {t('components:errorBoundary.actions.expand')}
            </Button>
            <Modal isOpen={errorModal.isOpen} onClose={errorModal.onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{t('components:errorBoundary.title')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box fontFamily="monospace">{error.message}</Box>
                </ModalBody>
              </ModalContent>
            </Modal>
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export const ErrorBoundary: FC<React.PropsWithChildren<unknown>> = (props) => {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
};
