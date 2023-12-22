import React, { ReactElement, ReactNode } from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { SheetModal, SheetModalProps } from '@/components/SheetModal';

type ConfirmModalProps = Omit<SheetModalProps, 'isOpen' | 'onClose'> & {
  isEnabled?: boolean;
  children: ReactElement;
  title?: ReactNode;
  message?: ReactNode;
  onConfirm(): void;
  confirmText?: ReactNode;
  confirmVariant?: string;
  cancelText?: ReactNode;
};

export const ConfirmModal: React.FC<
  React.PropsWithChildren<ConfirmModalProps>
> = ({
  isEnabled = true,
  children,
  title,
  message,
  onConfirm,
  confirmText,
  confirmVariant = '@primary',
  cancelText,
  ...rest
}) => {
  const { t } = useTranslation(['common', 'components']);
  const confirmModal = useDisclosure();

  const displayHeading =
    !title && !message ? t('components:confirmModal.heading') : title;

  if (!isEnabled) {
    const childrenWithOnClick = React.cloneElement(children, {
      onClick: onConfirm,
    });
    return <>{childrenWithOnClick}</>;
  }

  const childrenWithOnOpen = React.cloneElement(children, {
    onClick: confirmModal.onOpen,
  });

  return (
    <>
      {childrenWithOnOpen}
      <SheetModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.onClose}
        {...rest}
      >
        <Stack spacing={4}>
          <Stack>
            {displayHeading && (
              <Heading size="sm" mb={message ? 1 : 0}>
                {displayHeading}
              </Heading>
            )}
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
              {message}
            </Text>
          </Stack>

          <ButtonGroup
            justifyContent="space-between"
            w="full"
            spacing={0}
            gap={4}
            size={{ base: 'lg', sm: 'md' }}
            flexDirection={{ base: 'column-reverse', sm: 'row' }}
          >
            <Button onClick={confirmModal.onClose}>
              {cancelText ?? t('common:actions.cancel')}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={() => {
                onConfirm();
                confirmModal.onClose();
              }}
            >
              {confirmText ?? t('components:confirmModal.confirmText')}
            </Button>
          </ButtonGroup>
        </Stack>
      </SheetModal>
    </>
  );
};
