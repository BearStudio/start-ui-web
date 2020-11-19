import React, { FC } from 'react';
import { IconButton, Icon, IconButtonProps } from '@chakra-ui/react';
import { DotsThreeVertical } from 'phosphor-react';

export interface ActionsButtonProps extends IconButtonProps {}

export const ActionsButton: FC<ActionsButtonProps> = React.forwardRef(
  ({ ...rest }, ref: any) => {
    return (
      <IconButton
        ref={ref}
        aria-label="Actions"
        icon={<Icon as={DotsThreeVertical} fontSize="1.5em" weight="bold" />}
        d="inline-flex"
        borderRadius="full"
        variant="ghost"
        {...rest}
      />
    );
  }
);
