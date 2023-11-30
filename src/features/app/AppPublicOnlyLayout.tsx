'use client';

import { ReactNode } from 'react';

import { Box, Center, Flex } from '@chakra-ui/react';

import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';

type AppPublicOnlyLayout = {
  children: ReactNode;
};

export const AppPublicOnlyLayout = ({ children }: AppPublicOnlyLayout) => {
  return (
    <Flex flex={1} minW={0}>
      <Center
        flex={1}
        display={{ base: 'none', md: 'flex' }}
        color="white"
        bg="gray.900"
        _dark={{
          bg: 'gray.800',
        }}
      >
        <Logo w="16rem" mb="8" mx="auto" />
      </Center>
      <Flex flex={1} minW={0} bg="gray.50" _dark={{ bg: 'gray.900' }}>
        <SlideIn>
          <Box px="4" py="4rem" w="22rem" maxW="full" m="auto">
            <Logo
              w="12rem"
              mb="8"
              mx="auto"
              display={{ base: 'block', md: 'none' }}
            />
            {children}
          </Box>
        </SlideIn>
      </Flex>
    </Flex>
  );
};
