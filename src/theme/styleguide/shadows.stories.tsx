import { Box, BoxProps, HStack } from '@chakra-ui/react';

export default {
  title: 'StyleGuide/Shadows',
};

const Shadow = ({ boxShadow, ...rest }: BoxProps) => (
  <Box
    px="4"
    py="2"
    bg="white"
    _dark={{ bg: 'gray.900' }}
    borderRadius="md"
    boxShadow={boxShadow}
    {...rest}
  >
    {boxShadow}
  </Box>
);

export const Custom = () => (
  <HStack>
    <Shadow boxShadow="card" />
    <Shadow boxShadow="layout" />
  </HStack>
);

export const Levels = () => (
  <HStack>
    <Shadow boxShadow="xs" />
    <Shadow boxShadow="sm" />
    <Shadow boxShadow="base" />
    <Shadow boxShadow="md" />
    <Shadow boxShadow="lg" />
    <Shadow boxShadow="xl" />
    <Shadow boxShadow="2xl" />
    <Shadow boxShadow="dark-lg" />
    <Shadow boxShadow="inner" />
  </HStack>
);
