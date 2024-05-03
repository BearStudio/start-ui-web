import { Box, Text } from '@chakra-ui/react';

import { env } from '@/env.mjs';

export const getEnvHintTitlePrefix = () => {
  if (env.NEXT_PUBLIC_ENV_EMOJI) return `${env.NEXT_PUBLIC_ENV_EMOJI} `;
  if (env.NEXT_PUBLIC_ENV_NAME) return `[${env.NEXT_PUBLIC_ENV_NAME}] `;
  return '';
};

export const EnvHint = () => {
  if (!env.NEXT_PUBLIC_ENV_NAME) {
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
      bg={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.400`}
    >
      <Text
        position="fixed"
        top="0"
        insetStart="4"
        bg={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.400`}
        color={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.900`}
        fontSize="0.6rem"
        fontWeight="bold"
        px="1"
        borderBottomStartRadius="sm"
        borderBottomEndRadius="sm"
        textTransform="uppercase"
      >
        {env.NEXT_PUBLIC_ENV_NAME}
      </Text>
    </Box>
  );
};
