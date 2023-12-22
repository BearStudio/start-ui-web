import { Box, Text } from '@chakra-ui/react';

import { env } from '@/env.mjs';

export const devEnvHintName =
  env.NEXT_PUBLIC_NODE_ENV === 'development'
    ? 'Development'
    : env.NEXT_PUBLIC_DEV_ENV_NAME;
export const devEnvHintColorScheme =
  env.NEXT_PUBLIC_NODE_ENV === 'development'
    ? 'warning'
    : env.NEXT_PUBLIC_DEV_ENV_COLOR_SCHEME ?? 'success';

export const isDevEnvHintVisible = !!devEnvHintName;

export const DevEnvHint = () => {
  if (!isDevEnvHintVisible) {
    return null;
  }

  return (
    <Box
      zIndex="9999"
      position="fixed"
      top="0"
      insetStart="0"
      insetEnd="0"
      h="2px"
      bg={`${devEnvHintColorScheme}.400`}
    >
      <Text
        position="fixed"
        top="0"
        insetStart="4"
        bg={`${devEnvHintColorScheme}.400`}
        color={`${devEnvHintColorScheme}.900`}
        fontSize="0.6rem"
        fontWeight="bold"
        px="1"
        borderBottomStartRadius="sm"
        borderBottomEndRadius="sm"
        textTransform="uppercase"
      >
        {devEnvHintName}
      </Text>
    </Box>
  );
};
