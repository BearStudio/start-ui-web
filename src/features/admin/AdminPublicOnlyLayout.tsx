'use client';

import { ReactNode } from 'react';

import { Box } from '@chakra-ui/react';

import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';
import { Viewport } from '@/components/Viewport';

type AdminPublicOnlyLayout = {
  children: ReactNode;
};

export const AdminPublicOnlyLayout = ({ children }: AdminPublicOnlyLayout) => {
  return (
    <Viewport bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <SlideIn>
        <Box px="4" py="4rem" w="22rem" maxW="full" m="auto">
          <Logo w="12rem" mb="8" mx="auto" />
          {children}
        </Box>
      </SlideIn>
    </Viewport>
  );
};
