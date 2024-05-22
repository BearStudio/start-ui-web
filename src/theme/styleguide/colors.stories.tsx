import { Box, Flex, FlexProps, HStack } from '@chakra-ui/react';

export default {
  title: 'StyleGuide/Colors',
};

const Color = ({ children, ...rest }: FlexProps) => (
  <Flex flex="1" h="16" p="2" {...rest}>
    <Box
      bg="white"
      display="inline-block"
      px="2"
      py="1"
      m="auto"
      fontSize="xs"
      fontWeight="bold"
      borderRadius="md"
    >
      {children}
    </Box>
  </Flex>
);

const Colors = ({ colorScheme = 'gray', ...rest }) => (
  <HStack
    spacing="0"
    overflow="hidden"
    boxShadow="lg"
    color={`${colorScheme}.700`}
    borderRadius="md"
    {...rest}
  >
    <Color bg={`${colorScheme}.50`}>50</Color>
    <Color bg={`${colorScheme}.100`}>100</Color>
    <Color bg={`${colorScheme}.200`}>200</Color>
    <Color bg={`${colorScheme}.300`}>300</Color>
    <Color bg={`${colorScheme}.400`}>400</Color>
    <Color bg={`${colorScheme}.500`}>500</Color>
    <Color bg={`${colorScheme}.600`}>600</Color>
    <Color bg={`${colorScheme}.700`}>700</Color>
    <Color bg={`${colorScheme}.800`}>800</Color>
    <Color bg={`${colorScheme}.900`}>900</Color>
    <Color bg={`${colorScheme}.950`}>950</Color>
  </HStack>
);

export const Brand = () => <Colors colorScheme="brand" />;

export const Gray = () => <Colors colorScheme="gray" />;

export const Error = () => <Colors colorScheme="error" />;

export const Warning = () => <Colors colorScheme="warning" />;

export const Success = () => <Colors colorScheme="success" />;
