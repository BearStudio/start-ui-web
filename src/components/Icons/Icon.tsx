import React, { FC } from 'react';

import {
  Box,
  Icon as ChakraIcon,
  IconProps as ChakraIconProps,
  BoxProps,
} from '@chakra-ui/react';

export interface IconProps extends BoxProps {
  icon: FC;
  iconProps?: ChakraIconProps;
}

export const Icon: FC<IconProps> = ({ icon: IconEl, iconProps, ...rest }) => {
  return (
    <Box
      as="span"
      d="inline-block"
      position="relative"
      w="1em"
      flex="none"
      _before={{
        content: '"."',
        visibility: 'hidden',
      }}
      {...rest}
    >
      <ChakraIcon
        as={IconEl}
        w="1em"
        h="1em"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        {...iconProps}
      />
    </Box>
  );
};
