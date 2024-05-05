import { Flex, FlexProps } from '@chakra-ui/react';

export const Viewport = (props: FlexProps) => {
  return (
    <Flex
      direction="column"
      overflowX="hidden"
      overflowY="auto"
      minH="100vh"
      w="full"
      maxW="100vw"
      // Allows new units used if supported
      style={{
        maxWidth: '100dvw',
        minHeight: '100dvh',
      }}
      {...props}
    />
  );
};
