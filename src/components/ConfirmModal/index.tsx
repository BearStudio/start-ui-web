import React, { ReactElement, ReactNode, useRef } from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalProps,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type ConfirmModalProps = Omit<ModalProps, 'isOpen' | 'onClose'> & {
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

  const initialFocusRef = useRef<HTMLButtonElement>(null);

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
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.onClose}
        size="xs"
        initialFocusRef={initialFocusRef}
        {...rest}
      >
        <Portal>
          <ModalOverlay />
          <ModalContent>
            <ModalBody fontSize="sm">
              {displayHeading && (
                <Heading size="sm" mb={message ? 1 : 0}>
                  {displayHeading}
                </Heading>
              )}
              {message}
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={confirmModal.onClose}>
                  {cancelText ?? t('common:actions.cancel')}
                </Button>
                <Button
                  variant={confirmVariant}
                  onClick={() => {
                    onConfirm();
                    confirmModal.onClose();
                  }}
                  ref={initialFocusRef}
                >
                  {confirmText ?? t('components:confirmModal.confirmText')}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Portal>
      </Modal>
    </>
  );
};
