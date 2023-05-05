import { Box, Text } from '@chakra-ui/react';

export const EnvDevHint = () => {
  const envName =
    process.env.NODE_ENV === 'development'
      ? 'Development'
      : process.env.NEXT_PUBLIC_DEV_ENV_NAME;
  const colorScheme =
    process.env.NODE_ENV === 'development'
      ? 'warning'
      : process.env.NEXT_PUBLIC_DEV_ENV_COLOR_SCHEME ?? 'success';

  if (!envName) {
    return null;
  }

  return (
    <Box
      zIndex="100"
      position="fixed"
      top="0"
      insetStart="0"
      insetEnd="0"
      h="2px"
      bg={`${colorScheme}.400`}
    >
      <Text
        position="fixed"
        top="0"
        insetStart="4"
        bg={`${colorScheme}.400`}
        color={`${colorScheme}.900`}
        fontSize="0.6rem"
        fontWeight="bold"
        px="1"
        borderBottomStartRadius="sm"
        borderBottomEndRadius="sm"
        textTransform="uppercase"
      >
        {envName}
      </Text>
    </Box>
  );
};
