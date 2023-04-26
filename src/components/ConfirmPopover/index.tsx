import React, { ReactElement, ReactNode, useRef } from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverProps,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import FocusLock from 'react-focus-lock';
import { useTranslation } from 'react-i18next';

type ConfirmPopoverProps = PopoverProps & {
  isEnabled?: boolean;
  children: ReactElement;
  title?: ReactNode;
  message?: ReactNode;
  onConfirm(): void;
  confirmText?: ReactNode;
  confirmVariant?: string;
  cancelText?: ReactNode;
};

export const ConfirmPopover: React.FC<
  React.PropsWithChildren<ConfirmPopoverProps>
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
  const confirmPopover = useDisclosure();

  const displayHeading =
    !title && !message ? t('components:confirmPopover.heading') : title;

  const initialFocusRef = useRef<HTMLButtonElement>(null);

  if (!isEnabled) {
    const childrenWithOnClick = React.cloneElement(children, {
      onClick: onConfirm,
    });
    return <>{childrenWithOnClick}</>;
  }

  return (
    <>
      <Popover
        isLazy
        isOpen={confirmPopover.isOpen}
        onClose={confirmPopover.onClose}
        onOpen={confirmPopover.onOpen}
        initialFocusRef={initialFocusRef}
        {...rest}
      >
        <PopoverTrigger>{children}</PopoverTrigger>
        <Portal>
          <PopoverContent>
            <FocusLock returnFocus persistentFocus={false}>
              <PopoverArrow />
              <PopoverBody fontSize="sm">
                {displayHeading && (
                  <Heading size="sm" mb={message ? 1 : 0}>
                    {displayHeading}
                  </Heading>
                )}
                {message}
              </PopoverBody>
              <PopoverFooter>
                <ButtonGroup size="sm" justifyContent="space-between" w="full">
                  <Button onClick={confirmPopover.onClose}>
                    {cancelText ?? t('common:actions.cancel')}
                  </Button>
                  <Button
                    variant={confirmVariant}
                    onClick={() => {
                      onConfirm();
                      confirmPopover.onClose();
                    }}
                    ref={initialFocusRef}
                  >
                    {confirmText ?? t('components:confirmPopover.confirmText')}
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </FocusLock>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
};
