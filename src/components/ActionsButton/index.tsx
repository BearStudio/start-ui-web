import React, { FC } from 'react';

import { forwardRef, IconButton, IconButtonProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiMoreVertical } from 'react-icons/fi';

export interface ActionsButtonProps
  extends Omit<IconButtonProps, 'aria-label'> {
  label?: string;
}

export const ActionsButton: FC<ActionsButtonProps> = forwardRef(
  ({ label, ...rest }, ref: any) => {
    const { t } = useTranslation();
    return (
      <IconButton
        ref={ref}
        d="inline-flex"
        borderRadius="full"
        variant="ghost"
        color="inherit"
        colorScheme="gray"
        bg="transparent"
        opacity="0.5"
        _hover={{ opacity: 1, bg: 'rgba(0, 0, 0, 0.05)' }}
        _focus={{ opacity: 1, boxShadow: 'outline' }}
        _active={{ bg: 'rgba(0, 0, 0, 0.1)' }}
        icon={<FiMoreVertical />}
        aria-label={label ?? t('components:actionsButton.label')}
        {...rest}
      />
    );
  }
);

ActionsButton.displayName = 'ActionsButton';
