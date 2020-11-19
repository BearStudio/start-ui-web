import React from 'react';
import { Text } from '@chakra-ui/react';

export const TextEllipsis = (props) => {
  return (
    <Text
      textOverflow="ellipsis"
      overflow="hidden"
      maxW="100%"
      whiteSpace="nowrap"
      {...props}
    />
  );
};
