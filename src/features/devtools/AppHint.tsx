import { Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { LuAppWindow, LuPanelLeftOpen, LuPencilRuler } from 'react-icons/lu';

import { env } from '@/env.mjs';
import { DevToolsDrawer } from '@/features/devtools/DevToolsDrawer';

export const getEnvHintTitlePrefix = () => {
  if (env.NEXT_PUBLIC_ENV_EMOJI) return `${env.NEXT_PUBLIC_ENV_EMOJI} `;
  if (env.NEXT_PUBLIC_ENV_NAME) return `[${env.NEXT_PUBLIC_ENV_NAME}] `;
  return '';
};

export const AppHint = () => {
  if (!env.NEXT_PUBLIC_ENV_NAME && !env.NEXT_PUBLIC_DEV_TOOLS_ENABLED) {
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
      <HStack
        position="fixed"
        top="0"
        insetStart="4"
        fontSize="0.6rem"
        fontWeight="bold"
        alignItems="start"
        textTransform="uppercase"
      >
        {env.NEXT_PUBLIC_ENV_NAME && <EnvHint />}
        {env.NEXT_PUBLIC_DEV_TOOLS_ENABLED && <DevToolsHint />}
      </HStack>
    </Box>
  );
};

const EnvHint = () => {
  return (
    <Text
      bg={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.400`}
      color={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.900`}
      px="1"
      borderBottomStartRadius="sm"
      borderBottomEndRadius="sm"
    >
      {env.NEXT_PUBLIC_ENV_NAME}
    </Text>
  );
};
const DevToolsHint = () => {
  const devToolsDrawer = useDisclosure();

  return (
    <>
      <Text
        as="button"
        fontWeight="bold"
        onClick={devToolsDrawer.onToggle}
        bg={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.400`}
        color={`${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.900`}
        px="1"
        borderBottomStartRadius="sm"
        borderBottomEndRadius="sm"
        textTransform="uppercase"
        display="flex"
        alignItems="center"
        gap="1"
      >
        <LuPanelLeftOpen />
        Dev helper
      </Text>
      <DevToolsDrawer disclosure={devToolsDrawer} />
    </>
  );
};
